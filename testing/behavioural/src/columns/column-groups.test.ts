import type { ColDef, ColGroupDef, ColumnGroup } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column Groups', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('empty groups stay findable (matches released behaviour)', () => {
        test('a group declared with no children remains discoverable via the group APIs', async () => {
            const api = gridsManager.createGrid('empty-declared', {
                columnDefs: [{ field: 'a' }, { headerName: 'Empty', groupId: 'emptyDeclared', children: [] }] as (
                    | ColDef
                    | ColGroupDef
                )[],
                rowData: [{ a: 1 }],
            });
            await asyncSetTimeout(1);

            // An explicitly declared (even empty) group is not silently dropped: it stays findable.
            const group = api.getProvidedColumnGroup('emptyDeclared') as unknown as {
                isAlive(): boolean;
                children: unknown[];
            } | null;
            expect(group === null).toBe(false);
            expect(group!.isAlive()).toBe(true);
            expect(group!.children.length).toBe(0);
            expect(api.getColumnGroupState().some((s) => s.groupId === 'emptyDeclared')).toBe(true);
            await new GridColumns(api, 'declared empty group kept').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });

        test('a group emptied via setColumnDefs stays findable (now empty)', async () => {
            const api = gridsManager.createGrid('empty-runtime', {
                columnDefs: [{ field: 'a' }, { headerName: 'G', groupId: 'g2', children: [{ field: 'b' }] }] as (
                    | ColDef
                    | ColGroupDef
                )[],
                rowData: [{ a: 1, b: 2 }],
            });
            await asyncSetTimeout(1);
            expect(api.getProvidedColumnGroup('g2') === null).toBe(false);

            api.setGridOption('columnDefs', [{ field: 'a' }, { headerName: 'G', groupId: 'g2', children: [] }] as (
                | ColDef
                | ColGroupDef
            )[]);
            await asyncSetTimeout(1);

            const group = api.getProvidedColumnGroup('g2') as unknown as { children: unknown[] } | null;
            expect(group === null).toBe(false);
            expect(group!.children.length).toBe(0);
            expect(api.getColumnGroupState().some((s) => s.groupId === 'g2')).toBe(true);
            await new GridColumns(api, 'group emptied via setColumnDefs kept').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });

        test('getColumnGroupState surfaces synthetic padding groups (matches latest)', async () => {
            const api = gridsManager.createGrid('group-state-padding', {
                columnDefs: [
                    { groupId: 'G', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] },
                    { field: 'c' },
                ] as (ColDef | ColGroupDef)[],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await asyncSetTimeout(1);

            const state = api.getColumnGroupState();
            expect(state.some((s) => s.groupId === 'G')).toBe(true);
            expect(state.some((s) => s.groupId !== 'G')).toBe(true); // the synthetic padding group for `c`
            expect(state.length).toBe(2);
        });
    });

    describe('group expand state survives a rebuild', () => {
        // Generated-id groups are recreated on rebuild (can't be reused), so the build must carry their expand state over.
        test('a generated-id group stays expanded across a columnDefs rebuild (no calc cols)', async () => {
            const makeDefs = (): (ColDef | ColGroupDef)[] => [
                { headerName: 'G', children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }] },
                { field: 'c' },
            ];
            const api = gridsManager.createGrid('gen-id-expand', {
                columnDefs: makeDefs(),
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await asyncSetTimeout(1);

            // Expand the (generated-id) expandable group.
            const initial = api.getColumnGroupState();
            api.setColumnGroupState(initial.map((s) => ({ groupId: s.groupId, open: true })));
            const openedIds = api
                .getColumnGroupState()
                .filter((s) => s.open)
                .map((s) => s.groupId);
            expect(openedIds.length).toBeGreaterThan(0);

            // Rebuild from fresh (structurally identical) colDefs — recreates the generated-id group.
            api.setGridOption('columnDefs', makeDefs());
            await asyncSetTimeout(1);

            // Its expand state must survive: the rebuild must not collapse it.
            expect(
                api
                    .getColumnGroupState()
                    .filter((s) => s.open)
                    .map((s) => s.groupId)
            ).toEqual(openedIds);
        });
    });

    describe('single-level column groups', () => {
        test('group with two children', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Name',
                    children: [
                        { colId: 'first', headerName: 'First' },
                        { colId: 'last', headerName: 'Last' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single group').checkColumns(`
                CENTER
                └─┬ "Name" GROUP
                  ├── first "First" width:200
                  └── last "Last" width:200
            `);
        });

        test('multiple groups side by side', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Group A',
                    children: [{ colId: 'a1' }, { colId: 'a2' }],
                },
                {
                    headerName: 'Group B',
                    children: [{ colId: 'b1' }, { colId: 'b2' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'side-by-side groups').checkColumns(`
                CENTER
                ├─┬ "Group A" GROUP
                │ ├── a1 width:200
                │ └── a2 width:200
                └─┬ "Group B" GROUP
                  ├── b1 width:200
                  └── b2 width:200
            `);
        });

        test('group with a single child', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Solo Group',
                    children: [{ colId: 'only' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single-child group').checkColumns(`
                CENTER
                └─┬ "Solo Group" GROUP
                  └── only width:200
            `);
        });

        test('group with explicit groupId', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    groupId: 'myGroup',
                    headerName: 'My Group',
                    children: [{ colId: 'c1' }, { colId: 'c2' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'explicit groupId').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP
                  ├── c1 width:200
                  └── c2 width:200
            `);
        });
    });

    describe('multi-level nested groups', () => {
        test('two levels deep', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Outer',
                    children: [
                        {
                            headerName: 'Inner',
                            children: [{ colId: 'a' }, { colId: 'b' }],
                        },
                        { colId: 'c' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'two levels').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP
                  ├─┬ "Inner" GROUP
                  │ ├── a width:200
                  │ └── b width:200
                  └── c width:200
            `);
        });

        test('three levels deep', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Level 1',
                    children: [
                        {
                            headerName: 'Level 2',
                            children: [
                                {
                                    headerName: 'Level 3',
                                    children: [{ colId: 'deep' }],
                                },
                            ],
                        },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'three levels').checkColumns(`
                CENTER
                └─┬ "Level 1" GROUP
                  └─┬ "Level 2" GROUP
                    └─┬ "Level 3" GROUP
                      └── deep width:200
            `);
        });

        test('nested groups with siblings at each level', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Root',
                    children: [
                        {
                            headerName: 'Left Branch',
                            children: [{ colId: 'l1' }, { colId: 'l2' }],
                        },
                        {
                            headerName: 'Right Branch',
                            children: [{ colId: 'r1' }, { colId: 'r2' }],
                        },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'sibling nested groups').checkColumns(`
                CENTER
                └─┬ "Root" GROUP
                  ├─┬ "Left Branch" GROUP
                  │ ├── l1 width:200
                  │ └── l2 width:200
                  └─┬ "Right Branch" GROUP
                    ├── r1 width:200
                    └── r2 width:200
            `);
        });
    });

    describe('group expansion and collapse', () => {
        test('expandable group in open state shows open indicator', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Expandable',
                    groupId: 'expandable',
                    openByDefault: true,
                    children: [
                        { colId: 'always' },
                        { colId: 'open_only', columnGroupShow: 'open' },
                        { colId: 'closed_only', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'open expandable group').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP open
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open
                  └── closed_only width:200 columnGroupShow:closed hidden
            `);
        });

        test('expandable group in closed state shows closed indicator', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Collapsible',
                    groupId: 'collapsible',
                    openByDefault: false,
                    children: [
                        { colId: 'always' },
                        { colId: 'open_only', columnGroupShow: 'open' },
                        { colId: 'closed_only', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'closed expandable group').checkColumns(`
                CENTER
                └─┬ "Collapsible" GROUP closed
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open hidden
                  └── closed_only width:200 columnGroupShow:closed
            `);
        });

        test('non-expandable group has no open/closed state', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Static',
                    children: [{ colId: 'a' }, { colId: 'b' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'non-expandable group').checkColumns(`
                CENTER
                └─┬ "Static" GROUP
                  ├── a width:200
                  └── b width:200
            `);
        });

        test('collapsing/expanding clears the left of children that leave the displayed set (no stale offset)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Expandable',
                    groupId: 'expandable',
                    openByDefault: true,
                    children: [
                        { colId: 'always' },
                        { colId: 'open_only', columnGroupShow: 'open' },
                        { colId: 'closed_only', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            const openOnly = api.getColumn('open_only')!;
            const closedOnly = api.getColumn('closed_only')!;
            expect(openOnly.getLeft()).not.toBeNull();
            expect(closedOnly.getLeft()).toBeNull();
            await new GridColumns(api, 'open: open_only shown, closed_only hidden').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP open
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open
                  └── closed_only width:200 columnGroupShow:closed hidden
            `);

            api.setColumnGroupOpened('expandable', false);
            expect(openOnly.getLeft()).toBeNull();
            expect(closedOnly.getLeft()).not.toBeNull();
            await new GridColumns(api, 'collapsed: open_only hidden, closed_only shown').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP closed
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open hidden
                  └── closed_only width:200 columnGroupShow:closed
            `);

            api.setColumnGroupOpened('expandable', true);
            expect(openOnly.getLeft()).not.toBeNull();
            expect(closedOnly.getLeft()).toBeNull();
            await new GridColumns(api, 're-expanded: back to open_only shown, closed_only hidden').checkColumns(`
                CENTER
                └─┬ "Expandable" GROUP open
                  ├── always width:200
                  ├── open_only width:200 columnGroupShow:open
                  └── closed_only width:200 columnGroupShow:closed hidden
            `);
        });
    });

    describe('columnGroupShow behaviour', () => {
        test('all children with no columnGroupShow - group is not expandable', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Always Visible',
                    children: [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'no columnGroupShow').checkColumns(`
                CENTER
                └─┬ "Always Visible" GROUP
                  ├── x width:200
                  ├── y width:200
                  └── z width:200
            `);
        });

        test('mixed columnGroupShow values when group is open', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Mixed',
                    groupId: 'mixed',
                    openByDefault: true,
                    children: [
                        { colId: 'default1' },
                        { colId: 'show_open', columnGroupShow: 'open' },
                        { colId: 'default2' },
                        { colId: 'show_closed', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'mixed open').checkColumns(`
                CENTER
                └─┬ "Mixed" GROUP open
                  ├── default1 width:200
                  ├── show_open width:200 columnGroupShow:open
                  ├── default2 width:200
                  └── show_closed width:200 columnGroupShow:closed hidden
            `);
        });

        test('mixed columnGroupShow values when group is closed', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Mixed',
                    groupId: 'mixed',
                    openByDefault: false,
                    children: [
                        { colId: 'default1' },
                        { colId: 'show_open', columnGroupShow: 'open' },
                        { colId: 'default2' },
                        { colId: 'show_closed', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'mixed closed').checkColumns(`
                CENTER
                └─┬ "Mixed" GROUP closed
                  ├── default1 width:200
                  ├── show_open width:200 columnGroupShow:open hidden
                  ├── default2 width:200
                  └── show_closed width:200 columnGroupShow:closed
            `);
        });

        test('only open children - group is expandable', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Open Only',
                    groupId: 'openOnly',
                    openByDefault: true,
                    children: [
                        { colId: 'always' },
                        { colId: 'extra1', columnGroupShow: 'open' },
                        { colId: 'extra2', columnGroupShow: 'open' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'only open children, expanded').checkColumns(`
                CENTER
                └─┬ "Open Only" GROUP open
                  ├── always width:200
                  ├── extra1 width:200 columnGroupShow:open
                  └── extra2 width:200 columnGroupShow:open
            `);
        });

        test('only closed children - group is expandable', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Closed Only',
                    groupId: 'closedOnly',
                    openByDefault: false,
                    children: [{ colId: 'always' }, { colId: 'compact', columnGroupShow: 'closed' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'only closed children, collapsed').checkColumns(`
                CENTER
                └─┬ "Closed Only" GROUP closed
                  ├── always width:200
                  └── compact width:200 columnGroupShow:closed
            `);
        });
    });

    describe('expandable recomputes on visibility toggle', () => {
        test('hiding the only changeable child makes group not-expandable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Mixed',
                        groupId: 'mixed',
                        openByDefault: true,
                        children: [
                            { colId: 'always' },
                            { colId: 'detail', columnGroupShow: 'open' },
                            { colId: 'summary', columnGroupShow: 'closed' },
                        ],
                    },
                ],
            });

            await new GridColumns(api, 'all visible').checkColumns(`
                CENTER
                └─┬ "Mixed" GROUP open
                  ├── always width:200
                  ├── detail width:200 columnGroupShow:open
                  └── summary width:200 columnGroupShow:closed hidden
            `);

            // Capture `expandableChanged` on the provided group.
            const providedGroup = (api.getColumn('always') as any).originalParent;
            const expandableEvents: any[] = [];
            providedGroup.addEventListener('expandableChanged', (e: any) => expandableEvents.push(e));

            api.setColumnsVisible(['detail', 'summary'], false);
            await new GridColumns(api, 'no changeable left').checkColumns(`
                CENTER
                └─┬ "Mixed" GROUP
                  └── always width:200
            `);
            // Group flipped from expandable=true → false → event fires.
            expect(expandableEvents.length).toBeGreaterThan(0);
        });

        test('showing a changeable child makes a previously-flat group expandable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Latent',
                        groupId: 'latent',
                        openByDefault: false,
                        children: [
                            { colId: 'a' },
                            { colId: 'b' },
                            { colId: 'detail', columnGroupShow: 'open', hide: true },
                        ],
                    },
                ],
            });

            await new GridColumns(api, 'initially flat').checkColumns(`
                CENTER
                └─┬ "Latent" GROUP
                  ├── a width:200
                  └── b width:200
            `);

            api.setColumnsVisible(['detail'], true);
            await new GridColumns(api, 'after unhide').checkColumns(`
                CENTER
                └─┬ "Latent" GROUP closed
                  ├── a width:200
                  ├── b width:200
                  └── detail width:200 columnGroupShow:open hidden
            `);
        });

        test('toggle visibility updates ALL ancestor groups in a nested tree', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        groupId: 'outer',
                        openByDefault: true,
                        children: [
                            {
                                headerName: 'Inner',
                                groupId: 'inner',
                                openByDefault: true,
                                children: [
                                    { colId: 'leaf' },
                                    { colId: 'detail', columnGroupShow: 'open' },
                                    { colId: 'summary', columnGroupShow: 'closed' },
                                ],
                            },
                            { colId: 'sibling', columnGroupShow: 'open' },
                        ],
                    },
                ],
            });

            await new GridColumns(api, 'all visible nested').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP open
                  ├─┬ "Inner" GROUP open
                  │ ├── leaf width:200
                  │ ├── detail width:200 columnGroupShow:open
                  │ └── summary width:200 columnGroupShow:closed hidden
                  └── sibling width:200 columnGroupShow:open
            `);

            api.setColumnsVisible(['detail', 'summary', 'sibling'], false);
            await new GridColumns(api, 'no changeable anywhere').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP
                  └─┬ "Inner" GROUP
                    └── leaf width:200
            `);

            api.setColumnsVisible(['detail'], true);
            await new GridColumns(api, 'only inner changeable').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP
                  └─┬ "Inner" GROUP open
                    ├── leaf width:200
                    └── detail width:200 columnGroupShow:open
            `);
        });
    });

    describe('expandable propagation through padded ancestor chains', () => {
        test('toggling visibility of a deeply-nested col flips a real ancestor across padding', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Deep',
                        groupId: 'deep',
                        openByDefault: true,
                        children: [
                            { colId: 'leaf' },
                            { colId: 'detail', columnGroupShow: 'open' },
                            { colId: 'summary', columnGroupShow: 'closed' },
                        ],
                    },
                    // `c` is a flat leaf alongside a 1-level-deep group → c gets a padded chain.
                    { colId: 'c' },
                ],
            });

            await new GridColumns(api, 'initial deep+padded sibling').checkColumns(`
                CENTER
                ├─┬ "Deep" GROUP open
                │ ├── leaf width:200
                │ ├── detail width:200 columnGroupShow:open
                │ └── summary width:200 columnGroupShow:closed hidden
                └── c width:200
            `);

            api.setColumnsVisible(['detail', 'summary'], false);
            await new GridColumns(api, 'deep loses expandability after walk through padding').checkColumns(`
                CENTER
                ├─┬ "Deep" GROUP
                │ └── leaf width:200
                └── c width:200
            `);
        });
    });

    describe('display-tree run-merging', () => {
        test('siblings sharing an originalParent fold under one display wrapper', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }] }],
            });

            await new GridColumns(api, 'three siblings, one wrapper').checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── a width:200
                  ├── b width:200
                  └── c width:200
            `);
        });
    });

    describe('marryChildren', () => {
        test('group with marryChildren keeps children together', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Married',
                    marryChildren: true,
                    children: [{ colId: 'm1' }, { colId: 'm2' }, { colId: 'm3' }],
                },
                { colId: 'standalone' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'marryChildren group').checkColumns(`
                CENTER
                ├─┬ "Married" GROUP marryChildren
                │ ├── m1 width:200
                │ ├── m2 width:200
                │ └── m3 width:200
                └── standalone width:200
            `);
        });

        test('marryChildren with expandable group', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Married Expandable',
                    groupId: 'marriedExp',
                    marryChildren: true,
                    openByDefault: true,
                    children: [{ colId: 'always' }, { colId: 'detail', columnGroupShow: 'open' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'married expandable').checkColumns(`
                CENTER
                └─┬ "Married Expandable" GROUP open marryChildren
                  ├── always width:200
                  └── detail width:200 columnGroupShow:open
            `);
        });
    });

    describe('openByDefault', () => {
        test('openByDefault: true starts group expanded', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Default Open',
                    groupId: 'defOpen',
                    openByDefault: true,
                    children: [
                        { colId: 'a' },
                        { colId: 'b', columnGroupShow: 'open' },
                        { colId: 'c', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'openByDefault true').checkColumns(`
                CENTER
                └─┬ "Default Open" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);
        });

        test('openByDefault: false starts group collapsed', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Default Closed',
                    groupId: 'defClosed',
                    openByDefault: false,
                    children: [
                        { colId: 'a' },
                        { colId: 'b', columnGroupShow: 'open' },
                        { colId: 'c', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'openByDefault false').checkColumns(`
                CENTER
                └─┬ "Default Closed" GROUP closed
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open hidden
                  └── c width:200 columnGroupShow:closed
            `);
        });

        test('openByDefault not set defaults to closed', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'No Default',
                    groupId: 'noDefault',
                    children: [{ colId: 'a' }, { colId: 'extra', columnGroupShow: 'open' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'openByDefault omitted').checkColumns(`
                CENTER
                └─┬ "No Default" GROUP closed
                  ├── a width:200
                  └── extra width:200 columnGroupShow:open hidden
            `);
        });
    });

    describe('unbalanced groups', () => {
        test('some columns in groups and some standalone', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'standalone1' },
                {
                    headerName: 'Grouped',
                    children: [{ colId: 'g1' }, { colId: 'g2' }],
                },
                { colId: 'standalone2' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Standalone columns at the same level as the group; padding groups are skipped
            await new GridColumns(api, 'unbalanced').checkColumns(`
                CENTER
                ├── standalone1 width:200
                ├─┬ "Grouped" GROUP
                │ ├── g1 width:200
                │ └── g2 width:200
                └── standalone2 width:200
            `);
        });

        test('standalone columns alongside nested groups', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'solo' },
                {
                    headerName: 'Outer',
                    children: [
                        {
                            headerName: 'Inner',
                            children: [{ colId: 'deep1' }, { colId: 'deep2' }],
                        },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // 'solo' is hoisted from its padding groups
            await new GridColumns(api, 'unbalanced nested').checkColumns(`
                CENTER
                ├── solo width:200
                └─┬ "Outer" GROUP
                  └─┬ "Inner" GROUP
                    ├── deep1 width:200
                    └── deep2 width:200
            `);
        });

        test('showPaddingGroups option reveals padding groups', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'standalone' },
                {
                    headerName: 'Grouped',
                    children: [{ colId: 'g1' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // With showPaddingGroups, the auto-created padding group is visible
            await new GridColumns(api, 'with padding groups', { showPaddingGroups: true }).checkColumns(`
                CENTER
                ├─┬ GROUP padding
                │ └── standalone width:200
                └─┬ "Grouped" GROUP
                  └── g1 width:200
            `);
        });
    });

    describe('groups with pinned columns', () => {
        test('group children in left pinned section', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Pinned Group',
                    children: [
                        { colId: 'p1', pinned: 'left' },
                        { colId: 'p2', pinned: 'left' },
                    ],
                },
                { colId: 'center1' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'left pinned group').checkColumns(`
                LEFT
                └─┬ "Pinned Group" GROUP
                  ├── p1 width:200
                  └── p2 width:200
                CENTER
                └── center1 width:200
            `);
        });

        test('group children split across pinned sections', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Split Group',
                    children: [
                        { colId: 'left1', pinned: 'left' },
                        { colId: 'center1' },
                        { colId: 'right1', pinned: 'right' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // When a group's children span multiple pinned sections, the group
            // is replicated in each section. Use true to print the diagram since
            // the exact format depends on how the grid handles group splitting.
            await new GridColumns(api, 'split across sections').checkColumns(`
                LEFT
                └─┬ "Split Group" GROUP
                  └── left1 width:200
                CENTER
                └─┬ "Split Group" GROUP
                  └── center1 width:200
                RIGHT
                └─┬ "Split Group" GROUP
                  └── right1 width:200
            `);
        });

        test('groups in all three sections', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Left Group',
                    children: [
                        { colId: 'l1', pinned: 'left' },
                        { colId: 'l2', pinned: 'left' },
                    ],
                },
                {
                    headerName: 'Center Group',
                    children: [{ colId: 'c1' }, { colId: 'c2' }],
                },
                {
                    headerName: 'Right Group',
                    children: [
                        { colId: 'r1', pinned: 'right' },
                        { colId: 'r2', pinned: 'right' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'groups in all sections').checkColumns(`
                LEFT
                └─┬ "Left Group" GROUP
                  ├── l1 width:200
                  └── l2 width:200
                CENTER
                └─┬ "Center Group" GROUP
                  ├── c1 width:200
                  └── c2 width:200
                RIGHT
                └─┬ "Right Group" GROUP
                  ├── r1 width:200
                  └── r2 width:200
            `);
        });
    });

    describe('empty groups', () => {
        test('group where all children are hidden', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'All Hidden',
                    children: [
                        { colId: 'h1', hide: true },
                        { colId: 'h2', hide: true },
                    ],
                },
                { colId: 'visible' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // The group with all hidden children should not appear; only the visible column shows
            await new GridColumns(api, 'all children hidden').checkColumns(`
                CENTER
                └── visible width:200
            `);
        });

        test('group with mix of hidden and visible children', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Partial',
                    children: [{ colId: 'shown' }, { colId: 'hidden', hide: true }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'partially hidden group').checkColumns(`
                CENTER
                └─┬ "Partial" GROUP
                  └── shown width:200
            `);
        });
    });

    describe('toggle group expansion via API', () => {
        test('collapse an open group via setColumnGroupOpened', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Toggle Group',
                    groupId: 'toggle',
                    openByDefault: true,
                    children: [
                        { colId: 'always' },
                        { colId: 'detail', columnGroupShow: 'open' },
                        { colId: 'summary', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Initially open
            await new GridColumns(api, 'initially open').checkColumns(`
                CENTER
                └─┬ "Toggle Group" GROUP open
                  ├── always width:200
                  ├── detail width:200 columnGroupShow:open
                  └── summary width:200 columnGroupShow:closed hidden
            `);

            // Capture grid-level `columnGroupOpened` + provided-group `expandedChanged` +
            // display-group `displayedChildrenChanged`.
            const groupOpenedEvents: any[] = [];
            api.addEventListener('columnGroupOpened', (e) => groupOpenedEvents.push(e));
            const providedGroup = (api.getColumn('always') as any).originalParent;
            const expandedEvents: any[] = [];
            providedGroup.addEventListener('expandedChanged', (e: any) => expandedEvents.push(e));
            const displayedGroup = (api.getColumn('always') as any).parent;
            const displayedChildrenEvents: any[] = [];
            displayedGroup.addEventListener('displayedChildrenChanged', (e: any) => displayedChildrenEvents.push(e));

            // Collapse via API (events are async — flush before asserting).
            api.setColumnGroupOpened('toggle', false);
            await asyncSetTimeout(0);

            await new GridColumns(api, 'after collapse').checkColumns(`
                CENTER
                └─┬ "Toggle Group" GROUP closed
                  ├── always width:200
                  ├── detail width:200 columnGroupShow:open hidden
                  └── summary width:200 columnGroupShow:closed
            `);

            expect(groupOpenedEvents.length).toBeGreaterThan(0);
            // event payload includes the impacted group(s).
            const evt = groupOpenedEvents[0];
            const impacted = evt.columnGroup ?? evt.columnGroups?.[0];
            expect(impacted?.getGroupId()).toBe('toggle');
            expect(expandedEvents.length).toBeGreaterThan(0);
            // The displayed-children set flipped: 'detail' hid, 'summary' showed.
            expect(displayedChildrenEvents.length).toBeGreaterThan(0);
        });

        test('expand a closed group via setColumnGroupOpened', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Expand Me',
                    groupId: 'expand',
                    openByDefault: false,
                    children: [{ colId: 'base' }, { colId: 'extra', columnGroupShow: 'open' }],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Initially closed
            await new GridColumns(api, 'initially closed').checkColumns(`
                CENTER
                └─┬ "Expand Me" GROUP closed
                  ├── base width:200
                  └── extra width:200 columnGroupShow:open hidden
            `);

            // Expand via API
            api.setColumnGroupOpened('expand', true);

            await new GridColumns(api, 'after expand').checkColumns(`
                CENTER
                └─┬ "Expand Me" GROUP open
                  ├── base width:200
                  └── extra width:200 columnGroupShow:open
            `);
        });

        test('toggle group open then closed then open again', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Toggler',
                    groupId: 'toggler',
                    openByDefault: false,
                    children: [
                        { colId: 'a' },
                        { colId: 'b', columnGroupShow: 'open' },
                        { colId: 'c', columnGroupShow: 'closed' },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Starts closed
            await new GridColumns(api, 'step 1: closed').checkColumns(`
                CENTER
                └─┬ "Toggler" GROUP closed
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open hidden
                  └── c width:200 columnGroupShow:closed
            `);

            // Open
            api.setColumnGroupOpened('toggler', true);

            await new GridColumns(api, 'step 2: opened').checkColumns(`
                CENTER
                └─┬ "Toggler" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);

            // Close again
            api.setColumnGroupOpened('toggler', false);

            await new GridColumns(api, 'step 3: closed again').checkColumns(`
                CENTER
                └─┬ "Toggler" GROUP closed
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open hidden
                  └── c width:200 columnGroupShow:closed
            `);

            // Open once more
            api.setColumnGroupOpened('toggler', true);

            await new GridColumns(api, 'step 4: opened again').checkColumns(`
                CENTER
                └─┬ "Toggler" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);
        });

        test('descendant-only change dispatches displayedChildrenChanged on ancestor (cascade)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Outer',
                    groupId: 'outer',
                    openByDefault: true,
                    children: [
                        { colId: 'outerAlways' },
                        { colId: 'outerOpen', columnGroupShow: 'open' },
                        {
                            headerName: 'Inner',
                            groupId: 'inner',
                            openByDefault: true,
                            children: [{ colId: 'innerAlways' }, { colId: 'innerOpen', columnGroupShow: 'open' }],
                        },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(
                api,
                `descendant-only change dispatches displayedChildrenChanged on ancestor (cascade) setup`
            ).checkColumns(`
                CENTER
                └─┬ "Outer" GROUP open
                  ├── outerAlways width:200
                  ├── outerOpen width:200 columnGroupShow:open
                  └─┬ "Inner" GROUP open
                    ├── innerAlways width:200
                    └── innerOpen width:200 columnGroupShow:open
            `);
            await new GridRows(
                api,
                `descendant-only change dispatches displayedChildrenChanged on ancestor (cascade) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const innerGroup = (api.getColumn('innerAlways') as any).parent;
            const outerGroup = innerGroup.parent;
            expect(outerGroup != null).toBe(true);
            const outerChildrenBefore = outerGroup.displayedChildren;

            const outerEvents: any[] = [];
            const innerEvents: any[] = [];
            outerGroup.addEventListener('displayedChildrenChanged', (e: any) => outerEvents.push(e));
            innerGroup.addEventListener('displayedChildrenChanged', (e: any) => innerEvents.push(e));

            api.setColumnGroupOpened('inner', false);
            await new GridColumns(
                api,
                `descendant-only change dispatches displayedChildrenChanged on ancestor (cascade) after setColumnGroupOpened`
            ).checkColumns(`
                CENTER
                └─┬ "Outer" GROUP open
                  ├── outerAlways width:200
                  ├── outerOpen width:200 columnGroupShow:open
                  └─┬ "Inner" GROUP closed
                    ├── innerAlways width:200
                    └── innerOpen width:200 columnGroupShow:open hidden
            `);
            await asyncSetTimeout(0);

            expect((api.getColumn('innerAlways') as any).parent === innerGroup).toBe(true);
            expect(innerGroup.parent === outerGroup).toBe(true);

            expect(innerEvents.length).toBeGreaterThan(0);
            expect(outerEvents.length).toBeGreaterThan(0);
            const outerChildrenAfter = outerGroup.displayedChildren;
            expect(outerChildrenAfter === outerChildrenBefore).toBe(true);
        });

        test('re-setting identical columnDefs keeps the column instance stable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }, { colId: 'b' }] },
                    { colId: 'c' },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            const colA = api.getColumn('a');
            expect(colA).not.toBeNull();

            api.setGridOption('columnDefs', [
                { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }, { colId: 'b' }] },
                { colId: 'c' },
            ]);

            // Columns are reused by colId across a no-op refresh.
            expect(api.getColumn('a') === colA).toBe(true);
        });

        test('re-setting identical columnDefs keeps the column group instance stable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }, { colId: 'b' }] },
                    { colId: 'c' },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            const groupG1 = api.getColumnGroup('g1');
            expect(groupG1).not.toBeNull();

            api.setGridOption('columnDefs', [
                { headerName: 'G1', groupId: 'g1', children: [{ colId: 'a' }, { colId: 'b' }] },
                { colId: 'c' },
            ]);

            expect(api.getColumnGroup('g1') === groupG1).toBe(true);
        });

        test('toggle nested expandable groups independently', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Outer',
                    groupId: 'outer',
                    openByDefault: true,
                    children: [
                        { colId: 'outerAlways' },
                        { colId: 'outerOpen', columnGroupShow: 'open' },
                        {
                            headerName: 'Inner',
                            groupId: 'inner',
                            openByDefault: true,
                            children: [{ colId: 'innerAlways' }, { colId: 'innerOpen', columnGroupShow: 'open' }],
                        },
                    ],
                },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Both open initially
            await new GridColumns(api, 'both open').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP open
                  ├── outerAlways width:200
                  ├── outerOpen width:200 columnGroupShow:open
                  └─┬ "Inner" GROUP open
                    ├── innerAlways width:200
                    └── innerOpen width:200 columnGroupShow:open
            `);

            // Collapse inner only
            api.setColumnGroupOpened('inner', false);

            await new GridColumns(api, 'inner collapsed').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP open
                  ├── outerAlways width:200
                  ├── outerOpen width:200 columnGroupShow:open
                  └─┬ "Inner" GROUP closed
                    ├── innerAlways width:200
                    └── innerOpen width:200 columnGroupShow:open hidden
            `);

            // Collapse outer (inner stays collapsed)
            api.setColumnGroupOpened('outer', false);

            await new GridColumns(api, 'both collapsed').checkColumns(`
                CENTER
                └─┬ "Outer" GROUP closed
                  ├── outerAlways width:200
                  ├── outerOpen width:200 columnGroupShow:open hidden
                  └─┬ "Inner" GROUP closed
                    ├── innerAlways width:200
                    └── innerOpen width:200 columnGroupShow:open hidden
            `);
        });
    });

    // Coverage for ColumnGroupService.getColumnGroup public-API lookups.
    describe('getColumnGroup lookup', () => {
        test('finds group by colId with no partId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }] }],
            });
            await new GridColumns(api, `finds group by colId with no partId setup`).checkColumns(`
                CENTER
                └─┬ "G" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(api, `finds group by colId with no partId setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const group = api.getColumnGroup('g');
            expect(group).not.toBeNull();
            expect(group!.getGroupId()).toBe('g');
            await new GridRows(api, `finds group by colId with no partId final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for empty colId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(api, `returns null for empty colId setup`).checkColumns(`
                CENTER
                └─┬ GROUP
                  └── a width:200
            `);
            await new GridRows(api, `returns null for empty colId setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getColumnGroup('')).toBeNull();
            await new GridRows(api, `returns null for empty colId final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for unknown colId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', children: [{ colId: 'a' }] }],
            });
            await new GridColumns(api, `returns null for unknown colId setup`).checkColumns(`
                CENTER
                └─┬ GROUP
                  └── a width:200
            `);
            await new GridRows(api, `returns null for unknown colId setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getColumnGroup('not-a-group')).toBeNull();
            await new GridRows(api, `returns null for unknown colId final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('finds group by colId + partId for cross-section groups', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        children: [{ colId: 'l', pinned: 'left' }, { colId: 'c' }, { colId: 'r', pinned: 'right' }],
                    },
                ],
            });
            await new GridColumns(api, `finds group by colId + partId for cross-section groups setup`).checkColumns(`
                LEFT
                └─┬ GROUP
                  └── l width:200
                CENTER
                └─┬ GROUP
                  └── c width:200
                RIGHT
                └─┬ GROUP
                  └── r width:200
            `);
            await new GridRows(api, `finds group by colId + partId for cross-section groups setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Group 'g' has three sections → three AgColumnGroup instances, partIds 0/1/2.
            const part0 = api.getColumnGroup('g', 0);
            const part1 = api.getColumnGroup('g', 1);
            const part2 = api.getColumnGroup('g', 2);
            expect(part0).not.toBeNull();
            expect(part1).not.toBeNull();
            expect(part2).not.toBeNull();
            // Each instance is distinct.
            expect(part0).not.toBe(part1);
            expect(part1).not.toBe(part2);
            // partId out of range returns null.
            expect(api.getColumnGroup('g', 999)).toBeNull();
            await new GridRows(api, `finds group by colId + partId for cross-section groups final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('without a partId resolves to the primary (first) display instance of a cross-section group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        children: [{ colId: 'l', pinned: 'left' }, { colId: 'c' }, { colId: 'r', pinned: 'right' }],
                    },
                ],
            });
            await asyncSetTimeout(1);

            // No partId resolves to the documented primary instance (partId 0 = the first/left section),
            // not an arbitrary section, so the lookup is deterministic for multi-instance groups.
            const primary = api.getColumnGroup('g');
            expect(primary).not.toBeNull();
            expect(primary).toBe(api.getColumnGroup('g', 0));
            expect(primary!.getLeafColumns().map((col) => col.getColId())).toEqual(['l']);
        });
    });

    // Coverage for ColumnGroupService.resetColumnGroupState — resets every group to its
    // `openByDefault` setting.
    describe('resetColumnGroupState', () => {
        test('resets all expandable groups to their openByDefault setting', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            // Collapse via API.
            api.setColumnGroupOpened('g', false);
            await new GridColumns(api, 'group collapsed').checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);

            // Reset — should restore openByDefault=true.
            api.resetColumnGroupState();
            await new GridColumns(api, 'group reset to openByDefault').checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
        });
    });

    // Coverage for ColumnGroupService.createColumnGroups — the `emitRun` top-level branch
    // clears stale `col.parent` when a previously-grouped col is moved to the top level.
    describe('top-level parent clearing on group removal', () => {
        test('col previously inside a group has its parent cleared when the group is removed', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }] }],
            });

            const colA = api.getColumn('a') as any;
            expect(colA.parent).not.toBeNull();

            // Remove the group → col 'a' lands at top level. Its stale parent ref must be cleared.
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);

            expect(colA.parent).toBeNull();
            await new GridColumns(api, 'flat after group removed').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    // Coverage for ColumnGroupService.setColumnGroupOpened — accepts colId string or group ref.
    describe('setColumnGroupOpened input forms', () => {
        test('accepts a string groupId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            api.setColumnGroupOpened('g', false);
            await new GridColumns(api, 'string groupId').checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);
        });

        test('accepts a ProvidedColumnGroup reference', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            const displayed = api.getColumnGroup('g')!;
            const provided = displayed.getProvidedColumnGroup();
            api.setColumnGroupOpened(provided, false);
            await new GridColumns(api, 'group ref').checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);
        });
    });

    describe('AgProvidedColumnGroup getters + leaf walk', () => {
        test('getId / getInstanceId / getChildren return live values; getLeafColumns returns leaf columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
            });
            await new GridColumns(
                api,
                `getId / getInstanceId / getChildren return live values; getLeafColumns handles e setup`
            ).checkColumns(`
                CENTER
                └─┬ GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(
                api,
                `getId / getInstanceId / getChildren return live values; getLeafColumns handles e setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const provided = api.getProvidedColumnGroup('g1')!;
            expect(provided).toBeTruthy();
            expect(provided.getId()).toBe('g1');
            expect(typeof provided.getInstanceId()).toBe('number');
            expect(provided.getChildren().map((c: any) => c.getColId?.() ?? c.getGroupId?.())).toEqual(['a', 'b']);

            // getLeafColumns walks the tree to its leaf columns (public API; no internal field access)
            expect(provided.getLeafColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });
    });

    describe('AgColumnGroup wrapper getters', () => {
        test('getPartId / isEmptyGroup / getActualWidth on a displayed group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [
                            { colId: 'a', width: 100 },
                            { colId: 'b', width: 150 },
                        ],
                    },
                ],
            });
            await new GridColumns(api, `getPartId / isEmptyGroup / getActualWidth on a displayed group setup`)
                .checkColumns(`
                    CENTER
                    └─┬ GROUP
                      ├── a width:100
                      └── b width:150
                `);
            await new GridRows(api, `getPartId / isEmptyGroup / getActualWidth on a displayed group setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const g = api.getColumnGroup('g1')!;
            expect(g).toBeTruthy();
            // partId is assigned per displayed instance — a number
            expect(typeof g.getPartId()).toBe('number');
            // group has displayed children → not empty
            expect(g.isEmptyGroup()).toBe(false);
            // actual width = sum of displayed children widths
            expect(g.getActualWidth()).toBe(250);
            // isMoving — no cols are being moved
            expect(g.isMoving()).toBe(false);
            await new GridRows(api, `getPartId / isEmptyGroup / getActualWidth on a displayed group final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('isResizable reflects child cols on a single-instance group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'fixedG',
                        children: [
                            { colId: 'x', resizable: false },
                            { colId: 'y', resizable: false },
                        ],
                    },
                ],
            });
            await new GridColumns(api, `isResizable reflects child cols on a single-instance group setup`).checkColumns(
                `
                    CENTER
                    └─┬ GROUP
                      ├── x width:200 !resizable
                      └── y width:200 !resizable
                `
            );
            await new GridRows(api, `isResizable reflects child cols on a single-instance group setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumnGroup('fixedG')!.isResizable()).toBe(false);
            await new GridRows(api, `isResizable reflects child cols on a single-instance group final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('isResizable reflects child resizable + group with all-non-resizable returns false', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'fixed',
                        children: [
                            { colId: 'a', resizable: false },
                            { colId: 'b', resizable: false },
                        ],
                    },
                    {
                        groupId: 'mixed',
                        children: [
                            { colId: 'c', resizable: false },
                            { colId: 'd', resizable: true },
                        ],
                    },
                ],
            });
            await new GridColumns(
                api,
                `isResizable reflects child resizable + group with all-non-resizable returns fals setup`
            ).checkColumns(`
                CENTER
                ├─┬ GROUP
                │ ├── a width:200 !resizable
                │ └── b width:200 !resizable
                └─┬ GROUP
                  ├── c width:200 !resizable
                  └── d width:200
            `);
            await new GridRows(
                api,
                `isResizable reflects child resizable + group with all-non-resizable returns fals setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect((api.getColumnGroup('fixed') as any).isResizable()).toBe(false);
            expect((api.getColumnGroup('mixed') as any).isResizable()).toBe(true);
            await new GridRows(
                api,
                `isResizable reflects child resizable + group with all-non-resizable returns fals final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('arrow keys at a group-row level use getColGroupAtLevel to navigate sibling groups', async () => {
            // Multi-level header navigation: focusing on the inner group then arrowing right should
            // step to the sibling group at the same level. Exercises `getColGroupAtLevel` +
            // `getGroupAtDirection` in `columnGroupService`.
            const api = gridsManager.createGrid('headerNav', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [{ colId: 'a1' }, { colId: 'a2' }],
                    },
                    {
                        groupId: 'g2',
                        children: [{ colId: 'b1' }, { colId: 'b2' }],
                    },
                ],
                rowData: [{ a1: 1, a2: 2, b1: 3, b2: 4 }],
            });
            await new GridColumns(
                api,
                `arrow keys at a group-row level use getColGroupAtLevel to navigate sibling group setup`
            ).checkColumns(`
                CENTER
                ├─┬ GROUP
                │ ├── a1 width:200
                │ └── a2 width:200
                └─┬ GROUP
                  ├── b1 width:200
                  └── b2 width:200
            `);
            await new GridRows(
                api,
                `arrow keys at a group-row level use getColGroupAtLevel to navigate sibling group setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            await asyncSetTimeout(0);

            const g1 = api.getColumnGroup('g1')!;
            const g2 = api.getColumnGroup('g2')!;
            expect(g1).toBeTruthy();
            expect(g2).toBeTruthy();

            // Focus g1's header cell, then ArrowRight to navigate to g2.
            api.setFocusedHeader(g1);
            await asyncSetTimeout(0);

            const focused = document.activeElement as HTMLElement | null;
            expect(focused?.classList.contains('ag-header-group-cell')).toBe(true);
            expect(focused?.getAttribute('col-id')).toBe(g1.getUniqueId());

            focused?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
            );
            await asyncSetTimeout(0);

            const newFocused = document.activeElement as HTMLElement | null;
            expect(newFocused?.classList.contains('ag-header-group-cell')).toBe(true);
            expect(newFocused?.getAttribute('col-id')).toBe(g2.getUniqueId());
            await new GridRows(
                api,
                `arrow keys at a group-row level use getColGroupAtLevel to navigate sibling group final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('group id uniqueness across refresh', () => {
        test('getColumnGroup resolves every group after a refresh — padding before group', async () => {
            // Leading plain `b` forces a padding chain (depth-equalising vs the deeper group).
            const api = gridsManager.createGrid('groupIdUniquePadFirst', {
                columnDefs: [{ colId: 'b' }, { headerName: 'G', children: [{ colId: 'a' }] }],
            });
            await asyncSetTimeout(0);

            // Add a second group `H` — shifts id allocation and reuses `b`'s padding chain.
            api.setGridOption('columnDefs', [
                { colId: 'b' },
                { headerName: 'G', children: [{ colId: 'a' }] },
                { headerName: 'H', children: [{ colId: 'c' }] },
            ]);
            await asyncSetTimeout(0);

            // Resolve each group's id from its column's live parent (public API), then confirm
            // getColumnGroup round-trips it. A sparse map would return null here.
            for (const colId of ['a', 'c']) {
                const parentGroup = api.getColumn(colId)!.getParent()!;
                expect(api.getColumnGroup(parentGroup.getGroupId())).not.toBeNull();
            }

            // checkColumns also runs GridColumnsValidator, which asserts provided-group id uniqueness.
            await new GridColumns(api, 'padding before group after refresh').checkColumns(`
                CENTER
                ├── b width:200
                ├─┬ "G" GROUP
                │ └── a width:200
                └─┬ "H" GROUP
                  └── c width:200
            `);
        });

        test('getColumnGroup resolves every group after a refresh — group before padding', async () => {
            const api = gridsManager.createGrid('groupIdUniqueGroupFirst', {
                columnDefs: [{ headerName: 'G', children: [{ colId: 'a' }] }, { colId: 'x' }],
            });
            await asyncSetTimeout(0);

            api.setGridOption('columnDefs', [
                { headerName: 'G', children: [{ colId: 'a' }] },
                { headerName: 'H', children: [{ colId: 'c' }] },
                { colId: 'x' },
            ]);
            await asyncSetTimeout(0);

            for (const colId of ['a', 'c']) {
                const parentGroup = api.getColumn(colId)!.getParent()!;
                expect(api.getColumnGroup(parentGroup.getGroupId())).not.toBeNull();
            }

            await new GridColumns(api, 'group before padding after refresh').checkColumns(`
                CENTER
                ├─┬ "G" GROUP
                │ └── a width:200
                ├─┬ "H" GROUP
                │ └── c width:200
                └── x width:200
            `);
        });

        test('group split across pinned sections has dense partId-indexed instances', async () => {
            const api = gridsManager.createGrid('splitGroup', {
                columnDefs: [
                    {
                        groupId: 'myGroup',
                        headerName: 'G',
                        children: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }],
                    },
                ],
            });
            await asyncSetTimeout(0);

            const inst0 = api.getColumnGroup('myGroup', 0);
            const inst1 = api.getColumnGroup('myGroup', 1);
            expect(inst0).not.toBeNull();
            expect(inst1).not.toBeNull();
            expect(inst0).not.toBe(inst1);
            // No-instanceId lookup resolves the primary instance (partId 0).
            expect(api.getColumnGroup('myGroup')).toBe(inst0);

            await new GridColumns(api, 'group split left + center').checkColumns(`
                LEFT
                └─┬ "G" GROUP
                  └── a width:200
                CENTER
                └─┬ "G" GROUP
                  └── b width:200
            `);
        });
    });

    describe('collapsed group part with no displayed children', () => {
        test('a pin-split expandable group whose part has only columnGroupShow:open children does not crash', async () => {
            const api = gridsManager.createGrid('collapsed-empty-part', {
                columnDefs: [
                    {
                        headerName: 'G',
                        groupId: 'g',
                        children: [
                            { field: 'a', pinned: 'left' },
                            { field: 'b', columnGroupShow: 'open' },
                        ],
                    },
                ] as (ColDef | ColGroupDef)[],
                rowData: [{ a: 1, b: 2 }],
            });
            await asyncSetTimeout(1);

            await new GridRows(api, 'collapsed group: empty center part').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:1 b:2
            `);

            // The collapsed center part of 'g' has no displayed children — getDisplayedChildren() must be
            // [] (never null), matching released behaviour so reads like the tool panel stay consistent.
            const centerGroups = api.getCenterDisplayedColumnGroups();
            const emptyCenterPart = centerGroups.find(
                (g): g is ColumnGroup => 'getGroupId' in g && (g as ColumnGroup).getGroupId() === 'g'
            );
            expect(emptyCenterPart).toBeTruthy();
            expect(emptyCenterPart!.getDisplayedChildren()).toEqual([]);

            api.setColumnGroupOpened('g', true);
            await asyncSetTimeout(1);
            await new GridColumns(api, 'expanded group: center part with b').checkColumns(`
                LEFT
                └─┬ "G" GROUP open
                  └── a "A" width:200
                CENTER
                └─┬ "G" GROUP open
                  └── b "B" width:200 columnGroupShow:open
            `);
            await new GridRows(api, 'expanded group: center part with b').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:1 b:2
            `);
        });
    });
});
