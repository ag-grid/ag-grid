import type {
    AgProvidedColumnGroup,
    CellValueChangedEvent,
    ColDef,
    ITransposeService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    RowNode as RowNodeClass,
    _addColumnDefaultAndTypes,
    _isClientSideRowModel,
} from 'ag-grid-community';

export const TRANSPOSE_FIELD_COL_ID = 'ag-Grid-TransposeField';
const RECORD_COL_ID_PREFIX = 'ag-Grid-TransposeRecord-';
const FIELD_ROW_ID_PREFIX = 'ag-Grid-TransposeField-';
const FIELD_GROUP_ROW_ID_PREFIX = 'ag-Grid-TransposeFieldGroup-';

/** Field group rows are the transposed form of column groups, so they collapse like row groups. */
interface FieldGroupInfo {
    group: AgProvidedColumnGroup;
    hasChildren: boolean;
}

interface CachedHeader {
    data: unknown;
    header: string;
}

export class TransposeService extends BeanStub implements NamedBean, ITransposeService {
    beanName = 'transposeSvc' as const;

    public cols: AgColumn[] | null = null;
    public tree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public readonly treeDepth = 0;
    public readonly groupsById: Map<string, AgProvidedColumnGroup> = new Map();
    public readonly allGroups: AgProvidedColumnGroup[] = [];

    private fieldNameCol: AgColumn | null = null;
    /** Record columns by record id, kept across refreshes so sort, filter and edits reuse them. */
    private readonly recordCols: Map<string, AgColumn> = new Map();
    /** Header text by record id, valid while the record's data object is unchanged. */
    private readonly headerCache: Map<string, CachedHeader> = new Map();
    private refreshToken = 0;

    private readonly fieldRows: Map<string, RowNode> = new Map();
    private readonly fieldGroups: Map<RowNode, FieldGroupInfo> = new Map();
    private readonly collapsedGroupIds: Set<string> = new Set();

    public postConstruct(): void {
        this.addManagedPropertyListeners(['transpose', 'transposeHeaderColId'], () => this.onTransposeChanged());
        this.addManagedEventListeners({
            cellValueChanged: (event) => this.onCellValueChanged(event),
        });
    }

    public isActive(): boolean {
        const gos = this.gos;
        return !!gos.get('transpose') && _isClientSideRowModel(gos);
    }

    public isFieldGroupRow(rowNode: RowNode): boolean {
        return this.fieldGroups.has(rowNode);
    }

    public isFieldGroupExpanded(rowNode: RowNode): boolean {
        const info = this.fieldGroups.get(rowNode);
        return !!info && !this.collapsedGroupIds.has(info.group.getGroupId());
    }

    public isFieldGroupExpandable(rowNode: RowNode): boolean {
        return !!this.fieldGroups.get(rowNode)?.hasChildren;
    }

    public toggleFieldGroup(rowNode: RowNode): void {
        const info = this.fieldGroups.get(rowNode);
        if (!info) {
            return;
        }
        const groupId = info.group.getGroupId();
        const collapsedGroupIds = this.collapsedGroupIds;
        if (collapsedGroupIds.has(groupId)) {
            collapsedGroupIds.delete(groupId);
        } else {
            collapsedGroupIds.add(groupId);
        }
        this.refreshRowModel();
    }

    public transposeRows(records: RowNode[]): RowNode[] {
        const leafRecords: RowNode[] = [];
        for (let i = 0, len = records.length; i < len; ++i) {
            const record = records[i];
            if (!record.group && !record.footer && record.data) {
                leafRecords.push(record);
            }
        }
        this.refreshRecordCols(leafRecords);
        return this.buildFieldRows();
    }

    /** Edits change the original record, whose cells are not the ones displayed, so refresh its column here. */
    private onCellValueChanged(event: CellValueChangedEvent): void {
        const recordId = event.node.id;
        if (!this.cols || recordId == null) {
            return;
        }
        if (event.column.getColId() === this.gos.get('transposeHeaderColId')) {
            this.headerCache.delete(recordId);
            this.refreshRowModel();
            return;
        }
        this.beans.rowRenderer.refreshCells({ columns: [RECORD_COL_ID_PREFIX + recordId] });
    }

