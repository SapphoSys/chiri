import { describe, expect, it } from 'vitest';
import { serializePlist } from '$lib/mobileconfig/plist';

describe('serializePlist', () => {
  it('serializes dictionaries, arrays, scalar values, and omitted undefined fields', () => {
    const xml = serializePlist({
      PayloadContent: [
        {
          DisplayName: 'Work & Personal',
          Enabled: true,
          Disabled: false,
          Port: 8443,
          Omitted: undefined,
        },
      ],
    });

    expect(xml).toContain('<plist version="1.0">');
    expect(xml).toContain('<key>PayloadContent</key>\n\t<array>');
    expect(xml).toContain('<key>DisplayName</key>\n\t\t\t<string>Work &amp; Personal</string>');
    expect(xml).toContain('<key>Enabled</key>\n\t\t\t<true/>');
    expect(xml).toContain('<key>Disabled</key>\n\t\t\t<false/>');
    expect(xml).toContain('<key>Port</key>\n\t\t\t<integer>8443</integer>');
    expect(xml).not.toContain('Omitted');
  });

  it('escapes XML-sensitive characters in keys and string values', () => {
    const xml = serializePlist({
      'A&B': `<'">`,
    });

    expect(xml).toContain('<key>A&amp;B</key>');
    expect(xml).toContain('<string>&lt;&apos;&quot;&gt;</string>');
  });
});
