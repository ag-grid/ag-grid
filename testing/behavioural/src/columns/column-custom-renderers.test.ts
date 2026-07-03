/**
 * Tests for custom header components and renderers to verify
 * they integrate correctly with the column model and DOM validation.
 */
import { vitest } from 'vitest';

import type { ColDef, IHeaderComp, IHeaderGroupComp, IHeaderGroupParams, IHeaderParams } from 'ag-grid-community';
import { ClientSideRowModelModule, TooltipModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

describe('Column Custom Renderers', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TooltipModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('custom header component', () => {
        test('column with headerComponent still validates correctly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'custom',
                        headerName: 'Custom Header',
                        headerComponent: class implements IHeaderComp {
                            private eGui!: HTMLDivElement;
                            init(params: IHeaderParams): void {
                                this.eGui = document.createElement('div');
                                this.eGui.textContent = params.displayName;
                                this.eGui.className = 'my-custom-header';
                            }
                            getGui(): HTMLElement {
                                return this.eGui;
                            }
                            refresh(): boolean {
                                return false;
                            }
                        },
                    },
                    { colId: 'normal' },
                ],
                rowData: [{ custom: 1, normal: 2 }],
            });

            // Column model should be correct regardless of custom renderer
            await new GridColumns(api, 'with custom header').checkColumns(`
                CENTER
                ├── custom "Custom Header" width:200
                └── normal width:200
            `);

            // Verify the custom header is in the DOM
            const gridDiv = getGridElement(api)! as HTMLElement;
            const customEl = gridDiv.querySelector('.my-custom-header');
            expect(customEl).not.toBeNull();
            expect(customEl!.textContent).toBe('Custom Header');
        });

        test('column with headerComponentParams passes params', async () => {
            let capturedParams: any = null;

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        headerName: 'Alpha',
                        headerComponent: class implements IHeaderComp {
                            private eGui!: HTMLDivElement;
                            init(params: any): void {
                                capturedParams = params;
                                this.eGui = document.createElement('div');
                                this.eGui.textContent = params.displayName;
                            }
                            getGui(): HTMLElement {
                                return this.eGui;
                            }
                            refresh(): boolean {
                                return false;
                            }
                        },
                    },
                ],
                rowData: [{ a: 1 }],
            });

            expect(capturedParams).not.toBeNull();
            expect(capturedParams.displayName).toBe('Alpha');
            expect(capturedParams.column).toBeDefined();
            expect(capturedParams.column.getColId()).toBe('a');

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a "Alpha" width:200
            `);
        });
    });

    describe('custom group header component', () => {
        test('group with headerGroupComponent validates correctly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'My Group',
                        headerGroupComponent: class implements IHeaderGroupComp {
                            private eGui!: HTMLDivElement;
                            init(params: any): void {
                                this.eGui = document.createElement('div');
                                this.eGui.textContent = params.displayName;
                                this.eGui.className = 'my-custom-group-header';
                            }
                            getGui(): HTMLElement {
                                return this.eGui;
                            }
                        },
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'with custom group header').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP
                  ├── a width:200
                  └── b width:200
            `);

            // Verify custom group header is in DOM
            const gridDiv = getGridElement(api)! as HTMLElement;
            const customGroupEl = gridDiv.querySelector('.my-custom-group-header');
            expect(customGroupEl).not.toBeNull();
            expect(customGroupEl!.textContent).toBe('My Group');
        });
    });

    describe('headerClass from colDef', () => {
        test('string headerClass is applied to header cell', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerClass: 'my-header-class' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const headerA = gridDiv.querySelector('[col-id="a"].ag-header-cell');
            expect(headerA).not.toBeNull();
            expect(headerA!.classList.contains('my-header-class')).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('array headerClass applies all classes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerClass: ['class-one', 'class-two'] }],
                rowData: [{ a: 1 }],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const headerA = gridDiv.querySelector('[col-id="a"].ag-header-cell');
            expect(headerA!.classList.contains('class-one')).toBe(true);
            expect(headerA!.classList.contains('class-two')).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a width:200
            `);
        });

        test('function headerClass is called with params', async () => {
            const headerClassFn = vitest.fn().mockReturnValue('dynamic-class');

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerClass: headerClassFn }],
                rowData: [{ a: 1 }],
            });

            expect(headerClassFn).toHaveBeenCalled();
            const params = headerClassFn.mock.calls[0][0];
            expect(params.colDef).toBeDefined();
            expect(params.column).toBeDefined();

            const gridDiv = getGridElement(api)! as HTMLElement;
            const headerA = gridDiv.querySelector('[col-id="a"].ag-header-cell');
            expect(headerA!.classList.contains('dynamic-class')).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a width:200
            `);
        });
    });

    describe('wrapHeaderText', () => {
        test('wrapHeaderText adds CSS class to header', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'wrapped', headerName: 'Long Header Name', wrapHeaderText: true },
                    { colId: 'normal' },
                ],
                rowData: [{ wrapped: 1, normal: 2 }],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const wrappedHeader = gridDiv.querySelector('[col-id="wrapped"].ag-header-cell');
            const normalHeader = gridDiv.querySelector('[col-id="normal"].ag-header-cell');

            expect(wrappedHeader!.classList.contains('ag-header-cell-wrap-text')).toBe(true);
            expect(normalHeader!.classList.contains('ag-header-cell-wrap-text')).toBe(false);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── wrapped "Long Header Name" width:200
                └── normal width:200
            `);
        });
    });

    describe('suppressHeaderMenuButton', () => {
        test('suppressHeaderMenuButton hides menu button', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', suppressHeaderMenuButton: true }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
            });

            // Column model should be the same regardless
            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('column with tooltip', () => {
        test('headerTooltip does not affect column structure', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerTooltip: 'This is column A' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('AG-17086 setTooltip does not throw after HeaderCellCtrl is destroyed', async () => {
            let capturedSetTooltip: IHeaderParams['setTooltip'] | null = null;

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        headerTooltip: 'Tooltip A',
                        headerComponent: class implements IHeaderComp {
                            private eGui!: HTMLDivElement;
                            init(params: IHeaderParams): void {
                                capturedSetTooltip = params.setTooltip;
                                this.eGui = document.createElement('div');
                                this.eGui.textContent = params.displayName;
                            }
                            getGui(): HTMLElement {
                                return this.eGui;
                            }
                            refresh(): boolean {
                                return false;
                            }
                        },
                    },
                    { colId: 'b' },
                ],
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(api, `AG-17086 setTooltip does not throw after HeaderCellCtrl is destroyed setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `AG-17086 setTooltip does not throw after HeaderCellCtrl is destroyed setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `
            );

            expect(capturedSetTooltip).not.toBeNull();

            // Remove the column, which destroys its HeaderCellCtrl and nullifies this.column
            api.setGridOption('columnDefs', [{ colId: 'b' }]);
            await new GridColumns(
                api,
                `AG-17086 setTooltip does not throw after HeaderCellCtrl is destroyed after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── b width:200
            `);
            await new GridRows(
                api,
                `AG-17086 setTooltip does not throw after HeaderCellCtrl is destroyed after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            // Calling setTooltip after destruction should be a no-op, not a crash
            expect(() => capturedSetTooltip!('late tooltip', () => true)).not.toThrow();
        });

        test('AG-17086 setTooltip does not throw after HeaderGroupCellCtrl is destroyed', async () => {
            let capturedSetTooltip: IHeaderGroupParams['setTooltip'] | null = null;

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group',
                        headerGroupComponent: class implements IHeaderGroupComp {
                            private eGui!: HTMLDivElement;
                            init(params: IHeaderGroupParams): void {
                                capturedSetTooltip = params.setTooltip;
                                this.eGui = document.createElement('div');
                                this.eGui.textContent = params.displayName;
                            }
                            getGui(): HTMLElement {
                                return this.eGui;
                            }
                        },
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(
                api,
                `AG-17086 setTooltip does not throw after HeaderGroupCellCtrl is destroyed setup`
            ).checkColumns(`
                CENTER
                └─┬ "Group" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(api, `AG-17086 setTooltip does not throw after HeaderGroupCellCtrl is destroyed setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);

            expect(capturedSetTooltip).not.toBeNull();

            // Replace columns, destroying the group header and its controller
            api.setGridOption('columnDefs', [{ colId: 'c' }]);
            await new GridColumns(
                api,
                `AG-17086 setTooltip does not throw after HeaderGroupCellCtrl is destroyed after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── c width:200
            `);
            await new GridRows(
                api,
                `AG-17086 setTooltip does not throw after HeaderGroupCellCtrl is destroyed after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            // Calling setTooltip after destruction should be a no-op, not a crash
            expect(() => capturedSetTooltip!('late tooltip', () => true)).not.toThrow();
        });
    });

    describe('autoHeaderHeight', () => {
        test('autoHeaderHeight column has correct CSS class', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'auto', autoHeaderHeight: true, headerName: 'Auto Height' }, { colId: 'normal' }],
                rowData: [{ auto: 1, normal: 2 }],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const autoHeader = gridDiv.querySelector('[col-id="auto"].ag-header-cell');
            expect(autoHeader!.classList.contains('ag-header-cell-auto-height')).toBe(true);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── auto "Auto Height" width:200
                └── normal width:200
            `);
        });
    });

    describe('multiple grids with shared column defs', () => {
        test('two grids with same colDefs are independent', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api1 = gridsManager.createGrid('grid1', { columnDefs });
            const api2 = gridsManager.createGrid('grid2', { columnDefs });

            // Modify grid1 only
            api1.setColumnsVisible(['b'], false);
            api1.setColumnsPinned(['a'], 'left');

            // Grid1 should be modified
            await new GridColumns(api1, 'grid1 modified').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── c width:200
            `);

            // Grid2 should be unaffected
            await new GridColumns(api2, 'grid2 unchanged').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });
    });
});
