import { ExcelImage, ExcelOOXMLTemplate, XmlElement } from '@ag-grid-community/core';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';

const getAnchor = (name: string, row: number, col: number): XmlElement => ({
    name: `xdr:${name}`,
    children: [{
        name: 'xdr:col',
        textNode: col.toString(),
    }, {
        name: 'xdr:colOff',
        textNode: '0'
    }, {
        name: 'xdr:row',
        textNode: row.toString()
    }, {
        name: 'xdr:rowOff',
        textNode: '0'
    }]
});

const getPicture = (image: ExcelImage, sheetImages: ExcelImage[]): XmlElement => {
    const imageWorkBookId = ExcelXlsxFactory.workbookImages.get(image.id)!.index + 1;
    return {
        name: 'xdr:pic',
        children: [{
            name: 'xdr:nvPicPr',
            children: [{
                name: 'xdr:cNvPr',
                properties: {
                    rawMap: {
                        id: sheetImages.indexOf(image) + 1,
                        name: image.id
                    }
                },
                children: [{
                    name: 'a:extLst',
                    children: [{
                        name: 'a:ext',
                        properties: {
                            rawMap: {
                                uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}'
                            }
                        },
                        children: [{
                            name: 'a16:creationId',
                            properties: {
                                rawMap: {
                                    id: '{00000000-0008-0000-0000-000002000000}',
                                    'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main'
                                }
                            }
                        }]
                    }]
                }]
            }, {
                name: 'xdr:cNvPicPr',
                children: [{
                    name: 'a:picLocks',
                    properties: {
                        rawMap: {
                            noChangeAspect: 1
                        }
                    }
                }]
            }]
        }, {
            name: 'xdr:blipFill',
            children: [{
                name: 'a:blip',
                properties: {
                    rawMap: {
                        cstate: 'print',
                        'r:embed': `rId${imageWorkBookId}`,
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
                    }
                }
            }, {
                name:'a:stretch',
                children: [{
                    name: 'a:fillRect'
                }]
            }]
        }, {
            name: 'xdr:spPr',
            children: [{
                name: 'a:xfrm',
                children: [{
                    name: 'a:off',
                    properties: {
                        rawMap: {
                            x: 0,
                            y: 0
                        }
                    }
                }, {
                    name: 'a:ext',
                    properties: {
                        rawMap: {
                            cx: 0,
                            cy: 0
                        }
                    }
                }]
            }, {
                name: 'a:prstGeom',
                properties: {
                    rawMap: {
                        prst: 'rect'
                    }
                },
                children: [{
                    name: 'a:avLst'
                }]
            }]
        }]
    }
}

const drawingFactory: ExcelOOXMLTemplate = {
    getTemplate(config: {
        sheetIndex: number
    }) {
        const { sheetIndex } = config;
        const sheetImages = ExcelXlsxFactory.sheetImages.get(sheetIndex);

        const children = sheetImages!.map(image => ({
            name: 'xdr:twoCellAnchor',
            children: [
                getAnchor('from', image.position!.row - 1, image.position!.column - 1),
                getAnchor('to', (image.position!.row + (image.position!.rowSpan || 1)) - 1, (image.position!.column + (image.position!.column || 1)) - 1),
                getPicture(image, sheetImages!),
                { name: 'xdr:clientData'}
            ]
        }));

        return {
            name: 'xdr:wsDr',
            properties: {
                rawMap: {
                    'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                    'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
                }
            },
            children
        }
    }
};

export default drawingFactory;
