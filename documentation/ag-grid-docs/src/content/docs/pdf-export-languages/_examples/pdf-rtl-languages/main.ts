import type {
    GridApi,
    GridOptions,
    PdfExportParams,
    PdfFontFamilyDefinition,
    PdfStyleCallbackParams,
} from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([CellStyleModule, ClientSideRowModelModule, ContextMenuModule, PdfExportModule]);

interface LanguageSample {
    language: string;
    text: string;
    fontFamily: string;
    languageTag: 'ar' | 'fa' | 'he';
}

let gridApi: GridApi<LanguageSample>;

const gridOptions: GridOptions<LanguageSample> = {
    columnDefs: [
        { field: 'language', headerName: 'Language', width: 150 },
        {
            field: 'text',
            headerName: 'Text',
            flex: 1,
            minWidth: 280,
        },
        {
            field: 'text',
            colId: 'boldText',
            headerName: 'Text Bold',
            flex: 1,
            minWidth: 280,
            cellStyle: { fontWeight: 'bold' },
        },
    ],
    rowData: [
        {
            language: 'العربية',
            text: 'استقبلت الساحة أحمد وليلى وروبوتا',
            fontFamily: 'Noto Sans Arabic',
            languageTag: 'ar',
        },
        {
            language: 'فارسی',
            text: 'میدان علی و سارا و یک ربات را پذیرفت',
            fontFamily: 'Noto Sans Arabic',
            languageTag: 'fa',
        },
        {
            language: 'עברית',
            text: 'הכיכר קיבלה את דוד נועה ורובוט',
            fontFamily: 'Noto Sans Hebrew',
            languageTag: 'he',
        },
    ],
    defaultColDef: {
        resizable: true,
    },
    enableRtl: true,
};

function getDefaultPdfExportParams(fonts: PdfFontFamilyDefinition[]): PdfExportParams {
    return {
        fonts,
        processStyleCallback: (params: PdfStyleCallbackParams<LanguageSample>) => {
            if (params.type !== 'cell' || !params.node?.data) {
                return undefined;
            }

            const columnId = params.column?.getColId();
            return {
                fontFamily: params.node.data.fontFamily,
                fontWeight: columnId === 'boldText' ? 700 : 400,
                language: params.node.data.languageTag,
            };
        },
    };
}

function onBtExport() {
    loadFonts().then((fonts) => {
        gridApi.setGridOption('defaultPdfExportParams', getDefaultPdfExportParams(fonts));
        gridApi.exportDataAsPdf();
    });
}

async function loadFonts(): Promise<PdfFontFamilyDefinition[]> {
    const [arabicRegular, arabicBold, hebrewRegular, hebrewBold] = await Promise.all([
        loadFont('NotoSansArabic-Regular.ttf'),
        loadFont('NotoSansArabic-Bold.ttf'),
        loadFont('NotoSansHebrew-Regular.ttf'),
        loadFont('NotoSansHebrew-Bold.ttf'),
    ]);

    return [
        {
            family: 'Noto Sans Arabic',
            faces: [
                { data: arabicRegular, weight: 400 },
                { data: arabicBold, weight: 700 },
            ],
        },
        {
            family: 'Noto Sans Hebrew',
            faces: [
                { data: hebrewRegular, weight: 400 },
                { data: hebrewBold, weight: 700 },
            ],
        },
    ];
}

async function loadFont(fileName: string): Promise<ArrayBuffer> {
    const response = await fetch(`/fonts/pdf-export/${fileName}`);
    if (!response.ok) {
        throw new Error(`Unable to load ${fileName}`);
    }
    return response.arrayBuffer();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
