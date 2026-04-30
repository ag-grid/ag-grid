import type { ColDef, IHeaderParams } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';

const rowData = [{ a: 1, b: 10 }];

class TrackingHeaderComp {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        TrackingHeaderComp.initCount = 0;
        TrackingHeaderComp.destroyCount = 0;
        TrackingHeaderComp.refreshCount = 0;
    }

    private readonly gui = document.createElement('div');

    init(_params: IHeaderParams): void {
        TrackingHeaderComp.initCount++;
    }

    refresh(_params: IHeaderParams): boolean {
        TrackingHeaderComp.refreshCount++;
        return true;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        TrackingHeaderComp.destroyCount++;
    }
}

class TrackingInnerHeader {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        TrackingInnerHeader.initCount = 0;
        TrackingInnerHeader.destroyCount = 0;
        TrackingInnerHeader.refreshCount = 0;
    }

    private readonly gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        TrackingInnerHeader.initCount++;
    }

    refresh(_params: IHeaderParams): boolean {
        TrackingInnerHeader.refreshCount++;
        return true;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        TrackingInnerHeader.destroyCount++;
    }
}

class AlternativeInnerHeader {
    static initCount = 0;
    static destroyCount = 0;

    static reset(): void {
        AlternativeInnerHeader.initCount = 0;
        AlternativeInnerHeader.destroyCount = 0;
    }

    private readonly gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        AlternativeInnerHeader.initCount++;
    }

    refresh(_params: IHeaderParams): boolean {
        return true;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        AlternativeInnerHeader.destroyCount++;
    }
}

class NoRefreshInnerHeader {
    static initCount = 0;
    static destroyCount = 0;

    static reset(): void {
        NoRefreshInnerHeader.initCount = 0;
        NoRefreshInnerHeader.destroyCount = 0;
    }

    private readonly gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        NoRefreshInnerHeader.initCount++;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        NoRefreshInnerHeader.destroyCount++;
    }
}

class RejectingInnerHeader {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        RejectingInnerHeader.initCount = 0;
        RejectingInnerHeader.destroyCount = 0;
        RejectingInnerHeader.refreshCount = 0;
    }

    private gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        RejectingInnerHeader.initCount++;
        this.gui = document.createElement('span');
    }

    refresh(_params: IHeaderParams): boolean {
        RejectingInnerHeader.refreshCount++;
        return false;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        RejectingInnerHeader.destroyCount++;
    }
}

const columnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: TrackingInnerHeader } },
];

const rejectingColumnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: RejectingInnerHeader } },
];

