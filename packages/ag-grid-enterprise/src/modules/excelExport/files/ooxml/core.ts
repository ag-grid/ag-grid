import { ExcelOOXMLTemplate } from 'ag-grid-community';

const coreFactory: ExcelOOXMLTemplate = {
    getTemplate() {
        const dt = new Date(),
            jsonDate = dt.toJSON();
        return {
            name: 'cp:coreProperties',
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
                        dc: 'http://purl.org/dc/elements/1.1/',
                        dcterms: 'http://purl.org/dc/terms/',
                        dcmitype: 'http://purl.org/dc/dcmitype/',
                        xsi: 'http://www.w3.org/2001/XMLSchema-instance'
                    }
                }]
            },
            children: [{
                name: 'dc:creator',
                textNode: 'ag-Grid'
            }, {
                name: 'dc:title',
                textNode: 'Workbook'
            }, {
                name: 'dcterms:created',
                properties: {
                    rawMap: {
                        'xsi:type': 'dcterms:W3CDTF'
                    }
                },
                textNode: jsonDate
            }, {
                name: 'dcterms:modified',
                properties: {
                    rawMap: {
                        'xsi:type': 'dcterms:W3CDTF'
                    }
                },
                textNode: jsonDate
            }]
        };
    }
};

export default coreFactory;
