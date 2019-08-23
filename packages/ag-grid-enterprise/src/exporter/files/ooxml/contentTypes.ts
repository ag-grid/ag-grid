import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
import contentTypeFactory from './contentType';

const contentTypesFactory: ExcelOOXMLTemplate = {
    getTemplate() {

        const children = _.map([{
            name: 'Default',
            Extension: 'rels',
            ContentType: 'application/vnd.openxmlformats-package.relationships+xml'
        }, {
            name: 'Default',
            ContentType: 'application/xml',
            Extension: 'xml'
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
            PartName: "/xl/workbook.xml"
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: '/xl/worksheets/sheet1.xml'
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
            PartName: '/xl/theme/theme1.xml'
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
            PartName: '/xl/styles.xml'
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
            PartName: '/xl/sharedStrings.xml'
        }, {
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
            PartName: '/docProps/core.xml'
        }], contentTypeFactory.getTemplate);

        return {
            name: "Types",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/content-types"
                }
            },
            children
        };
    }
};

export default contentTypesFactory;
