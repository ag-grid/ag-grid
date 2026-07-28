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
    languageTag?: 'bg' | 'el' | 'ja' | 'zh-CN' | 'zh-TW';
}

let gridApi: GridApi<LanguageSample>;

const gridOptions: GridOptions<LanguageSample> = {
    columnDefs: [
        { field: 'language', width: 150 },
        { field: 'text', headerName: 'Exported Text', flex: 1, minWidth: 280 },
        {
            field: 'text',
            colId: 'boldText',
            headerName: 'Exported Text (Bold)',
            flex: 1,
            minWidth: 280,
            cellStyle: { fontWeight: 'bold' },
        },
    ],
    rowData: [
        {
            language: 'Portuguese',
            text: 'A praça recebeu João, Maria e um robô.',
            fontFamily: 'Helvetica',
        },
        {
            language: 'Greek',
            text: 'Η πλατεία υποδέχτηκε τον Γιώργο, τη Μαρία και ένα ρομπότ.',
            fontFamily: 'IBM Plex Sans JP',
            languageTag: 'el',
        },
        {
            language: 'Bulgarian',
            text: 'Площадът посрещна Иван, Мария и един робот.',
            fontFamily: 'IBM Plex Sans JP',
            languageTag: 'bg',
        },
        {
            language: 'Japanese',
            text: '広場は太郎と花子とロボットを迎えました。',
            fontFamily: 'IBM Plex Sans JP',
            languageTag: 'ja',
        },
        {
            language: 'Simplified Chinese',
            text: '广场迎来了小明、小红和一个机器人。',
            fontFamily: 'IBM Plex Sans SC',
            languageTag: 'zh-CN',
        },
        {
            language: 'Traditional Chinese',
            text: '廣場迎來了志明、雅婷和一個機器人。',
            fontFamily: 'IBM Plex Sans TC',
            languageTag: 'zh-TW',
        },
    ],
    defaultColDef: {
        sortable: true,
        resizable: true,
    },
};

function getDefaultPdfExportParams(fonts: PdfFontFamilyDefinition[]): PdfExportParams {
    return {
        fonts,
        processStyleCallback: (params: PdfStyleCallbackParams<LanguageSample>) => {
            const columnId = params.type === 'cell' ? params.column?.getColId() : undefined;
            if (params.type !== 'cell' || (columnId !== 'text' && columnId !== 'boldText') || !params.node?.data) {
                return undefined;
            }
            return {
                fontFamily: params.node.data.fontFamily,
                fontWeight: columnId === 'boldText' ? 700 : 400,
                language: params.node.data.languageTag,
            };
        },
    };
}

function onBtExport() {
    gridApi.exportDataAsPdf();
}

async function loadFonts(): Promise<PdfFontFamilyDefinition[]> {
    const [
        japaneseRegular,
        japaneseBold,
        simplifiedChineseRegular,
        simplifiedChineseBold,
        traditionalChineseRegular,
        traditionalChineseBold,
    ] = await Promise.all([
        loadFont('IBMPlexSansJP-Regular.ttf'),
        loadFont('IBMPlexSansJP-Bold.ttf'),
        loadFont('IBMPlexSansSC-Regular.ttf'),
        loadFont('IBMPlexSansSC-Bold.ttf'),
        loadFont('IBMPlexSansTC-Regular.ttf'),
        loadFont('IBMPlexSansTC-Bold.ttf'),
    ]);

    return [
        {
            family: 'IBM Plex Sans JP',
            faces: [
                { data: japaneseRegular, weight: 400 },
                { data: japaneseBold, weight: 700 },
            ],
        },
        {
            family: 'IBM Plex Sans SC',
            faces: [
                { data: simplifiedChineseRegular, weight: 400 },
                { data: simplifiedChineseBold, weight: 700 },
            ],
        },
        {
            family: 'IBM Plex Sans TC',
            faces: [
                { data: traditionalChineseRegular, weight: 400 },
                { data: traditionalChineseBold, weight: 700 },
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

document.addEventListener('DOMContentLoaded', async () => {
    const fonts = await loadFonts();
    gridOptions.defaultPdfExportParams = getDefaultPdfExportParams(fonts);
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
