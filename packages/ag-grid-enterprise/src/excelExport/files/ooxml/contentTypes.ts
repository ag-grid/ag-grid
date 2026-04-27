import type { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import {
    XLSX_WORKBOOK_IMAGE_IDS,
    XLSX_WORKSHEET_COMMENTS,
    XLSX_WORKSHEET_DATA_TABLES,
    XLSX_WORKSHEET_HEADER_FOOTER_IMAGES,
    XLSX_WORKSHEET_IMAGES,
} from '../../excelXlsxFactory';
import contentTypeFactory from './contentType';

type ImageExtension = 'jpeg' | 'png' | 'gif';
export const _normaliseImageExtension = (ext: 'jpg' | 'png' | 'gif'): ImageExtension => (ext === 'jpg' ? 'jpeg' : ext);

const contentTypesFactory: ExcelOOXMLTemplate = {
    getTemplate({ sheetLen, hasCustomProperties }: { sheetLen: number; hasCustomProperties?: boolean }) {
        const worksheets = new Array(sheetLen).fill(undefined).map((_v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: `/xl/worksheets/sheet${i + 1}.xml`,
        }));

        const sheetsWithImages = XLSX_WORKSHEET_IMAGES.size;
        const headerFooterImages = XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.size;
        const sheetsWithComments = XLSX_WORKSHEET_COMMENTS.size;
        const imageTypesObject: { [key in ImageExtension]?: boolean } = {};

        XLSX_WORKBOOK_IMAGE_IDS.forEach((v) => {
            imageTypesObject[_normaliseImageExtension(v.type)] = true;
        });

        const imageDocs = new Array(sheetsWithImages).fill(undefined).map((_v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: `/xl/drawings/drawing${i + 1}.xml`,
        }));

        const tableDocs: { name: string; ContentType: string; PartName: string }[] = [];
        const commentDocs = new Array(sheetsWithComments).fill(undefined).map((_v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml',
            PartName: `/xl/comments${i + 1}.xml`,
        }));

        XLSX_WORKSHEET_DATA_TABLES.forEach(({ name }) => {
            tableDocs.push({
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml',
                PartName: `/xl/tables/${name}.xml`,
            });
        });

        const customPropertiesDocs = hasCustomProperties
            ? [
                  {
                      name: 'Override',
                      ContentType: 'application/vnd.openxmlformats-officedocument.custom-properties+xml',
                      PartName: '/docProps/custom.xml',
                  },
              ]
            : [];

        const imageTypes = Object.keys(imageTypesObject).map((ext) => ({
            name: 'Default',
            ContentType: `image/${ext}`,
            Extension: ext,
        }));

        if (headerFooterImages || sheetsWithComments) {
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
            ...commentDocs,
            ...tableDocs,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml',
            },
            ...customPropertiesDocs,
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
