import { _escapeString } from 'ag-stack';

import type { HeaderElement, XmlElement } from 'ag-grid-community';

const LINE_SEPARATOR = '\r\n';
const XML_CHUNK_SIZE = 65536;

export interface XmlFactoryElement extends Omit<XmlElement, 'children'> {
    children?: Iterable<XmlFactoryElement>;
}

function returnAttributeIfPopulated(key: string, value: any, booleanTransformer?: (currentValue: boolean) => string) {
    if (!value && value !== '' && value !== 0) {
        return '';
    }

    let xmlValue: string = value;
    if (typeof value === 'boolean') {
        if (booleanTransformer) {
            xmlValue = booleanTransformer(value);
        }
    }

    return ` ${key}="${_escapeString(xmlValue)}"`;
}

export function createXmlHeader(headerElement: HeaderElement = {}): string {
    const headerStart = '<?';
    const headerEnd = '?>';
    const keys = ['version'];

    if (!headerElement.version) {
        headerElement.version = '1.0';
    }
    if (headerElement.encoding) {
        keys.push('encoding');
    }
    if (headerElement.standalone) {
        keys.push('standalone');
    }

    const att = keys.map((key: string): string => `${key}="${headerElement[key]}"`).join(' ');
    return `${headerStart}xml ${att} ${headerEnd}`;
}

function getAttributes(xmlElement: XmlFactoryElement, booleanTransformer?: (currentValue: boolean) => string): string {
    let props: string = '';
    if (xmlElement.properties) {
        if (xmlElement.properties.prefixedAttributes) {
            for (const prefixedSet of xmlElement.properties.prefixedAttributes) {
                for (const key of Object.keys(prefixedSet.map)) {
                    props += returnAttributeIfPopulated(
                        prefixedSet.prefix + key,
                        prefixedSet.map[key],
                        booleanTransformer
                    );
                }
            }
        }

        if (xmlElement.properties.rawMap) {
            for (const key of Object.keys(xmlElement.properties.rawMap)) {
                props += returnAttributeIfPopulated(key, xmlElement.properties.rawMap[key], booleanTransformer);
            }
        }
    }
    return props;
}

class XmlWriter {
    private readonly chunks: string[] = [];
    private readonly currentChunk: string[] = [];
    private currentChunkSize = 0;

    public constructor(private readonly booleanTransformer?: (currentValue: boolean) => string) {}

    public writeElement(element: XmlFactoryElement): void {
        const { name, children, textNode } = element;
        const opening = '<' + name + getAttributes(element, this.booleanTransformer);
        if (!children && textNode == null) {
            this.write(opening + '/>' + LINE_SEPARATOR);
        } else if (textNode != null) {
            this.write(opening + '>' + _escapeString(textNode) + '</' + name + '>' + LINE_SEPARATOR);
        } else {
            this.write(opening + '>' + LINE_SEPARATOR);
            if (children) {
                for (const child of children) {
                    this.writeElement(child);
                }
            }
            this.write('</' + name + '>' + LINE_SEPARATOR);
        }
    }

    public toString(): string {
        this.flush();
        return this.chunks.join('');
    }

    private write(value: string): void {
        this.currentChunk.push(value);
        this.currentChunkSize += value.length;
        if (this.currentChunkSize >= XML_CHUNK_SIZE) {
            this.flush();
        }
    }

    private flush(): void {
        this.chunks.push(this.currentChunk.join(''));
        this.currentChunk.length = 0;
        this.currentChunkSize = 0;
    }
}

export function createXml(
    xmlElement: XmlFactoryElement,
    booleanTransformer?: (currentValue: boolean) => string
): string {
    const writer = new XmlWriter(booleanTransformer);
    writer.writeElement(xmlElement);
    return writer.toString();
}
