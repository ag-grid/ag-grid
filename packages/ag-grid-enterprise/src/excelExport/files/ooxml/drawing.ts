import type { ExcelImage, ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import type { ExcelCalculatedImage, ImageAnchor, ImageBoxSize, ImageColor } from '../../assets/excelInterfaces';
import { pixelsToEMU } from '../../assets/excelUtils';
import { XLSX_WORKSHEET_IMAGES, XLSX_WORKSHEET_IMAGE_IDS } from '../../excelXlsxFactory';

const getAnchor = (name: string, imageAnchor: ImageAnchor): XmlElement => ({
    name: `xdr:${name}`,
    children: [
        {
            name: 'xdr:col',
            textNode: imageAnchor.col.toString(),
        },
        {
            name: 'xdr:colOff',
            textNode: imageAnchor.offsetX.toString(),
        },
        {
            name: 'xdr:row',
            textNode: imageAnchor.row.toString(),
        },
        {
            name: 'xdr:rowOff',
            textNode: imageAnchor.offsetY.toString(),
        },
    ],
});

const getExt = (image: ExcelImage): XmlElement => {
    const children: XmlElement[] = [
        {
            name: 'a:ext',
            properties: {
                rawMap: {
                    uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}',
                },
            },
            children: [
                {
                    name: 'a16:creationId',
                    properties: {
                        rawMap: {
                            id: '{822E6D20-D7BC-2841-A643-D49A6EF008A2}',
                            'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main',
                        },
                    },
                },
            ],
        },
    ];
    const recolor = image.recolor && image.recolor.toLowerCase();

    switch (recolor) {
        case 'grayscale':
        case 'sepia':
        case 'washout':
            children.push({
                name: 'a:ext',
                properties: {
                    rawMap: {
                        uri: '{C183D7F6-B498-43B3-948B-1728B52AA6E4}',
                    },
                },
                children: [
                    {
                        name: 'adec:decorative',
                        properties: {
                            rawMap: {
                                val: '0',
                                'xmlns:adec': 'http://schemas.microsoft.com/office/drawing/2017/decorative',
                            },
                        },
                    },
                ],
            });
    }

    return {
        name: 'a:extLst',
        children,
    };
};

const getNvPicPr = (image: ExcelImage, index: number) => ({
    name: 'xdr:nvPicPr',
    children: [
        {
            name: 'xdr:cNvPr',
            properties: {
                rawMap: {
                    id: index,
                    name: image.id,
                    descr: image.altText != null ? image.altText : undefined,
                },
            },
            children: [getExt(image)],
        },
        {
            name: 'xdr:cNvPicPr',
            properties: {
                rawMap: {
                    preferRelativeResize: '0',
                },
            },
            children: [
                {
                    name: 'a:picLocks',
                },
            ],
        },
    ],
});

const getColorDetails = (color: ImageColor): XmlElement[] | undefined => {
    if (!color.saturation && !color.tint) {
        return;
    }
    const ret: XmlElement[] = [];

    if (color.saturation) {
        ret.push({
            name: 'a:satMod',
            properties: {
                rawMap: {
                    val: color.saturation * 1000,
                },
            },
        });
    }

    if (color.tint) {
        ret.push({
            name: 'a:tint',
            properties: {
                rawMap: {
                    val: color.tint * 1000,
                },
            },
        });
    }

    return ret;
};

const getDuoTone = (primaryColor: ImageColor, secondaryColor: ImageColor): XmlElement => {
    return {
        name: 'a:duotone',
        children: [
            {
                name: 'a:prstClr',
                properties: {
                    rawMap: {
                        val: primaryColor.color,
                    },
                },
                children: getColorDetails(primaryColor),
            },
            {
                name: 'a:srgbClr',
                properties: {
                    rawMap: {
                        val: secondaryColor.color,
                    },
                },
                children: getColorDetails(secondaryColor),
            },
        ],
    };
};

