use cms::{
    cert::{x509::certificate::Certificate, CertificateChoices},
    content_info::ContentInfo,
    signed_data::{SignedData, SignerIdentifier},
};
use der::{Decode, Encode};
use plist::{Dictionary, Value};
use serde::Serialize;
use std::io::Cursor;
use tauri::command;

const MAX_PROFILE_BYTES: usize = 5 * 1024 * 1024;
const CMS_SIGNED_DATA_OID: &str = "1.2.840.113549.1.7.2";
const CMS_ENVELOPED_DATA_OID: &str = "1.2.840.113549.1.7.3";
const CMS_ENCRYPTED_DATA_OID: &str = "1.2.840.113549.1.7.6";
const CMS_AUTH_ENVELOPED_DATA_OID: &str = "1.2.840.113549.1.9.16.1.23";

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum MobileConfigFormat {
    Xml,
    BinaryPlist,
    SignedCms,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum MobileConfigSignatureStatus {
    Unsigned,
    SignedUnverified,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileConfigSignerInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    common_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    organization: Option<String>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum MobileConfigDecodeFailureReason {
    FileTooLarge,
    InvalidProfile,
    InvalidCms,
    EncryptedProfileUnsupported,
    MissingPayloadContent,
    MissingCaldavPayload,
    InvalidCaldavPayload,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecodedMobileConfigCalDavPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    account_description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    hostname: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    port: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    use_ssl: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    principal_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    payload_identifier: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    payload_uuid: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecodedMobileConfig {
    format: MobileConfigFormat,
    signature: MobileConfigSignatureStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    signer: Option<MobileConfigSignerInfo>,
    caldav_payloads: Vec<DecodedMobileConfigCalDavPayload>,
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
pub enum MobileConfigDecodeResult {
    Success {
        ok: bool,
        profile: DecodedMobileConfig,
    },
    Failure {
        ok: bool,
        reason: MobileConfigDecodeFailureReason,
    },
}

impl MobileConfigDecodeResult {
    fn success(profile: DecodedMobileConfig) -> Self {
        Self::Success { ok: true, profile }
    }

    fn failure(reason: MobileConfigDecodeFailureReason) -> Self {
        Self::Failure { ok: false, reason }
    }
}

fn optional_string(
    dictionary: &Dictionary,
    key: &str,
) -> Result<Option<String>, MobileConfigDecodeFailureReason> {
    match dictionary.get(key) {
        Some(Value::String(value)) => Ok(Some(value.clone())),
        Some(_) => Err(MobileConfigDecodeFailureReason::InvalidCaldavPayload),
        None => Ok(None),
    }
}

fn optional_port(dictionary: &Dictionary) -> Result<Option<u16>, MobileConfigDecodeFailureReason> {
    match dictionary.get("CalDAVPort") {
        Some(Value::Integer(value)) => value
            .as_unsigned()
            .and_then(|port| u16::try_from(port).ok())
            .map(Some)
            .ok_or(MobileConfigDecodeFailureReason::InvalidCaldavPayload),
        Some(_) => Err(MobileConfigDecodeFailureReason::InvalidCaldavPayload),
        None => Ok(None),
    }
}

fn optional_boolean(
    dictionary: &Dictionary,
    key: &str,
) -> Result<Option<bool>, MobileConfigDecodeFailureReason> {
    match dictionary.get(key) {
        Some(Value::Boolean(value)) => Ok(Some(*value)),
        Some(_) => Err(MobileConfigDecodeFailureReason::InvalidCaldavPayload),
        None => Ok(None),
    }
}

fn decode_caldav_payload(
    dictionary: &Dictionary,
) -> Result<DecodedMobileConfigCalDavPayload, MobileConfigDecodeFailureReason> {
    Ok(DecodedMobileConfigCalDavPayload {
        account_description: optional_string(dictionary, "CalDAVAccountDescription")?,
        hostname: optional_string(dictionary, "CalDAVHostName")?,
        port: optional_port(dictionary)?,
        use_ssl: optional_boolean(dictionary, "CalDAVUseSSL")?,
        username: optional_string(dictionary, "CalDAVUsername")?,
        password: optional_string(dictionary, "CalDAVPassword")?,
        principal_url: optional_string(dictionary, "CalDAVPrincipalURL")?,
        payload_identifier: optional_string(dictionary, "PayloadIdentifier")?,
        payload_uuid: optional_string(dictionary, "PayloadUUID")?,
    })
}

fn decode_payloads(
    value: Value,
    format: MobileConfigFormat,
    signature: MobileConfigSignatureStatus,
    signer: Option<MobileConfigSignerInfo>,
) -> Result<DecodedMobileConfig, MobileConfigDecodeFailureReason> {
    let Value::Dictionary(profile) = value else {
        return Err(MobileConfigDecodeFailureReason::InvalidProfile);
    };

    let Some(Value::Array(payload_content)) = profile.get("PayloadContent") else {
        return Err(MobileConfigDecodeFailureReason::MissingPayloadContent);
    };

    let mut caldav_payloads = Vec::new();
    for payload in payload_content {
        let Value::Dictionary(dictionary) = payload else {
            continue;
        };
        if dictionary.get("PayloadType").and_then(Value::as_string)
            != Some("com.apple.caldav.account")
        {
            continue;
        }
        caldav_payloads.push(decode_caldav_payload(dictionary)?);
    }

    if caldav_payloads.is_empty() {
        return Err(MobileConfigDecodeFailureReason::MissingCaldavPayload);
    }

    Ok(DecodedMobileConfig {
        format,
        signature,
        signer,
        caldav_payloads,
    })
}

fn directory_string_value(
    value: der::Result<Option<cms::cert::x509::ext::pkix::name::DirectoryString>>,
) -> Option<String> {
    value.ok().flatten().map(|value| value.value().into_owned())
}

fn certificate_signer_info(certificate: &Certificate) -> MobileConfigSignerInfo {
    let subject = certificate.tbs_certificate().subject();

    MobileConfigSignerInfo {
        common_name: directory_string_value(subject.common_name()),
        organization: directory_string_value(subject.organization()),
    }
}

fn certificate_matches_signer(certificate: &Certificate, signer_id: &SignerIdentifier) -> bool {
    let tbs = certificate.tbs_certificate();
    match signer_id {
        SignerIdentifier::IssuerAndSerialNumber(issuer_and_serial) => {
            tbs.issuer() == &issuer_and_serial.issuer
                && tbs.serial_number() == &issuer_and_serial.serial_number
        }
        SignerIdentifier::SubjectKeyIdentifier(subject_key_identifier) => {
            match tbs.get_extension::<cms::cert::x509::ext::pkix::SubjectKeyIdentifier>() {
                Ok(Some((_critical, certificate_subject_key_identifier))) => {
                    &certificate_subject_key_identifier == subject_key_identifier
                }
                _ => false,
            }
        }
    }
}

fn extract_signer_info(signed_data: &SignedData) -> Option<MobileConfigSignerInfo> {
    let certificates = signed_data.certificates.as_ref()?;
    let signer_id = &signed_data.signer_infos.as_ref().as_slice().first()?.sid;

    certificates
        .as_ref()
        .as_slice()
        .iter()
        .filter_map(|choice| match choice {
            CertificateChoices::Certificate(certificate) => Some(certificate),
            CertificateChoices::Other(_) => None,
        })
        .find(|certificate| certificate_matches_signer(certificate, signer_id))
        .or_else(|| {
            certificates
                .as_ref()
                .as_slice()
                .iter()
                .find_map(|choice| match choice {
                    CertificateChoices::Certificate(certificate) => Some(certificate),
                    CertificateChoices::Other(_) => None,
                })
        })
        .map(certificate_signer_info)
}

fn decode_signed_cms(
    data: &[u8],
) -> Result<(Value, Option<MobileConfigSignerInfo>), MobileConfigDecodeFailureReason> {
    let content_info =
        ContentInfo::from_ber(data).map_err(|_| MobileConfigDecodeFailureReason::InvalidCms)?;
    let content_type = content_info.content_type.to_string();

    if matches!(
        content_type.as_str(),
        CMS_ENVELOPED_DATA_OID | CMS_ENCRYPTED_DATA_OID | CMS_AUTH_ENVELOPED_DATA_OID
    ) {
        return Err(MobileConfigDecodeFailureReason::EncryptedProfileUnsupported);
    }
    if content_type != CMS_SIGNED_DATA_OID {
        return Err(MobileConfigDecodeFailureReason::InvalidCms);
    }

    let content_bytes = content_info
        .content
        .to_der()
        .map_err(|_| MobileConfigDecodeFailureReason::InvalidCms)?;
    let signed_data = SignedData::from_ber(&content_bytes)
        .map_err(|_| MobileConfigDecodeFailureReason::InvalidCms)?;
    let decoded_bytes = signed_data
        .encap_content_info
        .econtent
        .as_ref()
        .ok_or(MobileConfigDecodeFailureReason::InvalidCms)?;
    let signer = extract_signer_info(&signed_data);

    let value = plist::from_reader(Cursor::new(decoded_bytes.value()))
        .map_err(|_| MobileConfigDecodeFailureReason::InvalidProfile)?;

    Ok((value, signer))
}

fn decode(data: &[u8]) -> Result<DecodedMobileConfig, MobileConfigDecodeFailureReason> {
    if data.is_empty() {
        return Err(MobileConfigDecodeFailureReason::InvalidProfile);
    }
    if data.len() > MAX_PROFILE_BYTES {
        return Err(MobileConfigDecodeFailureReason::FileTooLarge);
    }

    if let Ok(value) = plist::from_reader(Cursor::new(data)) {
        let format = if data.starts_with(b"bplist00") {
            MobileConfigFormat::BinaryPlist
        } else {
            MobileConfigFormat::Xml
        };
        return decode_payloads(value, format, MobileConfigSignatureStatus::Unsigned, None);
    }

    if !data.starts_with(&[0x30]) {
        return Err(MobileConfigDecodeFailureReason::InvalidProfile);
    }

    let (value, signer) = decode_signed_cms(data)?;
    decode_payloads(
        value,
        MobileConfigFormat::SignedCms,
        MobileConfigSignatureStatus::SignedUnverified,
        signer,
    )
}

#[command]
pub fn decode_mobile_config(data: Vec<u8>) -> MobileConfigDecodeResult {
    match decode(&data) {
        Ok(profile) => MobileConfigDecodeResult::success(profile),
        Err(reason) => MobileConfigDecodeResult::failure(reason),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const XML: &[u8] = include_bytes!("../../../src/tests/fixtures/mobileconfig/typical.xml");
    const BINARY: &[u8] =
        include_bytes!("../../../src/tests/fixtures/mobileconfig/typical.binary.plist");
    const SIGNED: &[u8] =
        include_bytes!("../../../src/tests/fixtures/mobileconfig/typical.signed.der");
    const ENCRYPTED: &[u8] =
        include_bytes!("../../../src/tests/fixtures/mobileconfig/typical.encrypted.der");

    fn unwrap_success(result: MobileConfigDecodeResult) -> DecodedMobileConfig {
        match result {
            MobileConfigDecodeResult::Success { profile, .. } => profile,
            MobileConfigDecodeResult::Failure { reason, .. } => {
                panic!("expected successful decode, got {reason:?}")
            }
        }
    }

    fn unwrap_failure(result: MobileConfigDecodeResult) -> MobileConfigDecodeFailureReason {
        match result {
            MobileConfigDecodeResult::Failure { reason, .. } => reason,
            MobileConfigDecodeResult::Success { profile, .. } => {
                panic!("expected decode failure, got {profile:?}")
            }
        }
    }

    fn profile_with_payloads(payloads: &str) -> Vec<u8> {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>PayloadContent</key><array>{payloads}</array></dict></plist>"#
        )
        .into_bytes()
    }

    #[test]
    fn decodes_xml_profile_fields() {
        let profile = unwrap_success(decode_mobile_config(XML.to_vec()));

        assert_eq!(profile.format, MobileConfigFormat::Xml);
        assert_eq!(profile.signature, MobileConfigSignatureStatus::Unsigned);
        assert_eq!(profile.caldav_payloads.len(), 1);
        assert_eq!(
            profile.caldav_payloads[0].hostname.as_deref(),
            Some("caldav.example.test")
        );
        assert_eq!(profile.caldav_payloads[0].port, Some(8443));
        assert_eq!(profile.caldav_payloads[0].use_ssl, Some(true));
        assert_eq!(
            profile.caldav_payloads[0].principal_url.as_deref(),
            Some("/principals/alice/")
        );
    }

    #[test]
    fn decodes_binary_plist() {
        let profile = unwrap_success(decode_mobile_config(BINARY.to_vec()));

        assert_eq!(profile.format, MobileConfigFormat::BinaryPlist);
        assert_eq!(profile.caldav_payloads[0].port, Some(8443));
    }

    #[test]
    fn decodes_signed_cms_without_claiming_verification() {
        let profile = unwrap_success(decode_mobile_config(SIGNED.to_vec()));

        assert_eq!(profile.format, MobileConfigFormat::SignedCms);
        assert_eq!(
            profile.signature,
            MobileConfigSignatureStatus::SignedUnverified
        );
        assert_eq!(
            profile.caldav_payloads[0].username.as_deref(),
            Some("alice")
        );
        assert_eq!(
            profile
                .signer
                .as_ref()
                .and_then(|signer| signer.common_name.as_deref()),
            Some("Chiri MobileConfig Test Fixture")
        );
    }

    #[test]
    fn recognizes_encrypted_cms() {
        assert_eq!(
            unwrap_failure(decode_mobile_config(ENCRYPTED.to_vec())),
            MobileConfigDecodeFailureReason::EncryptedProfileUnsupported
        );
    }

    #[test]
    fn rejects_oversized_profiles_before_parsing() {
        assert_eq!(
            unwrap_failure(decode_mobile_config(vec![0; MAX_PROFILE_BYTES + 1])),
            MobileConfigDecodeFailureReason::FileTooLarge
        );
    }

    #[test]
    fn reports_invalid_profiles() {
        assert_eq!(
            unwrap_failure(decode_mobile_config(b"not a profile".to_vec())),
            MobileConfigDecodeFailureReason::InvalidProfile
        );
    }

    #[test]
    fn returns_every_caldav_payload_without_applying_defaults() {
        let data = profile_with_payloads(
            r#"<dict>
                <key>PayloadType</key><string>com.apple.caldav.account</string>
                <key>CalDAVHostName</key><string>one.example.test</string>
            </dict>
            <dict>
                <key>PayloadType</key><string>com.apple.caldav.account</string>
                <key>CalDAVHostName</key><string>two.example.test</string>
                <key>CalDAVUseSSL</key><false/>
            </dict>"#,
        );
        let profile = unwrap_success(decode_mobile_config(data));

        assert_eq!(profile.caldav_payloads.len(), 2);
        assert_eq!(profile.caldav_payloads[0].use_ssl, None);
        assert_eq!(profile.caldav_payloads[1].use_ssl, Some(false));
    }

    #[test]
    fn reports_missing_payload_content_and_caldav_payloads() {
        assert_eq!(
            unwrap_failure(decode_mobile_config(
                br#"<?xml version="1.0"?><plist><dict/></plist>"#.to_vec()
            )),
            MobileConfigDecodeFailureReason::MissingPayloadContent
        );

        let data = profile_with_payloads(
            r#"<dict><key>PayloadType</key><string>com.apple.mail.managed</string></dict>"#,
        );
        assert_eq!(
            unwrap_failure(decode_mobile_config(data)),
            MobileConfigDecodeFailureReason::MissingCaldavPayload
        );
    }

    #[test]
    fn rejects_invalid_caldav_value_types() {
        let data = profile_with_payloads(
            r#"<dict>
                <key>PayloadType</key><string>com.apple.caldav.account</string>
                <key>CalDAVHostName</key><string>calendar.example.test</string>
                <key>CalDAVPort</key><string>8443</string>
            </dict>"#,
        );

        assert_eq!(
            unwrap_failure(decode_mobile_config(data)),
            MobileConfigDecodeFailureReason::InvalidCaldavPayload
        );
    }

    #[test]
    fn serializes_the_frontend_contract_with_stable_names() {
        let success = serde_json::to_value(decode_mobile_config(XML.to_vec())).unwrap();
        assert_eq!(success["ok"], true);
        assert_eq!(success["profile"]["format"], "xml");
        assert_eq!(success["profile"]["signature"], "unsigned");
        assert_eq!(
            success["profile"]["caldavPayloads"][0]["payloadUuid"],
            "00000000-0000-4000-8000-000000000001"
        );

        let failure = serde_json::to_value(decode_mobile_config(ENCRYPTED.to_vec())).unwrap();
        assert_eq!(failure["ok"], false);
        assert_eq!(failure["reason"], "encrypted-profile-unsupported");
    }
}