    private onTransposeChanged(): void {
        this.clearCols();
        this.refreshRowModel();
    }

    private refreshRowModel(): void {
        const rowModel = this.beans.rowModel;
        if (_isClientSideRowModel(this.gos, rowModel)) {
            rowModel.refreshModel({ step: 'map', keepRenderedRows: true });
        }
    }

    /**
     * Reuses each record's column, creating columns only for new records and destroying them only for removed
     * ones; the column model is refreshed only when the displayed set or order of columns changes.
     */
    private refreshRecordCols(records: RowNode[]): void {
        const headerCol = this.getHeaderCol();
        const token = ++this.refreshToken;
        const prevCols = this.cols;
        const recordCount = records.length;
        let changed = prevCols == null || prevCols.length !== recordCount + 1;

        this.fieldNameCol ??= this.createCol(this.createFieldNameColDef(headerCol));
        const nextCols = new Array<AgColumn>(recordCount + 1);
        nextCols[0] = this.fieldNameCol;

        const recordCols = this.recordCols;
        for (let i = 0; i < recordCount; ++i) {
            const record = records[i];
            const recordId = record.id!;
            const header = this.getRecordHeader(headerCol, record, i);
            let col = recordCols.get(recordId);
            if (col === undefined) {
                col = this.createCol(this.createRecordColDef(recordId, header));
                recordCols.set(recordId, col);
            } else if (col.colDef.headerName !== header) {
                col.setColDef({ ...col.colDef, headerName: header }, null, 'api');
            }
            col.transposeRecord = record;
            col.buildToken = token;
            if (!changed && prevCols![i + 1] !== col) {
                changed = true;
            }
            nextCols[i + 1] = col;
        }

        if (recordCols.size > recordCount) {
            this.destroyStaleRecordCols(token);
        }
        if (!changed) {
            return;
        }
        this.cols = nextCols;
        this.tree = nextCols;
        this.refreshColModel();
    }

    private destroyStaleRecordCols(token: number): void {
        const { recordCols, headerCache } = this;
        recordCols.forEach((col, recordId) => {
            if (col.buildToken !== token) {
                col.destroy();
                recordCols.delete(recordId);
                headerCache.delete(recordId);
            }
        });
    }

    private refreshColModel(): void {
        const { colModel, visibleCols } = this.beans;
        colModel.beginColUpdate();
        try {
            colModel.refreshCols(true, 'api');
            visibleCols.refresh('api', false);
        } finally {
            colModel.endColUpdate();
        }
    }

    private createCol(colDef: ColDef): AgColumn {
        const colId = colDef.colId!;
        const merged = _addColumnDefaultAndTypes(this.beans, colDef, colId);
        const col = new AgColumn(merged, colDef, colId, false, 'user');
        this.beans.context.createBean(col);
        return col;
    }

    private createRecordColDef(recordId: string, header: string): ColDef {
        return {
            colId: RECORD_COL_ID_PREFIX + recordId,
            headerName: header,
            sortable: false,
            filter: false,
            editable: false,
            suppressHeaderMenuButton: true,
            headerComponent: 'agTransposeRecordHeader',
        };
    }

    private clearCols(): void {
        if (this.cols) {
            this.cols = null;
            this.tree = [];
            this.refreshColModel();
        }
        this.destroyGeneratedCols();
    }

    private destroyGeneratedCols(): void {
        this.recordCols.forEach((col) => col.destroy());
        this.recordCols.clear();
        this.headerCache.clear();
        this.fieldNameCol?.destroy();
        this.fieldNameCol = null;
    }

    private getHeaderCol(): AgColumn | null {
        const headerColId = this.gos.get('transposeHeaderColId');
        return headerColId ? (this.beans.colModel.getCol(headerColId) ?? null) : null;
    }

