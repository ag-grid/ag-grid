import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, PdfExportModule]);

interface LanguageSample {
    text: string;
}

let gridApi: GridApi<LanguageSample>;

const gridOptions: GridOptions<LanguageSample> = {
    columnDefs: [{ field: 'text', headerName: 'Japanese Text', flex: 1 }],
    rowData: [
        { text: '広場は太郎と花子とロボットを迎えました。' },
        { text: 'PDFには日本語の文字が埋め込まれています。' },
        { text: 'このグリッドでは一つのフォントを使用します。' },
    ],
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

async function loadFont(fileName: string): Promise<ArrayBuffer> {
    const response = await fetch(`/fonts/pdf-export/${fileName}`);
    if (!response.ok) {
        throw new Error(`Unable to load ${fileName}`);
    }
    return response.arrayBuffer();
}

document.addEventListener('DOMContentLoaded', async () => {
    const japaneseRegular = await loadFont('IBMPlexSansJP-Regular.ttf');
    const fontFamily = 'IBM Plex Sans JP';

    gridOptions.defaultPdfExportParams = {
        fonts: [
            {
                family: fontFamily,
                faces: [{ data: japaneseRegular, weight: 400 }],
            },
        ],
        defaultCellStyle: { fontFamily },
        language: 'ja',
    };

    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
