import { TestGridsManager } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { CellClassParams } from 'ag-grid-community';
import { CellStyleModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

describe('Excel export styles', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellStyleModule, ExcelExportModule],
    });

    afterEach(() => gridsManager.reset());

    test('resolves repeated style combinations in definition order without caching callbacks', async () => {
        const calls: CellClassParams[] = [];
        const rule = vi.fn(() => true);
        const api = gridsManager.createGrid('excel-style-combinations', {
            columnDefs: [
                {
                    field: 'value',
                    cellClass: (params) => {
                        calls.push(params);
                        return ['green', 'missing', 'red'];
                    },
                    cellClassRules: { green: rule },
                },
            ],
            rowData: [{ value: 'first' }, { value: 'second' }, { value: "'literal" }],
            excelStyles: [
                { id: 'cell', alignment: { vertical: 'Center' } },
                { id: 'red', font: { color: '#FF0000', bold: true } },
                { id: 'green', font: { color: '#00FF00' } },
            ],
        });
        calls.length = 0;
        rule.mockClear();

        const blob = api.getDataAsExcel();
        expect(blob).toBeInstanceOf(Blob);
        if (!(blob instanceof Blob)) {
            throw new Error('Expected an Excel workbook');
        }
        const data = new Uint8Array(await blob.arrayBuffer());
        const zip = XLSX.CFB.read(data, { type: 'array' });
        const readXml = (path: string) =>
            new DOMParser().parseFromString(
                new TextDecoder().decode(XLSX.CFB.find(zip, path).content),
                'application/xml'
            );
        const sheet = readXml('/xl/worksheets/sheet1.xml');
        const styles = readXml('/xl/styles.xml');
        const styleIds = ['A2', 'A3', 'A4'].map((ref) =>
            Number(sheet.querySelector(`c[r="${ref}"]`)!.getAttribute('s'))
        );
        const formats = styles.querySelectorAll('cellXfs > xf');
        const normalStyle = formats[styleIds[0]];
        const quotedStyle = formats[styleIds[2]];
        const font = styles.querySelectorAll('fonts > font')[Number(normalStyle.getAttribute('fontId'))];

        expect(calls.map(({ value }) => value)).toEqual(['first', 'second', "'literal"]);
        expect(new Set(calls).size).toBe(3);
        expect(rule).toHaveBeenCalledTimes(3);
        expect(styleIds[0]).toBe(styleIds[1]);
        expect(quotedStyle.getAttribute('quotePrefix')).toBe('1');
        expect(quotedStyle.getAttribute('fontId')).toBe(normalStyle.getAttribute('fontId'));
        expect(normalStyle.querySelector('alignment')!.getAttribute('vertical')).toBe('center');
        expect(font.querySelector('color')!.getAttribute('rgb')).toBe('FF00FF00');
        expect(font.querySelector('b')).not.toBeNull();
        const workbook = XLSX.read(data, { type: 'array' });
        expect(workbook.Sheets[workbook.SheetNames[0]].A4.v).toBe('literal');
    });
});