    private getRecordHeader(headerCol: AgColumn | null, record: RowNode, index: number): string {
        if (!headerCol) {
            return String(index + 1);
        }
        const recordId = record.id!;
        const data = record.data;
        const cached = this.headerCache.get(recordId);
        if (cached !== undefined && cached.data === data) {
            return cached.header;
        }
        const { value, valueFormatted } = this.beans.valueSvc.getValueForDisplay({
            column: headerCol,
            node: record,
            includeValueFormatted: true,
            from: 'data',
        });
        const header = String(valueFormatted ?? value ?? '');
        this.headerCache.set(recordId, { data, header });
        return header;
    }

    private createFieldNameColDef(headerCol: AgColumn | null): ColDef {
        const colNames = this.beans.colNames;
        return {
            colId: TRANSPOSE_FIELD_COL_ID,
            width: 200,
            headerName: headerCol ? (colNames.getDisplayNameForColumn(headerCol, 'header') ?? '') : '',
            pinned: this.gos.get('enableRtl') ? 'right' : 'left',
            lockPinned: true,
            suppressMovable: true,
            sortable: false,
            filter: false,
            editable: false,
            suppressHeaderMenuButton: true,
            cellRenderer: 'agTransposeFieldCellRenderer',
            valueGetter: (params) => (params.node as RowNode | null)?.key ?? null,
        };
    }

    /** Field rows are rebuilt in display order from the user's column tree; collapsed groups hide their children. */
    private buildFieldRows(): RowNode[] {
        const { colModel, colNames } = this.beans;
        const headerColId = this.gos.get('transposeHeaderColId');
        const rows: RowNode[] = [];
        const fieldGroups = this.fieldGroups;
        fieldGroups.clear();

        const visit = (items: (AgColumn | AgProvidedColumnGroup)[], level: number, show: boolean): boolean => {
            let anyVisible = false;
            for (let i = 0, len = items.length; i < len; ++i) {
                const item = items[i];
                if (!item.isColumn) {
                    if (item.isPadding()) {
                        anyVisible = visit(item.getChildren(), level, show) || anyVisible;
                        continue;
                    }
                    const groupId = item.getGroupId();
                    const groupRow = this.getFieldRow(FIELD_GROUP_ROW_ID_PREFIX + groupId);
                    groupRow.key = colNames.getDisplayNameForProvidedColumnGroup(null, item, 'header') ?? groupId;
                    const groupIndex = rows.length;
                    if (show) {
                        rows.push(groupRow);
                    }
                    const expanded = !this.collapsedGroupIds.has(groupId);
                    const hasChildren = visit(item.getChildren(), level + 1, show && expanded);
                    if (!hasChildren && show) {
                        rows.splice(groupIndex, 1);
                        continue;
                    }
                    fieldGroups.set(groupRow, { group: item, hasChildren });
                    groupRow.setUiLevel(level);
                    anyVisible = anyVisible || hasChildren;
                    continue;
                }
                if (!item.isVisible() || item.colId === headerColId) {
                    continue;
                }
                anyVisible = true;
                if (!show) {
                    continue;
                }
                const fieldRow = this.getFieldRow(FIELD_ROW_ID_PREFIX + item.colId);
                fieldRow.key = colNames.getDisplayNameForColumn(item, 'header');
                fieldRow.transposeFieldCol = item;
                fieldRow.setUiLevel(level);
                rows.push(fieldRow);
            }
            return anyVisible;
        };
        visit(colModel.colDefTree, 0, true);
        return rows;
    }

    private getFieldRow(id: string): RowNode {
        const fieldRows = this.fieldRows;
        let rowNode = fieldRows.get(id);
        if (!rowNode) {
            rowNode = new RowNodeClass(this.beans);
            rowNode.id = id;
            fieldRows.set(id, rowNode);
        }
        return rowNode;
    }

    public override destroy(): void {
        this.cols = null;
        this.destroyGeneratedCols();
        this.fieldRows.clear();
        this.fieldGroups.clear();
        super.destroy();
    }
}
