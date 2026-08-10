import type { PlistDictionary, PlistValue } from '$types/mobileconfig/plist';

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const PLIST_DOCTYPE =
  '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';

const indent = (level: number) => '\t'.repeat(level);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const serializeValue = (value: PlistValue, level: number): string => {
  if (typeof value === 'string') {
    return `${indent(level)}<string>${escapeXml(value)}</string>`;
  }

  if (typeof value === 'number') {
    return `${indent(level)}<integer>${value}</integer>`;
  }

  if (typeof value === 'boolean') {
    return `${indent(level)}<${value ? 'true' : 'false'}/>`;
  }

  if (Array.isArray(value)) {
    return [
      `${indent(level)}<array>`,
      ...value.map((item) => serializeValue(item, level + 1)),
      `${indent(level)}</array>`,
    ].join('\n');
  }

  return serializeDictionary(value, level);
};

const serializeDictionary = (dictionary: PlistDictionary, level: number): string => {
  const lines = [`${indent(level)}<dict>`];

  for (const [key, value] of Object.entries(dictionary)) {
    if (value === undefined) continue;

    lines.push(`${indent(level + 1)}<key>${escapeXml(key)}</key>`);
    lines.push(serializeValue(value, level + 1));
  }

  lines.push(`${indent(level)}</dict>`);
  return lines.join('\n');
};

export const serializePlist = (dictionary: PlistDictionary) =>
  [
    XML_DECLARATION,
    PLIST_DOCTYPE,
    '<plist version="1.0">',
    serializeDictionary(dictionary, 0),
    '</plist>',
  ].join('\n');
