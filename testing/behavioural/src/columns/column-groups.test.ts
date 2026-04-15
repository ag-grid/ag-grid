import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, TestGridsManager } from '../test-utils';

describe('Column Groups', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
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
                ├─┬ "Married" GROUP
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
                └─┬ "Married Expandable" GROUP open
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

            // Collapse via API
            api.setColumnGroupOpened('toggle', false);

            await new GridColumns(api, 'after collapse').checkColumns(`
                CENTER
                └─┬ "Toggle Group" GROUP closed
                  ├── always width:200
                  ├── detail width:200 columnGroupShow:open hidden
                  └── summary width:200 columnGroupShow:closed
            `);
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
});
