import type { XmlElement } from 'ag-grid-community';

import { createXml, createXmlHeader } from './xmlFactory';

describe('Excel XML writer', () => {
    const children: XmlElement[] = [
        { name: 'empty' },
        { name: 'text', textNode: 'A&B' },
        { name: 'blank', textNode: '' },
        { name: 'children', children: [] },
    ];

    test('preserves attributes, text, empty elements and line endings', () => {
        expect(
            createXml(
                {
                    name: 'root',
                    properties: {
                        prefixedAttributes: [{ prefix: 'xmlns:', map: { x: 'urn:test' } }],
                        rawMap: { zero: 0, blank: '', hidden: false, enabled: true, absent: undefined },
                    },
                    children,
                },
                (value) => (value ? '1' : '0')
            )
        ).toBe(
            '<root xmlns:x="urn:test" zero="0" blank="" enabled="1">\r\n' +
                '<empty/>\r\n<text>A&amp;B</text>\r\n<blank></blank>\r\n<children>\r\n</children>\r\n</root>\r\n'
        );
        expect(createXmlHeader({ encoding: 'UTF-8', standalone: 'yes' })).toBe(
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'
        );
    });

    test('escapes attribute values and text', () => {
        expect(
            createXml({
                name: 'root',
                properties: { rawMap: { label: `<a href="x">'b' & c</a>` } },
                textNode: `<a href="x">'b' & c</a>`,
            })
        ).toBe(
            '<root label="&lt;a href=&quot;x&quot;&gt;&#39;b&#39; &amp; c&lt;/a&gt;">' +
                '&lt;a href=&quot;x&quot;&gt;&#39;b&#39; &amp; c&lt;/a&gt;</root>\r\n'
        );
    });

    test('serialises iterable children identically to arrays, including large text nodes', () => {
        const value = 'a'.repeat(100_000);
        function* elements(): Iterable<XmlElement> {
            yield* children;
            yield { name: 'large', textNode: value };
        }

        expect(createXml({ name: 'root', children: elements() })).toBe(
            createXml({ name: 'root', children: [...children, { name: 'large', textNode: value }] })
        );
    });
});
