import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

import { companyLogoDarkTheme, companyLogoLightTheme } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PdfExportModule, ColumnMenuModule, ContextMenuModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'region' }, { field: 'product' }, { field: 'revenue' }],
    defaultColDef: {
        flex: 1,
    },
    defaultPdfExportParams: {
        documentTitle: 'Annual Revenue',
    },
    rowData: Array.from({ length: 35 }, (_, index) => ({
        region: ['Americas', 'EMEA', 'APAC'][index % 3],
        product: ['Analytics', 'Data Grid', 'Reporting'][index % 3],
        revenue: `$${(125000 + index * 7350).toLocaleString('en-US')}`,
    })),
};

function getHeaderLogo() {
    // exported page colours follow the grid theme, so pick the logo variant that stays visible.
    const gridBackground = getComputedStyle(
        document.querySelector<HTMLElement>('#myGrid .ag-root-wrapper')!
    ).backgroundColor;
    const [red = 255, green = 255, blue = 255] = gridBackground.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
    const isDarkTheme = red * 0.299 + green * 0.587 + blue * 0.114 < 128;

    return isDarkTheme
        ? { id: 'company-logo-dark', base64: companyLogoDarkTheme }
        : { id: 'company-logo-light', base64: companyLogoLightTheme };
}

function onBtExport() {
    gridApi.exportDataAsPdf({
        headerFooterConfig: {
            all: {
                header: [
                    {
                        position: 'Left',
                        image: {
                            ...getHeaderLogo(),
                            imageType: 'png',
                            width: 92,
                            altText: 'AG Grid',
                        },
                    },
                    {
                        position: 'Right',
                        value: 'Page &[Page] of &[Pages]',
                    },
                ],
            },
        },
    });
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
