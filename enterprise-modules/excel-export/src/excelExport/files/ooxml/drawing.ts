import { ExcelImage, ExcelOOXMLTemplate, XmlElement } from '@ag-grid-community/core';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';

const getAnchor = (name: string, col: number, row: number): XmlElement => ({
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

const getPicture = (image: ExcelImage): XmlElement => ({
    name: 'xdr:pic',
    children: [{
        name: 'xdr:nvPicPr',
        children: [{
            name: 'xdr:cNvPr',
            properties: {
                rawMap: {
                    id: 1,
                    name: 'Picture 1'
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
                    'r:embed': 'rId1',
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
})

const drawingFactory: ExcelOOXMLTemplate = {
    getTemplate(config: {
        sheetIndex: number
    }) {
        const { sheetIndex } = config;
        const sheetPictures = ExcelXlsxFactory.sheetImages.get(sheetIndex);

        const children = sheetPictures!.map(image => ({
            name: 'xdr:twoCellAnchor',
            children: [
                getAnchor('from', 1, 1),
                getAnchor('to', 6, 24),
                getPicture(image),
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
