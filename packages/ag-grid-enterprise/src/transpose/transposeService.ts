import type {
    AgProvidedColumnGroup,
    CellClassRules,
    CellValueChangedEvent,
    ColDef,
    ColumnPinnedType,
    ITransposeService,
    NamedBean,
    RowNode,
    TransposeFieldColumnDef,
    TransposeRecordColumnDef,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    RowNode as RowNodeClass,
    _getGrandTotalRow,
    _isClientSideRowModel,
    _warnOnce,
} from 'ag-grid-community';

const TRANSPOSE_FIELD_COL_ID = 'ag-Grid-TransposeField';
const RECORD_COL_ID_PREFIX = 'ag-Grid-TransposeRecord-';
const TOTAL_COL_ID = 'ag-Grid-TransposeTotal';
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
    /** Shows the grand total row as a column, while `grandTotalRow` is set. */
    private totalCol: AgColumn | null = null;
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
        this.refreshRecordCols(leafRecords, this.getGrandTotal(leafRecords.length > 0));
        return this.buildFieldRows();
    }

    /** The grand total row, shown as the totals column. It exists only while `grandTotalRow` is set and there are records. */
    private getGrandTotal(hasRecords: boolean): RowNode | null {
        const rowModel = this.beans.rowModel;
        if (!hasRecords || !_getGrandTotalRow(this.gos) || !_isClientSideRowModel(this.gos, rowModel)) {
            return null;
        }
        return rowModel.rootNode?.sibling ?? null;
    }

    public onFieldOrderChanged(): void {
        if (this.cols) {
            this.refreshRowModel();
        }
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
    private refreshRecordCols(records: RowNode[], grandTotal: RowNode | null): void {
        const retired = this.rebuildCols ? this.retireGeneratedCols() : null;
        const headerCol = this.getHeaderCol();
        const token = ++this.refreshToken;
        const prevCols = this.cols;
        const recordCount = records.length;
        const totalCol = this.refreshTotalCol(grandTotal);
        const totalFirst = totalCol !== null && isTotalFirst(_getGrandTotalRow(this.gos));
        // Record columns start after the field-name column, and after the totals column when it comes first.
        const offset = totalFirst ? 2 : 1;
        const colCount = recordCount + (totalCol ? 2 : 1);
        let setChanged = prevCols?.length !== colCount;
        let orderChanged = false;
        const { recordData, changedRecordColIds } = this;

        this.fieldNameCol ??= this.createCol(this.createFieldNameColDef(headerCol));
        const nextCols = new Array<AgColumn>(colCount);
        nextCols[0] = this.fieldNameCol;
        if (totalCol) {
            nextCols[totalFirst ? 1 : colCount - 1] = totalCol;
            if (!setChanged && prevCols![totalFirst ? 1 : colCount - 1] !== totalCol) {
                setChanged = true;
            }
        }

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
            if (!setChanged && !orderChanged && prevCols![i + offset] !== col) {
                orderChanged = true;
            }
            nextCols[i + offset] = col;
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
        if (this.totalCol) {
            retired.push(this.totalCol);
        }
        this.recordCols.clear();
        this.headerCache.clear();
        this.fieldNameCol = null;
        this.totalCol = null;
        return retired;
    }

    /**
     * The totals column takes its values from the grand total row rather than calculating its own, so it shows
     * whatever the aggregation shows. Pinning the grand total row pins the column, at the same end.
     */
    private refreshTotalCol(grandTotal: RowNode | null): AgColumn | null {
        if (!grandTotal) {
            this.totalCol?.destroy();
            this.totalCol = null;
            return null;
        }
        const pinned = getTotalColPinned(_getGrandTotalRow(this.gos), !!this.gos.get('enableRtl'));
        let col = this.totalCol;
        if (col === null || col.colDef.pinned !== pinned) {
            col?.destroy();
            col = this.createCol(this.createTotalColDef(pinned));
            this.totalCol = col;
        }
        col.transposeRecord = grandTotal;
        return col;
    }

    private createTotalColDef(pinned: ColumnPinnedType): ColDef {
        this.recordColDefBase ??= this.createRecordColDefBase();
        // The record header shows a selection checkbox, which the grand total cannot use.
        const { headerComponent: _, ...base } = this.recordColDefBase;
        return {
            ...base,
            colId: TOTAL_COL_ID,
            headerName: this.getLocaleTextFunc()('footerTotal', 'Total'),
            headerClass: 'ag-transpose-total-header',
            cellClass: 'ag-transpose-total-cell',
            pinned,
            lockPinned: true,
            suppressMovable: true,
        };
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
            // Not new colDefs: leaving the transposed view restores the user's column order.
            colModel.refreshCols(false, 'api');
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
        this.totalCol?.destroy();
        this.totalCol = null;
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
        const sortByUserOrder = createUserOrderSorter(colModel.getColsInStateOrder());

        const visit = (unsorted: (AgColumn | AgProvidedColumnGroup)[], level: number, show: boolean): boolean => {
            const items = sortByUserOrder(unsorted);
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

/**
 * Sorts column tree items into the user's column order. A group keeps its children together, placed where its
 * first column is: a column the user moved out of its group stays in the group's field rows.
 */
const createUserOrderSorter = (order: AgColumn[]) => {
    const firstIndex = new Map<AgColumn | AgProvidedColumnGroup, number>();
    for (let i = 0, len = order.length; i < len; ++i) {
        firstIndex.set(order[i], i);
    }
    const getFirstIndex = (item: AgColumn | AgProvidedColumnGroup): number => {
        let index = firstIndex.get(item);
        if (index === undefined) {
            index = Number.MAX_SAFE_INTEGER;
            if (!item.isColumn) {
                const children = item.getChildren();
                for (let i = 0, len = children.length; i < len; ++i) {
                    index = Math.min(index, getFirstIndex(children[i]));
                }
            }
            firstIndex.set(item, index);
        }
        return index;
    };
    return (items: (AgColumn | AgProvidedColumnGroup)[]) =>
        items.slice().sort((a, b) => getFirstIndex(a) - getFirstIndex(b));
};

type GrandTotalRow = ReturnType<typeof _getGrandTotalRow>;

const isTotalFirst = (grandTotalRow: GrandTotalRow): boolean =>
    grandTotalRow === 'top' || grandTotalRow === 'pinnedTop';

/** A pinned grand total row pins the totals column: top to the start, bottom to the end. */
const getTotalColPinned = (grandTotalRow: GrandTotalRow, rtl: boolean): ColumnPinnedType => {
    if (grandTotalRow === 'pinnedTop') {
        return rtl ? 'right' : 'left';
    }
    if (grandTotalRow === 'pinnedBottom') {
        return rtl ? 'left' : 'right';
    }
    return null;
};