describe('header component lifecycle', () => {
    beforeEach(() => {
        TrackingHeaderComp.reset();
        TrackingInnerHeader.reset();
        AlternativeInnerHeader.reset();
        NoRefreshInnerHeader.reset();
        RejectingInnerHeader.reset();
    });

    test('headerComponent and innerHeaderComponent are both refreshed rather than remounted when column defs are updated', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(eGridDiv, { columnDefs, rowData }, { modules: [ClientSideRowModelModule] });

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);
        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(TrackingInnerHeader.destroyCount).toBe(0);

        // Simulates a React setColumnDefs call with equivalent definitions.
        // Before the fix, HeaderComp.refresh() always returned false due to a broken
        // template object reference comparison, causing innerHeaderComponent to be remounted.
        api.setGridOption('columnDefs', [...columnDefs]);

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);
        expect(TrackingHeaderComp.refreshCount).toBe(1);
        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(TrackingInnerHeader.destroyCount).toBe(0);
        expect(TrackingInnerHeader.refreshCount).toBe(1);

        api.destroy();
    });

    test('innerHeaderComponent is remounted when its refresh returns false, outer headerComp stays alive', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            { columnDefs: rejectingColumnDefs, rowData },
            { modules: [ClientSideRowModelModule] }
        );

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(0);

        api.setGridOption('columnDefs', [...rejectingColumnDefs]);

        // Inner component signalled it cannot handle the update — it should be replaced
        expect(RejectingInnerHeader.refreshCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(2);

        // Outer headerComp on the adjacent column must not have been remounted
        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);

        api.destroy();
    });

    test('innerHeaderComponent is replaced when the configured component class changes', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        sortable: false,
                        headerComponentParams: { innerHeaderComponent: TrackingInnerHeader },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(AlternativeInnerHeader.initCount).toBe(0);

        api.setGridOption('columnDefs', [
            { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: AlternativeInnerHeader } },
        ]);

        // Old component should be destroyed and the new class initialised in its place
        expect(TrackingInnerHeader.destroyCount).toBe(1);
        expect(AlternativeInnerHeader.initCount).toBe(1);

        api.destroy();
    });

    test('innerHeaderComponent without refresh is recreated on column def update, consistent with cell renderer behaviour', () => {
        const eGridDiv = document.createElement('div');
        const noRefreshDefs: ColDef[] = [
            { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: NoRefreshInnerHeader } },
        ];
        const api = createGrid(
            eGridDiv,
            { columnDefs: noRefreshDefs, rowData },
            { modules: [ClientSideRowModelModule] }
        );

        expect(NoRefreshInnerHeader.initCount).toBe(1);

        api.setGridOption('columnDefs', [...noRefreshDefs]);

        expect(NoRefreshInnerHeader.destroyCount).toBe(1);
        expect(NoRefreshInnerHeader.initCount).toBe(2);

        api.destroy();
    });

    test('innerHeaderComponent.refresh() receives updated params when column def changes', () => {
        let refreshedDisplayName: string | undefined;

        class CapturingRefreshInner {
            private readonly gui = document.createElement('span');
            init(_params: IHeaderParams): void {}
            refresh(params: IHeaderParams): boolean {
                refreshedDisplayName = params.displayName;
                return true;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        headerName: 'Before',
                        sortable: false,
                        headerComponentParams: { innerHeaderComponent: CapturingRefreshInner },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: CapturingRefreshInner },
            },
        ]);

        expect(refreshedDisplayName).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent without refresh receives updated params in init() when recreated', () => {
        let lastInitDisplayName: string | undefined;

        class NoRefreshCapturingInner {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitDisplayName = params.displayName;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        headerName: 'Before',
                        sortable: false,
                        headerComponentParams: { innerHeaderComponent: NoRefreshCapturingInner },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(lastInitDisplayName).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: NoRefreshCapturingInner },
            },
        ]);

        expect(lastInitDisplayName).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent receives updated params in init() when recreated after refresh returns false', () => {
        let lastInitDisplayName: string | undefined;

        class RejectingCapturingInner {
            private gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitDisplayName = params.displayName;
                this.gui = document.createElement('span');
            }
            refresh(_params: IHeaderParams): boolean {
                return false;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        headerName: 'Before',
                        sortable: false,
                        headerComponentParams: { innerHeaderComponent: RejectingCapturingInner },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(lastInitDisplayName).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: RejectingCapturingInner },
            },
        ]);

        expect(lastInitDisplayName).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent.refresh() receives updated innerHeaderComponentParams', () => {
        let refreshedLabel: string | undefined;

        class CapturingRefreshInnerWithLabel {
            private readonly gui = document.createElement('span');
            init(_params: IHeaderParams): void {}
            refresh(params: IHeaderParams): boolean {
                refreshedLabel = (params as any).customLabel;
                return true;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        sortable: false,
                        headerComponentParams: {
                            innerHeaderComponent: CapturingRefreshInnerWithLabel,
                            innerHeaderComponentParams: { customLabel: 'Before' },
                        },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                sortable: false,
                headerComponentParams: {
                    innerHeaderComponent: CapturingRefreshInnerWithLabel,
                    innerHeaderComponentParams: { customLabel: 'After' },
                },
            },
        ]);

        expect(refreshedLabel).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent without refresh receives updated innerHeaderComponentParams in init() when recreated', () => {
        let lastInitLabel: string | undefined;

        class NoRefreshCapturingInnerWithLabel {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitLabel = (params as any).customLabel;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        sortable: false,
                        headerComponentParams: {
                            innerHeaderComponent: NoRefreshCapturingInnerWithLabel,
                            innerHeaderComponentParams: { customLabel: 'Before' },
                        },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(lastInitLabel).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                sortable: false,
                headerComponentParams: {
                    innerHeaderComponent: NoRefreshCapturingInnerWithLabel,
                    innerHeaderComponentParams: { customLabel: 'After' },
                },
            },
        ]);

        expect(lastInitLabel).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent receives updated innerHeaderComponentParams in init() when recreated after refresh returns false', () => {
        let lastInitLabel: string | undefined;

        class RejectingCapturingInnerWithLabel {
            private gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitLabel = (params as any).customLabel;
                this.gui = document.createElement('span');
            }
            refresh(_params: IHeaderParams): boolean {
                return false;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }

        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        sortable: false,
                        headerComponentParams: {
                            innerHeaderComponent: RejectingCapturingInnerWithLabel,
                            innerHeaderComponentParams: { customLabel: 'Before' },
                        },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(lastInitLabel).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                sortable: false,
                headerComponentParams: {
                    innerHeaderComponent: RejectingCapturingInnerWithLabel,
                    innerHeaderComponentParams: { customLabel: 'After' },
                },
            },
        ]);

        expect(lastInitLabel).toBe('After');

        api.destroy();
    });
});
