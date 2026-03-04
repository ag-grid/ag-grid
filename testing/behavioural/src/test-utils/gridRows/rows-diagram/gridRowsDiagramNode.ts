import type { RowNode } from 'ag-grid-community';

import type { GridRows } from '../gridRows';

export class GridRowsDiagramNode {
    public parent: GridRowsDiagramNode | null = null;
    public children = new Map<RowNode | null, GridRowsDiagramNode>();
    public hiddenChildren: Set<GridRowsDiagramNode> | null = null;
    public prefix: string = '';

    public constructor(
        public readonly gridRows: GridRows,
        public readonly row: RowNode | null
    ) {}
}
