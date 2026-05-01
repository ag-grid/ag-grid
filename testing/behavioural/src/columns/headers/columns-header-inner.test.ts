import type { ColDef, IHeaderParams } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';

const rowData = [{ a: 1, b: 10 }];

interface TrackedClass {
    initCount: number;
    destroyCount: number;
    refreshCount: number;
    reset(): void;
    new (): TrackedInstance;
}

interface TrackedInstance {
    init(params: IHeaderParams): void;
    refresh?(params: IHeaderParams): boolean;
    getGui(): HTMLElement;
    destroy(): void;
}

function makeTrackedInnerHeader(refreshBehaviour: 'accept' | 'reject' | 'none'): TrackedClass {
    class TrackedComp {
        static initCount = 0;
        static destroyCount = 0;
        static refreshCount = 0;

        static reset(): void {
            TrackedComp.initCount = 0;
            TrackedComp.destroyCount = 0;
            TrackedComp.refreshCount = 0;
        }

        private gui = document.createElement('span');

        init(_params: IHeaderParams): void {
            TrackedComp.initCount++;
            this.gui = document.createElement('span');
            this.gui.textContent = 'Inner';
        }

        getGui(): HTMLElement {
            return this.gui;
        }

        destroy(): void {
            TrackedComp.destroyCount++;
        }
    }

    if (refreshBehaviour === 'none') {
        return TrackedComp as unknown as TrackedClass;
    }

    const returns = refreshBehaviour === 'accept';
    class WithRefresh extends TrackedComp {
        refresh(_params: IHeaderParams): boolean {
            TrackedComp.refreshCount++;
            return returns;
        }
    }
    return WithRefresh as unknown as TrackedClass;
}

const TrackingHeaderComp = makeTrackedInnerHeader('accept');
const TrackingInnerHeader = makeTrackedInnerHeader('accept');
const AlternativeInnerHeader = makeTrackedInnerHeader('accept');
const NoRefreshInnerHeader = makeTrackedInnerHeader('none');
const RejectingInnerHeader = makeTrackedInnerHeader('reject');

const columnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: TrackingInnerHeader } },
];

const rejectingColumnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: RejectingInnerHeader } },
];

const headerText = (el: HTMLElement) => el.querySelector('.ag-header-cell-text')?.textContent;

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
        expect(headerText(eGridDiv)).toBe('Inner');

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
        expect(headerText(eGridDiv)).toBe('Inner');

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
        expect(headerText(eGridDiv)).toBe('Inner');

        api.setGridOption('columnDefs', [...rejectingColumnDefs]);

        // Inner component signalled it cannot handle the update — it should be replaced
        expect(RejectingInnerHeader.refreshCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(2);

        // Outer headerComp on the adjacent column must not have been remounted
        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);
        expect(headerText(eGridDiv)).toBe('Inner');

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
        expect(headerText(eGridDiv)).toBe('Inner');

        api.setGridOption('columnDefs', [
            { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: AlternativeInnerHeader } },
        ]);

        // Old component should be destroyed and the new class initialised in its place
        expect(TrackingInnerHeader.destroyCount).toBe(1);
        expect(AlternativeInnerHeader.initCount).toBe(1);
        expect(headerText(eGridDiv)).toBe('Inner');

        api.destroy();
    });

    test('removing innerHeaderComponent restores display name text in the header cell', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        headerName: 'My Header',
                        sortable: false,
                        headerComponentParams: { innerHeaderComponent: TrackingInnerHeader },
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );

        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(headerText(eGridDiv)).toBe('Inner');

        api.setGridOption('columnDefs', [{ field: 'b', headerName: 'My Header', sortable: false }]);

        expect(TrackingInnerHeader.destroyCount).toBe(1);
        expect(headerText(eGridDiv)).toBe('My Header');

        api.destroy();
    });

    test('adding innerHeaderComponent when it was not originally present correctly renderers new innerHeaderComponent', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            {
                columnDefs: [
                    {
                        field: 'b',
                        headerName: 'My Header',
                        sortable: false,
                    },
                ],
                rowData,
            },
            { modules: [ClientSideRowModelModule] }
        );
        expect(headerText(eGridDiv)).toBe('My Header');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'My Header',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: TrackingInnerHeader },
            },
        ]);

        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(TrackingInnerHeader.destroyCount).toBe(0);
        expect(headerText(eGridDiv)).toBe('Inner');

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
        expect(headerText(eGridDiv)).toBe('Inner');

        api.setGridOption('columnDefs', [...noRefreshDefs]);

        expect(NoRefreshInnerHeader.destroyCount).toBe(1);
        expect(NoRefreshInnerHeader.initCount).toBe(2);
        expect(headerText(eGridDiv)).toBe('Inner');

        api.destroy();
    });

    test('innerHeaderComponent.refresh() receives updated params when column def changes', () => {
        let refreshedDisplayName: string | undefined;

        class CapturingRefreshInner {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                this.gui.textContent = params.displayName;
            }
            refresh(params: IHeaderParams): boolean {
                refreshedDisplayName = params.displayName;
                this.gui.textContent = params.displayName;
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

        expect(headerText(eGridDiv)).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: CapturingRefreshInner },
            },
        ]);

        expect(refreshedDisplayName).toBe('After');
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent without refresh receives updated params in init() when recreated', () => {
        let lastInitDisplayName: string | undefined;

        class NoRefreshCapturingInner {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitDisplayName = params.displayName;
                this.gui.textContent = params.displayName;
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
        expect(headerText(eGridDiv)).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: NoRefreshCapturingInner },
            },
        ]);

        expect(lastInitDisplayName).toBe('After');
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent receives updated params in init() when recreated after refresh returns false', () => {
        let lastInitDisplayName: string | undefined;

        class RejectingCapturingInner {
            private gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitDisplayName = params.displayName;
                this.gui = document.createElement('span');
                this.gui.textContent = params.displayName;
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
        expect(headerText(eGridDiv)).toBe('Before');

        api.setGridOption('columnDefs', [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: RejectingCapturingInner },
            },
        ]);

        expect(lastInitDisplayName).toBe('After');
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent.refresh() receives updated innerHeaderComponentParams', () => {
        let refreshedLabel: string | undefined;

        class CapturingRefreshInnerWithLabel {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                this.gui.textContent = (params as any).customLabel;
            }
            refresh(params: IHeaderParams): boolean {
                refreshedLabel = (params as any).customLabel;
                this.gui.textContent = (params as any).customLabel;
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

        expect(headerText(eGridDiv)).toBe('Before');

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
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent without refresh receives updated innerHeaderComponentParams in init() when recreated', () => {
        let lastInitLabel: string | undefined;

        class NoRefreshCapturingInnerWithLabel {
            private readonly gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitLabel = (params as any).customLabel;
                this.gui.textContent = (params as any).customLabel;
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
        expect(headerText(eGridDiv)).toBe('Before');

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
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });

    test('innerHeaderComponent receives updated innerHeaderComponentParams in init() when recreated after refresh returns false', () => {
        let lastInitLabel: string | undefined;

        class RejectingCapturingInnerWithLabel {
            private gui = document.createElement('span');
            init(params: IHeaderParams): void {
                lastInitLabel = (params as any).customLabel;
                this.gui = document.createElement('span');
                this.gui.textContent = (params as any).customLabel;
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
        expect(headerText(eGridDiv)).toBe('Before');

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
        expect(headerText(eGridDiv)).toBe('After');

        api.destroy();
    });
});
