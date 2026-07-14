import type {
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IStatusPanelComp,
    IStatusPanelParams,
    StatusPanelDef,
} from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { ServerSideRowModelModule, StatusBarModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

// AG-16023: under SSRM, client-side-only status panels (total / filtered / total-and-filtered row counts) must be
// dropped, while serverSide-supported panels (aggregation, selected row count) and custom panels are kept. Under the
// client-side row model every panel renders. We pin this through the rendered status-bar DOM rather than any internal.
const CUSTOM_PANEL_CLASS = 'ag-status-panel-custom-test';

class CustomStatusPanel implements IStatusPanelComp {
    private eGui!: HTMLElement;

    public init(_params: IStatusPanelParams): void {
        this.eGui = document.createElement('div');
        this.eGui.className = `ag-status-panel ${CUSTOM_PANEL_CLASS}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public destroy(): void {}
}

const ALL_PANELS: StatusPanelDef[] = [
    { statusPanel: 'agTotalRowCountComponent' },
    { statusPanel: 'agFilteredRowCountComponent' },
    { statusPanel: 'agTotalAndFilteredRowCountComponent' },
    { statusPanel: 'agAggregationComponent' },
    { statusPanel: 'agSelectedRowCountComponent' },
    { statusPanel: 'customStatusPanel' },
];

const CLIENT_SIDE_ONLY_CLASSES = [
    'ag-status-panel-total-row-count',
    'ag-status-panel-filtered-row-count',
    'ag-status-panel-total-and-filtered-row-count',
];

const SERVER_SIDE_SUPPORTED_CLASSES = [
    'ag-status-panel-aggregations',
    'ag-status-panel-selected-row-count',
    CUSTOM_PANEL_CLASS,
];

function renderedStatusPanelClasses(gridElement: HTMLElement): string[] {
    const panels = gridElement.querySelectorAll('.ag-status-bar .ag-status-panel');
    const classes: string[] = [];
    for (let i = 0, len = panels.length; i < len; ++i) {
        const panel = panels[i];
        for (let j = 0, jlen = panel.classList.length; j < jlen; ++j) {
            const cls = panel.classList[j];
            if (cls !== 'ag-status-panel') {
                classes.push(cls);
            }
        }
    }
    return classes;
}

describe('SSRM status bar panel filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [StatusBarModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const serverSideDatasource: IServerSideDatasource = {
        getRows(params: IServerSideGetRowsParams) {
            params.success({ rowData: [{ id: 0, value: 'a' }], rowCount: 1 });
        },
    };

    const baseOptions: GridOptions = {
        columnDefs: [{ field: 'id' }, { field: 'value' }],
        components: { customStatusPanel: CustomStatusPanel },
        statusBar: { statusPanels: ALL_PANELS },
    };

    test('under SSRM, client-side-only panels are dropped; supported and custom panels render', async () => {
        const gridDiv = document.createElement('div');
        document.body.appendChild(gridDiv);

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            const api = await gridsManager.createGridAndWait(gridDiv, {
                ...baseOptions,
                rowModelType: 'serverSide',
                serverSideDatasource,
            });

            const gridElement = getGridElement(api) as HTMLElement;
            const rendered = renderedStatusPanelClasses(gridElement);

            for (let i = 0, len = SERVER_SIDE_SUPPORTED_CLASSES.length; i < len; ++i) {
                expect(rendered).toContain(SERVER_SIDE_SUPPORTED_CLASSES[i]);
            }
            for (let i = 0, len = CLIENT_SIDE_ONLY_CLASSES.length; i < len; ++i) {
                expect(rendered).not.toContain(CLIENT_SIDE_ONLY_CLASSES[i]);
            }

            expect(warn).toHaveBeenCalled();
        } finally {
            warn.mockRestore();
            gridDiv.remove();
        }
    });

    test('under the client-side row model, every configured panel renders', async () => {
        const gridDiv = document.createElement('div');
        document.body.appendChild(gridDiv);

        try {
            const api = await gridsManager.createGridAndWait(gridDiv, {
                ...baseOptions,
                rowData: [{ id: 0, value: 'a' }],
            });

            const gridElement = getGridElement(api) as HTMLElement;
            const rendered = renderedStatusPanelClasses(gridElement);

            const allClasses = [...CLIENT_SIDE_ONLY_CLASSES, ...SERVER_SIDE_SUPPORTED_CLASSES];
            for (let i = 0, len = allClasses.length; i < len; ++i) {
                expect(rendered).toContain(allClasses[i]);
            }
        } finally {
            gridDiv.remove();
        }
    });
});
