import type { ExcelOOXMLTemplate } from 'ag-grid-community';
import type { XmlElement } from 'ag-grid-community';

import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import contentTypeFactory from './contentType';

type ImageExtension = 'jpeg' | 'png' | 'gif';
export const _normaliseImageExtension = (ext: 'jpg' | 'png' | 'gif'): ImageExtension => (ext === 'jpg' ? 'jpeg' : ext);

const contentTypesFactory: ExcelOOXMLTemplate = {
    getTemplate(sheetLen: number) {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: `/xl/worksheets/sheet${i + 1}.xml`,
        }));

        const sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
        const headerFooterImages = ExcelXlsxFactory.worksheetHeaderFooterImages.size;
        const sheetsWithTables = ExcelXlsxFactory.worksheetDataTables.size;
        const imageTypesObject: { [key in ImageExtension]?: boolean } = {};

        ExcelXlsxFactory.workbookImageIds.forEach((v) => {
            imageTypesObject[_normaliseImageExtension(v.type)] = true;
        });

        const imageDocs = new Array(sheetsWithImages).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: `/xl/drawings/drawing${i + 1}.xml`,
        }));

        const tableDocs = new Array(sheetsWithTables).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml',
            PartName: `/xl/tables/${ExcelXlsxFactory.getTableNameFromIndex(i)}.xml`,
        }));

        const imageTypes = Object.keys(imageTypesObject).map((ext) => ({
            name: 'Default',
            ContentType: `image/${ext}`,
            Extension: ext,
        }));

        if (headerFooterImages) {
            imageTypes.push({
                name: 'Default',
                Extension: 'vml',
                ContentType: 'application/vnd.openxmlformats-officedocument.vmlDrawing',
            });
        }

        const children: XmlElement[] = [
            ...imageTypes,
            {
                name: 'Default',
                Extension: 'rels',
                ContentType: 'application/vnd.openxmlformats-package.relationships+xml',
            },
            {
                name: 'Default',
                ContentType: 'application/xml',
                Extension: 'xml',
            },
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
                PartName: '/xl/workbook.xml',
            },
            ...worksheets,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
                PartName: '/xl/theme/theme1.xml',
            },
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
                PartName: '/xl/styles.xml',
            },
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
                PartName: '/xl/sharedStrings.xml',
            },
            ...imageDocs,
            ...tableDocs,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml',
            },
        ].map((contentType) => contentTypeFactory.getTemplate(contentType));

        return {
            name: 'Types',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
                },
            },
            children,
        };
    },
};

export default contentTypesFactory;