const getBlipFill = (image: ExcelImage, index: number) => {
    let blipChildren: XmlElement[] | undefined;

    if (image.transparency) {
        const transparency = Math.min(Math.max(image.transparency, 0), 100);
        blipChildren = [
            {
                name: 'a:alphaModFix',
                properties: {
                    rawMap: {
                        amt: 100000 - Math.round(transparency * 1000),
                    },
                },
            },
        ];
    }

    if (image.recolor) {
        if (!blipChildren) {
            blipChildren = [];
        }
        switch (image.recolor.toLocaleLowerCase()) {
            case 'grayscale':
                blipChildren.push({ name: 'a:grayscl' });
                break;
            case 'sepia':
                blipChildren.push(getDuoTone({ color: 'black' }, { color: 'D9C3A5', tint: 50, saturation: 180 }));
                break;
            case 'washout':
                blipChildren.push({
                    name: 'a:lum',
                    properties: {
                        rawMap: {
                            bright: '70000',
                            contrast: '-70000',
                        },
                    },
                });
                break;
            default:
        }
    }

    return {
        name: 'xdr:blipFill',
        children: [
            {
                name: 'a:blip',
                properties: {
                    rawMap: {
                        cstate: 'print',
                        'r:embed': `rId${index}`,
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
                    },
                },
                children: blipChildren,
            },
            {
                name: 'a:stretch',
                children: [
                    {
                        name: 'a:fillRect',
                    },
                ],
            },
        ],
    };
};

const getSpPr = (image: ExcelImage, imageBoxSize: ImageBoxSize) => {
    const xfrm: XmlElement = {
        name: 'a:xfrm',
        children: [
            {
                name: 'a:off',
                properties: {
                    rawMap: {
                        x: 0,
                        y: 0,
                    },
                },
            },
            {
                name: 'a:ext',
                properties: {
                    rawMap: {
                        cx: imageBoxSize.width,
                        cy: imageBoxSize.height,
                    },
                },
            },
        ],
    };

    if (image.rotation) {
        const rotation = image.rotation;
        xfrm.properties = {
            rawMap: {
                rot: Math.min(Math.max(rotation, 0), 360) * 60000,
            },
        };
    }

    const prstGeom: XmlElement = {
        name: 'a:prstGeom',
        properties: {
            rawMap: {
                prst: 'rect',
            },
        },
        children: [{ name: 'a:avLst' }],
    };

    const ret = {
        name: 'xdr:spPr',
        children: [xfrm, prstGeom],
    };

    return ret;
};

const getImageBoxSize = (image: ExcelCalculatedImage): ImageBoxSize => {
    image.fitCell = !!image.fitCell || !image.width || !image.height;

    const { position = {}, fitCell, width = 0, height = 0, totalHeight, totalWidth } = image;
    const { offsetX = 0, offsetY = 0, row = 1, rowSpan = 1, column = 1, colSpan = 1 } = position;

    return {
        from: {
            row: row - 1,
            col: column - 1,
            offsetX: pixelsToEMU(offsetX),
            offsetY: pixelsToEMU(offsetY),
        },
        to: {
            row: row - 1 + (fitCell ? 1 : rowSpan - 1),
            col: column - 1 + (fitCell ? 1 : colSpan - 1),
            offsetX: pixelsToEMU(width + offsetX),
            offsetY: pixelsToEMU(height + offsetY),
        },
        height: pixelsToEMU(totalHeight || height),
        width: pixelsToEMU(totalWidth || width),
    };
};

const getPicture = (
    image: ExcelImage,
    currentIndex: number,
    worksheetImageIndex: number,
    imageBoxSize: ImageBoxSize
): XmlElement => {
    return {
        name: 'xdr:pic',
        children: [
            getNvPicPr(image, currentIndex + 1),
            getBlipFill(image, worksheetImageIndex + 1),
            getSpPr(image, imageBoxSize),
        ],
    };
};

const drawingFactory: ExcelOOXMLTemplate = {
    getTemplate(config: { sheetIndex: number }) {
        const { sheetIndex } = config;
        const sheetImages = XLSX_WORKSHEET_IMAGES.get(sheetIndex);
        const sheetImageIds = XLSX_WORKSHEET_IMAGE_IDS.get(sheetIndex);

        const children = sheetImages!.map((image, idx) => {
            const boxSize = getImageBoxSize(image);
            return {
                name: 'xdr:twoCellAnchor',
                properties: {
                    rawMap: {
                        editAs: 'absolute',
                    },
                },
                children: [
                    getAnchor('from', boxSize.from),
                    getAnchor('to', boxSize.to),
                    getPicture(image, idx, sheetImageIds!.get(image.id)!.index, boxSize),
                    { name: 'xdr:clientData' },
                ],
            };
        });

        return {
            name: 'xdr:wsDr',
            properties: {
                rawMap: {
                    'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                    'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
                },
            },
            children,
        };
    },
};

export default drawingFactory;
