{
  lib,
  stdenvNoCC,
  fetchurl,
  makeWrapper,
  autoPatchelfHook,
  dpkg,
  undmg,

  glib,
  gtk3,
  webkitgtk_4_1,
  openssl,
  glib-networking,
  libsoup_3,

  # this tracks signed/notarized release artifacts, not the checkout version
  # update the version and per-platform hashes when publishing new artifacts
  version ? "1.0.0",
}:

let
  inherit (stdenvNoCC.hostPlatform) system;

  # map Nix system to release asset info
  platformInfo = {
    "x86_64-linux" = {
      asset = "Chiri_${version}_amd64.deb";
      hash = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
    };
    "aarch64-linux" = {
      asset = "Chiri_${version}_arm64.deb";
      hash = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
    };
    "x86_64-darwin" = {
      asset = "Chiri_${version}_x64.dmg";
      hash = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
    };
    "aarch64-darwin" = {
      asset = "Chiri_${version}_aarch64.dmg";
      hash = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
    };
  };

  info = platformInfo.${system} or (throw "Unsupported platform: ${system}");

  src = fetchurl {
    url = "https://github.com/chiriapp/chiri/releases/download/app-v${version}/${info.asset}";
    hash = info.hash;
  };
in
if stdenvNoCC.isDarwin then
  # macOS: extract from DMG
  stdenvNoCC.mkDerivation {
    pname = "chiri-bin";
    inherit version src;

    nativeBuildInputs = [
      undmg
      makeWrapper
    ];

    sourceRoot = ".";

    installPhase = ''
      runHook preInstall

      chmod -R +w "Chiri.app"
      mkdir -p $out/Applications
      cp -r "Chiri.app" $out/Applications/

      # create wrapper script in bin
      mkdir -p $out/bin
      makeWrapper "$out/Applications/Chiri.app/Contents/MacOS/chiri" "$out/bin/chiri"

      runHook postInstall
    '';

    meta = {
      description = "Cross-platform CalDAV task management app (pre-built binary)";
      homepage = "https://github.com/chiriapp/chiri";
      license = lib.licenses.zlib;
      maintainers = with lib.maintainers; [ SapphoSys ];
      mainProgram = if stdenvNoCC.hostPlatform.isDarwin then "chiri" else "Chiri";
      platforms = [
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      sourceProvenance = with lib.sourceTypes; [ binaryNativeCode ];
    };
  }
else
  # Linux: extract from .deb
  stdenvNoCC.mkDerivation {
    pname = "chiri-bin";
    inherit version src;

    nativeBuildInputs = [
      dpkg
      autoPatchelfHook
      makeWrapper
    ];

    buildInputs = [
      glib
      gtk3
      webkitgtk_4_1
      openssl
      glib-networking
      libsoup_3
    ];

    unpackPhase = ''
      runHook preUnpack
      dpkg-deb -x $src .
      runHook postUnpack
    '';

    installPhase = ''
      runHook preInstall

      mkdir -p $out
      cp -r usr/* $out/

      if [ -f "$out/bin/Chiri" ]; then
        chmod +x $out/bin/Chiri
      fi

      # copy desktop file and icons if present
      if [ -d "usr/share" ]; then
        cp -r usr/share $out/
      fi

      runHook postInstall
    '';

    # wrap to set required environment variables
    postFixup = ''
      if [ -f "$out/bin/Chiri" ]; then
        wrapProgram $out/bin/Chiri \
          --set GIO_EXTRA_MODULES "${glib-networking}/lib/gio/modules"
      fi
    '';

    meta = {
      description = "Cross-platform CalDAV task management app (pre-built binary)";
      homepage = "https://github.com/chiriapp/chiri";
      license = lib.licenses.zlib;
      maintainers = with lib.maintainers; [ SapphoSys ];
      mainProgram = if stdenvNoCC.hostPlatform.isDarwin then "chiri" else "Chiri";
      platforms = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      sourceProvenance = with lib.sourceTypes; [ binaryNativeCode ];
    };
  }
