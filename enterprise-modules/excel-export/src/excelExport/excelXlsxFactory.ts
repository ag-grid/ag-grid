import { XmlElement } from '@ag-grid-community/core';

import coreFactory from './files/ooxml/core';
import contentTypesFactory from './files/ooxml/contentTypes';
import officeThemeFactory from './files/ooxml/themes/office';
import sharedStringsFactory from './files/ooxml/sharedStrings';
import stylesheetFactory, { registerStyles } from './files/ooxml/styles/stylesheet';
import workbookFactory from './files/ooxml/workbook';
import worksheetFactory from './files/ooxml/worksheet';
import relationshipsFactory from './files/ooxml/relationships';

import { ExcelStyle, ExcelWorksheet } from '@ag-grid-community/core';
import { XmlFactory } from "@ag-grid-community/csv-export";

/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
export class ExcelXlsxFactory {

    private static sharedStrings: string[] = [];
    private static sheetNames: string[];

    public static createExcel(styles: ExcelStyle[], worksheets: ExcelWorksheet[], sharedStrings: string[] = []): string {
        this.sharedStrings = sharedStrings;
        this.sheetNames = worksheets.map(worksheet => worksheet.name);

        registerStyles(styles);

        return this.createWorksheet(worksheets);
    }

    public static createWorkbook(): string {
        return this.createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    }

    public static createStylesheet(): string {
        return this.createXmlPart(stylesheetFactory.getTemplate());
    }

    public static createSharedStrings(): string {
        return this.createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
    }

    public static createCore(): string {
        return this.createXmlPart(coreFactory.getTemplate());
    }

    public static createContentTypes(): string {
        return this.createXmlPart(contentTypesFactory.getTemplate());
    }

    public static createRels(): string {
        const rs = relationshipsFactory.getTemplate([{
            Id: 'rId1',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
            Target: 'xl/workbook.xml'
        }, {
            Id: 'rId2',
            Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
            Target: 'docProps/core.xml'
        }]);

        return this.createXmlPart(rs);
    }

    public static createTheme(): string {
        return this.createXmlPart(officeThemeFactory.getTemplate());
    }

    public static createWorkbookRels(): string {
        const rs = relationshipsFactory.getTemplate([{
            Id: 'rId1',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: 'worksheets/sheet1.xml'
        }, {
            Id: 'rId2',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
            Target: 'theme/theme1.xml'
        }, {
            Id: 'rId3',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
            Target: 'styles.xml'
        }, {
            Id: 'rId4',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
            Target: 'sharedStrings.xml'
        }]);

        return this.createXmlPart(rs);
    }

    private static createXmlPart(body: XmlElement): string {
        const header = XmlFactory.createHeader({
            encoding: 'UTF-8',
            standalone: 'yes'
        });

        const xmlBody = XmlFactory.createXml(body);
        return `${header}${xmlBody}`;
    }

    private static createWorksheet(worksheets: ExcelWorksheet[]): string {
        return this.createXmlPart(worksheetFactory.getTemplate(worksheets[0]));
    }
}
