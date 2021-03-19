import { XmlElement, ExcelFactoryMode, ExcelSheetConfig } from '@ag-grid-community/core';

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

    private static sharedStrings: Map<string, number> = new Map();
    private static sheetNames: string[] = [];
    public static factoryMode: ExcelFactoryMode = ExcelFactoryMode.SINGLE_SHEET;

    public static createExcel(styles: ExcelStyle[], worksheet: ExcelWorksheet, worksheetConfig: ExcelSheetConfig): string {
        this.addSheetName(worksheet);
        registerStyles(styles);

        return this.createWorksheet(worksheet, worksheetConfig);
    }

    private static addSheetName(worksheet: ExcelWorksheet): void {
        const name = worksheet.name;
        let append = '';

        while (this.sheetNames.indexOf(name + append) !== -1) {
            if (append === '') {
                append = '_1'
            } else {
                const curr = parseInt(append.slice(1), 10);
                append = `_${curr + 1}`;
            }
        }

        worksheet.name += append;
        this.sheetNames.push(worksheet.name);
    }

    public static getStringPosition(str: string): number {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str)!;
        }

        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    }

    public static resetFactory(): void {
        this.sharedStrings = new Map();
        this.sheetNames = [];
        this.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    }

    public static createWorkbook(): string {
        return this.createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    }

    public static createStylesheet(defaultFontSize: number): string {
        return this.createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    }

    public static createSharedStrings(): string {
        return this.createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
    }

    public static createCore(author: string): string {
        return this.createXmlPart(coreFactory.getTemplate(author));
    }

    public static createContentTypes(sheetLen: number): string {
        return this.createXmlPart(contentTypesFactory.getTemplate(sheetLen));
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

    public static createWorkbookRels(sheetLen: number): string {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            Id: `rId${i + 1}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: `worksheets/sheet${i + 1}.xml`
        }));

        const rs = relationshipsFactory.getTemplate([
            ...worksheets,
        {
            Id: `rId${sheetLen + 1}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
            Target: 'theme/theme1.xml'
        }, {
            Id: `rId${sheetLen + 2}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
            Target: 'styles.xml'
        }, {
            Id: `rId${sheetLen + 3}`,
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

    private static createWorksheet(worksheet: ExcelWorksheet, worksheetConfig: ExcelSheetConfig): string {
        return this.createXmlPart(worksheetFactory.getTemplate({
            worksheet,
            worksheetConfig
        }));
    }
}
