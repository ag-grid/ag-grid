import type {
    AgProvidedColumnGroup,
    CellClassRules,
    CellValueChangedEvent,
    ColDef,
    ITransposeService,
    NamedBean,
    RowNode,
    TransposeFieldColumnDef,
    TransposeRecordColumnDef,
} from 'ag-grid-community';
import { AgColumn, BeanStub, RowNode as RowNodeClass, _isClientSideRowModel, _warnOnce } from 'ag-grid-community';

const TRANSPOSE_FIELD_COL_ID = 'ag-Grid-TransposeField';
const RECORD_COL_ID_PREFIX = 'ag-Grid-TransposeRecord-';
const FIELD_ROW_ID_PREFIX = 'ag-Grid-TransposeField-';
const FIELD_GROUP_ROW_ID_PREFIX = 'ag-Grid-TransposeFieldGroup-';
const RECORD_CELL_CLASS_RULES: CellClassRules = {
    'ag-transpose-record-selected': (params) => !!params.node?.isSelected(),
};

const RECORD_COL_KEYS: readonly (keyof TransposeRecordColumnDef)[] = [
    'width',
    'initialWidth',
    'minWidth',
    'maxWidth',
    'flex',
    'initialFlex',
    'resizable',
    'suppressSizeToFit',
    'suppressAutoSize',
    'suppressMovable',
    'lockPinned',
    'suppressNavigable',
    'headerClass',
    'headerStyle',
    'headerTooltip',
    'headerComponent',
    'headerComponentParams',
    'cellClass',
    'cellClassRules',
    'cellStyle',
    'contextMenuItems',
    'onCellClicked',
    'onCellDoubleClicked',
    'onCellContextMenu',
    'context',
];
const FIELD_COL_KEYS: readonly (keyof TransposeFieldColumnDef)[] = [
    ...RECORD_COL_KEYS,
    'headerName',
    'pinned',
    'tooltip',
    'wrapText',
    'autoHeight',
];

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
    /** Record columns by record id, kept while the record exists, including while a filter hides it. */
    private readonly recordCols: Map<string, AgColumn> = new Map();
    /** Header text by record id, valid while the record's data object is unchanged. */
    private readonly headerCache: Map<string, CachedHeader> = new Map();
    /** Each record's data object at the last refresh, to spot transaction and `rowData` updates. */
    private readonly recordData: Map<string, unknown> = new Map();
    private readonly changedRecordColIds: string[] = [];
    private rebuildCols = false;
    private refreshToken = 0;
    /** The base colDef for record columns, rebuilt when the options change. */
    private recordColDefBase: ColDef | null = null;

    private readonly fieldRows: Map<string, RowNode> = new Map();
    private readonly fieldGroups: Map<RowNode, FieldGroupInfo> = new Map();
    private readonly collapsedGroupIds: Set<string> = new Set();

    public postConstruct(): void {
        this.addManagedPropertyListeners(
            ['transpose', 'transposeHeaderColId', 'transposeRecordColumnDef', 'transposeFieldColumnDef'],
            () => this.onTransposeChanged()
        );
        this.addManagedEventListeners({
            cellValueChanged: (event) => this.onCellValueChanged(event),
            selectionChanged: () => this.refreshAllRecordCells(),
            modelUpdated: () => this.refreshChangedRecordCells(),
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
        this.refreshRecordCells(recordId);
    }

    private refreshRecordCells(recordId: string | undefined): void {
        if (this.cols && recordId != null) {
            this.beans.rowRenderer.refreshCells({ columns: [RECORD_COL_ID_PREFIX + recordId] });
        }
    }

    private refreshAllRecordCells(): void {
        const cols = this.cols;
        if (cols) {
            this.beans.rowRenderer.refreshCells({ columns: cols.slice(1) });
        }
    }

    /** Field rows are reused across refreshes, so cells showing records whose data object changed are refreshed here. */
    private refreshChangedRecordCells(): void {
        const changed = this.changedRecordColIds;
        if (changed.length) {
            this.beans.rowRenderer.refreshCells({ columns: changed.splice(0) });
        }
    }

    private onTransposeChanged(): void {
        this.recordColDefBase = null;
        if (!this.isActive()) {
            // Rows before columns, so the user's columns never render against data-less field rows.
            this.refreshRowModel();
            this.clearCols();
            return;
        }
        this.rebuildCols = true;
        this.refreshRowModel();
    }

    private refreshRowModel(): void {
        const rowModel = this.beans.rowModel;
        if (_isClientSideRowModel(this.gos, rowModel)) {
            rowModel.refreshModel({ step: 'map', keepRenderedRows: true });
        }
    }

    /**
     * Reuses each record's column, creating columns only for new records and destroying them only for removed ones;
     * the column model is refreshed only when the displayed set or order of columns changes.
     */
    private refreshRecordCols(records: RowNode[]): void {
        const retired = this.rebuildCols ? this.retireGeneratedCols() : null;
        const headerCol = this.getHeaderCol();
        const token = ++this.refreshToken;
        const prevCols = this.cols;
        const recordCount = records.length;
        let setChanged = prevCols?.length !== recordCount + 1;
        let orderChanged = false;
        const { recordData, changedRecordColIds } = this;

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
                setChanged = true;
            } else if (col.colDef.headerName !== header) {
                col.setColDef({ ...col.colDef, headerName: header }, null, 'api');
            }
            col.transposeRecord = record;
            col.buildToken = token;
            const data = record.data;
            if (recordData.get(recordId) !== data) {
                if (recordData.has(recordId)) {
                    changedRecordColIds.push(col.colId);
                }
                recordData.set(recordId, data);
            }
            if (!setChanged && !orderChanged && prevCols![i + 1] !== col) {
                orderChanged = true;
            }
            nextCols[i + 1] = col;
        }

        if (recordCols.size > recordCount) {
            this.destroyRemovedRecordCols(token);
        }
        if (orderChanged && !setChanged && !sameMembers(prevCols!, nextCols)) {
            setChanged = true;
        }
        if (setChanged || orderChanged) {
            this.cols = nextCols;
            this.tree = nextCols;
            if (setChanged || !this.reorderColModel(nextCols)) {
                this.refreshColModel();
            }
        }
        if (retired) {
            for (let i = 0, len = retired.length; i < len; ++i) {
                retired[i].destroy();
            }
        }
    }

    /** Detaches every generated column so new ones are built, and returns the old ones to destroy once replaced. */
    private retireGeneratedCols(): AgColumn[] {
        this.rebuildCols = false;
        const retired: AgColumn[] = [];
        this.recordCols.forEach((col) => retired.push(col));
        if (this.fieldNameCol) {
            retired.push(this.fieldNameCol);
        }
        this.recordCols.clear();
        this.headerCache.clear();
        this.fieldNameCol = null;
        return retired;
    }

    /**
     * Same columns in a new order (sort): reorders the column model in place the way a column move does,
     * skipping the full column refresh. Returns `false` when the model doesn't hold exactly these columns.
     */
    private reorderColModel(nextCols: AgColumn[]): boolean {
        const { colModel, visibleCols } = this.beans;
        const colsList = colModel.colsList;
        const len = nextCols.length;
        if (colsList.length !== len) {
            return false;
        }
        for (let i = 0; i < len; ++i) {
            colsList[i] = nextCols[i];
        }
        colModel.markColsListIndexDirty();
        colModel.beginColUpdate();
        try {
            visibleCols.refresh('api', false);
        } finally {
            colModel.endColUpdate();
        }
        return true;
    }

    /** A record hidden by a filter keeps its column (and its width); only records that no longer exist lose theirs. */
    private destroyRemovedRecordCols(token: number): void {
        const { recordCols, headerCache, recordData } = this;
        const rowModel = this.beans.rowModel;
        recordCols.forEach((col, recordId) => {
            if (col.buildToken !== token && !rowModel.getRowNode(recordId)) {
                col.destroy();
                recordCols.delete(recordId);
                headerCache.delete(recordId);
                recordData.delete(recordId);
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

    /** `defaultColDef` is deliberately not applied: it configures the user's columns, which become field rows. */
    private createCol(colDef: ColDef): AgColumn {
        const col = new AgColumn(colDef, colDef, colDef.colId!, false, 'user');
        this.beans.context.createBean(col);
        return col;
    }

    private createRecordColDef(recordId: string, header: string): ColDef {
        this.recordColDefBase ??= this.createRecordColDefBase();
        return { ...this.recordColDefBase, colId: RECORD_COL_ID_PREFIX + recordId, headerName: header };
    }

    private createRecordColDefBase(): ColDef {
        const user = this.pickAllowed('transposeRecordColumnDef', RECORD_COL_KEYS);
        return {
            headerComponent: 'agTransposeRecordHeader',
            ...user,
            sortable: false,
            filter: false,
            editable: false,
            suppressHeaderMenuButton: true,
            cellClassRules: user.cellClassRules
                ? { ...RECORD_CELL_CLASS_RULES, ...user.cellClassRules }
                : RECORD_CELL_CLASS_RULES,
        };
    }

    /** Copies the supported settings from a column option; unsupported ones are dropped, with a dev-only warning. */
    private pickAllowed(
        option: 'transposeRecordColumnDef' | 'transposeFieldColumnDef',
        allowedKeys: readonly (keyof ColDef)[]
    ): ColDef {
        const def = this.gos.get(option) as Record<string, unknown> | undefined;
        if (!def) {
            return {};
        }
        const picked: Record<string, unknown> = {};
        const ignored: string[] = [];
        for (const key of Object.keys(def)) {
            if ((allowedKeys as readonly string[]).includes(key)) {
                picked[key] = def[key];
            } else {
                ignored.push(key);
            }
        }
        if (ignored.length && this.beans.validation) {
            _warnOnce(
                `\`${option}\` ignores ${ignored.join(', ')}. In the transposed view, cell values, formatting and editing come from the original column.`
            );
        }
        return picked;
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
        this.recordData.clear();
        this.changedRecordColIds.length = 0;
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
            width: 200,
            headerName: headerCol ? (colNames.getDisplayNameForColumn(headerCol, 'header') ?? '') : '',
            pinned: this.gos.get('enableRtl') ? 'right' : 'left',
            lockPinned: true,
            suppressMovable: true,
            headerComponent: 'agTransposeFieldHeader',
            ...this.pickAllowed('transposeFieldColumnDef', FIELD_COL_KEYS),
            colId: TRANSPOSE_FIELD_COL_ID,
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
            rowNode.selectable = false;
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

function sameMembers(prev: AgColumn[], next: AgColumn[]): boolean {
    const prevSet = new Set(prev);
    for (let i = 0, len = next.length; i < len; ++i) {
        if (!prevSet.has(next[i])) {
            return false;
        }
    }
    return true;
}
