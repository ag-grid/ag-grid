import type { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import type { ExcelHeaderFooterCalculatedImage } from '../../assets/excelInterfaces';
import { XLSX_WORKSHEET_HEADER_FOOTER_IMAGES } from '../../excelXlsxFactory';

const getShapeLayout = (): XmlElement => ({
    name: 'o:shapelayout',
    properties: {
        prefixedAttributes: [
            {
                prefix: 'v:',
                map: {
                    ext: 'edit',
                },
            },
        ],
    },
    children: [
        {
            name: 'o:idmap',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'v:',
                        map: {
                            ext: 'edit',
                        },
                    },
                ],
                rawMap: {
                    data: '1',
                },
            },
        },
    ],
});

const getStroke = (): XmlElement => ({
    name: 'v:stroke',
    properties: {
        rawMap: {
            joinstyle: 'miter',
        },
    },
});

const getFormulas = (formulas: string[]): XmlElement => ({
    name: 'v:formulas',
    children: formulas.map<XmlElement>((formula) => ({
        name: 'v:f',
        properties: {
            rawMap: {
                eqn: formula,
            },
        },
    })),
});

const getPath = (): XmlElement => ({
    name: 'v:path',
    properties: {
        prefixedAttributes: [
            {
                prefix: 'o:',
                map: {
                    connecttype: 'rect',
                    extrusionok: 'f',
                },
            },
        ],
        rawMap: {
            gradientshapeok: 't',
        },
    },
});

const getLock = (params?: { aspectratio?: boolean; rotation?: boolean }): XmlElement => {
    const { aspectratio, rotation } = params || {};
    const rawMap: { aspectratio?: 't'; rotation?: 't' } = {};

    if (aspectratio) {
        rawMap.aspectratio = 't';
    }

    if (rotation) {
        rawMap.rotation = 't';
    }

    return {
        name: 'o:lock',
        properties: {
            prefixedAttributes: [
                {
                    prefix: 'v:',
                    map: {
                        ext: 'edit',
                    },
                },
            ],
            rawMap,
        },
    };
};

function mapNumber(
    value: number,
    startSource: number,
    endSource: number,
    startTarget: number,
    endTarget: number
): number {
    return ((value - startSource) / (endSource - startSource)) * (endTarget - startTarget) + startTarget;
}

const getImageData = (image: ExcelHeaderFooterCalculatedImage, idx: number): XmlElement => {
    let rawMap: any;

    const { recolor, brightness, contrast, id } = image;

    if (recolor) {
        rawMap = {};
        if (recolor === 'Washout' || recolor === 'Grayscale') {
            rawMap.gain = '19661f';
            rawMap.blacklevel = '22938f';
        }

        if (recolor === 'Black & White' || recolor === 'Grayscale') {
            rawMap.grayscale = 't';
            if (recolor === 'Black & White') {
                rawMap.bilevel = 't';
            }
        }
    }

    if (!recolor || recolor === 'Grayscale') {
        if (!rawMap) {
            rawMap = {};
        }

        if (contrast != null && contrast !== 50) {
            let gain = '1';

            if (contrast >= 0) {
                if (contrast < 50) {
                    gain = String(contrast / 50);
                } else if (contrast < 100) {
                    gain = String(50 / (100 - contrast));
                } else if (contrast === 100) {
                    gain = '2147483647f';
                }
            }

            rawMap.gain = gain;
        }

        if (brightness != null && brightness !== 50) {
            rawMap.blacklevel = mapNumber(brightness, 0, 100, -0.5, 0.5).toString();
        }
    }

    return {
        name: 'v:imagedata',
        properties: {
            prefixedAttributes: [
                {
                    prefix: 'o:',
                    map: {
                        relid: `rId${idx}`,
                        title: id,
                    },
                },
            ],
            rawMap,
        },
    };
};

const getShapeType = (): XmlElement => {
    const formulas = [
        'if lineDrawn pixelLineWidth 0',
        'sum @0 1 0',
        'sum 0 0 @1',
        'prod @2 1 2',
        'prod @3 21600 pixelWidth',
        'prod @3 21600 pixelHeight',
        'sum @0 0 1',
        'prod @6 1 2',
        'prod @7 21600 pixelWidth',
        'sum @8 21600 0',
        'prod @7 21600 pixelHeight',
        'sum @10 21600 0',
    ];

    return {
        name: 'v:shapetype',
        properties: {
            prefixedAttributes: [
                {
                    prefix: 'o:',
                    map: {
                        spt: '75',
                        preferrelative: 't',
                    },
                },
            ],
            rawMap: {
                coordsize: '21600,21600',
                filled: 'f',
                id: '_x0000_t75',
                path: 'm@4@5l@4@11@9@11@9@5xe',
                stroked: 'f',
            },
        },
        children: [getStroke(), getFormulas(formulas), getPath(), getLock({ aspectratio: true })],
    };
};

const pixelToPoint = (value?: number) => Math.floor((value ?? 0) * 0.74999943307122);

const getShape = (image: ExcelHeaderFooterCalculatedImage, idx: number): XmlElement => {
    const { width = 0, height = 0, altText } = image;

    const imageWidth = pixelToPoint(width);
    const imageHeight = pixelToPoint(height);

    return {
        name: 'v:shape',
        properties: {
            rawMap: {
                id: image.headerFooterPosition,
                'o:spid': '_x0000_s1025',
                style: `position: absolute; margin-left: 0; margin-top: 10in; margin-bottom: 0; margin-right: 0; width: ${imageWidth}pt; height: ${imageHeight}pt; z-index: ${idx + 1}`,
                type: '#_x0000_t75',
                alt: altText,
            },
        },
        children: [getImageData(image, idx + 1), getLock({ rotation: true })],
    };
};

const vmlDrawingFactory: ExcelOOXMLTemplate = {
    getTemplate(params: { sheetIndex: number }) {
        const headerFooterImages = XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.get(params.sheetIndex) || [];
        const children: XmlElement[] = [
            getShapeLayout(),
            getShapeType(),
            ...headerFooterImages.map((img, idx) => getShape(img, idx)),
        ];

        return {
            name: 'xml',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'xmlns:',
                        map: {
                            v: 'urn:schemas-microsoft-com:vml',
                            o: 'urn:schemas-microsoft-com:office:office',
                            x: 'urn:schemas-microsoft-com:office:excel',
                        },
                    },
                ],
            },
            children,
        };
    },
};

export default vmlDrawingFactory;
