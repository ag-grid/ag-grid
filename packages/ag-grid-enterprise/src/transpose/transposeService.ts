import { _areEqual } from 'ag-stack';

import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColDef,
    ColGroupDef,
    ITransposeService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import {
    BeanStub,
    RowNode as RowNodeClass,
    _buildColumnTree,
    _destroyColumnTreeAll,
    _destroyColumnTreeUnused,
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

export class TransposeService extends BeanStub implements NamedBean, ITransposeService {
    beanName = 'transposeSvc' as const;

    public cols: AgColumn[] | null = null;
    public tree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public treeDepth = 0;
    public groupsById: Map<string, AgProvidedColumnGroup> = new Map();
    public allGroups: AgProvidedColumnGroup[] = [];

    private colsByKey: Map<string | ColDef, AgColumn> = new Map();
    private recordColIds: string[] = [];
    private recordHeaders: string[] = [];

    private readonly fieldRows: Map<string, RowNode> = new Map();
    private readonly fieldGroups: Map<RowNode, FieldGroupInfo> = new Map();
    private readonly collapsedGroupIds: Set<string> = new Set();

    public postConstruct(): void {
        this.addManagedPropertyListeners(['transpose', 'transposeHeaderColId'], () => this.onTransposeChanged());
        this.addManagedEventListeners({
            cellValueChanged: (event) => this.refreshRecordCol(event.node.id),
        });
    }

    /** Edits change the original record, whose cells are not the ones displayed, so refresh its column here. */
    private refreshRecordCol(recordId: string | undefined): void {
        if (!this.cols || recordId == null) {
            return;
        }
        this.beans.rowRenderer.refreshCells({ columns: [RECORD_COL_ID_PREFIX + recordId] });
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

    private onTransposeChanged(): void {
        if (!this.isActive()) {
            this.clearCols();
        }
        this.refreshRowModel();
    }

    private refreshRowModel(): void {
        const rowModel = this.beans.rowModel;
        if (_isClientSideRowModel(this.gos, rowModel)) {
            rowModel.refreshModel({ step: 'map', keepRenderedRows: true });
        }
    }

    private refreshRecordCols(records: RowNode[]): void {
        const headerCol = this.getHeaderCol();
        const recordColIds: string[] = [];
        const recordHeaders: string[] = [];
        for (let i = 0, len = records.length; i < len; ++i) {
            const record = records[i];
            recordColIds.push(RECORD_COL_ID_PREFIX + record.id);
            recordHeaders.push(this.getRecordHeader(headerCol, record, i));
        }

        if (this.cols && _areEqual(recordColIds, this.recordColIds) && _areEqual(recordHeaders, this.recordHeaders)) {
            this.assignRecords(records);
            return;
        }
        this.recordColIds = recordColIds;
        this.recordHeaders = recordHeaders;

        const colDefs: (ColDef | ColGroupDef)[] = [this.createFieldNameColDef(headerCol)];
        for (let i = 0, len = records.length; i < len; ++i) {
            colDefs.push({
                colId: recordColIds[i],
                headerName: recordHeaders[i],
                sortable: false,
                filter: false,
                editable: false,
                suppressHeaderMenuButton: true,
                headerComponent: 'agTransposeRecordHeader',
            });
        }
        this.applyColDefs(colDefs, records);
    }

    private applyColDefs(colDefs: (ColDef | ColGroupDef)[], records: RowNode[]): void {
        const beans = this.beans;
        const colModel = beans.colModel;
        const previousCols = this.cols;
        const previousAllGroups = this.allGroups;
        const buildToken = colModel.nextBuildToken();
        const built = _buildColumnTree(
            beans,
            colDefs,
            false,
            this.groupsById,
            this.colsByKey,
            colModel.colsById,
            'api',
            true,
            buildToken,
            null
        );
        if (previousCols) {
            _destroyColumnTreeUnused(previousCols, previousAllGroups, buildToken);
        }
        this.cols = built.columns;
        this.tree = built.columnTree;
        this.treeDepth = built.treeDepth;
        this.groupsById = built.groupsById;
        this.allGroups = built.allGroups;
        this.colsByKey = built.colsByKey;
        this.assignRecords(records);

        colModel.beginColUpdate();
        try {
            colModel.refreshCols(true, 'api');
            beans.visibleCols.refresh('api', false);
        } finally {
            colModel.endColUpdate();
        }
    }

    /** Record nodes can be replaced while their ids (and so their columns) stay the same. */
    private assignRecords(records: RowNode[]): void {
        const cols = this.cols!;
        // cols[0] is the field-name column; record columns follow in record order.
        for (let i = 0, len = records.length; i < len; ++i) {
            cols[i + 1].transposeRecord = records[i];
        }
    }

    private clearCols(): void {
        const cols = this.cols;
        if (!cols) {
            return;
        }
        this.cols = null;
        this.tree = [];
        this.treeDepth = 0;
        this.recordColIds = [];
        this.recordHeaders = [];
        const colModel = this.beans.colModel;
        colModel.beginColUpdate();
        try {
            colModel.refreshCols(false, 'api');
            this.beans.visibleCols.refresh('api', false);
        } finally {
            colModel.endColUpdate();
        }
        _destroyColumnTreeAll(cols, this.allGroups);
        this.allGroups = [];
        this.groupsById = new Map();
        this.colsByKey = new Map();
    }

    private getHeaderCol(): AgColumn | null {
        const headerColId = this.gos.get('transposeHeaderColId');
        return headerColId ? (this.beans.colModel.getCol(headerColId) ?? null) : null;
    }

    private getRecordHeader(headerCol: AgColumn | null, record: RowNode, index: number): string {
        if (!headerCol) {
            return String(index + 1);
        }
        const { value, valueFormatted } = this.beans.valueSvc.getValueForDisplay({
            column: headerCol,
            node: record,
            includeValueFormatted: true,
            from: 'data',
        });
        return String(valueFormatted ?? value ?? '');
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
        const cols = this.cols;
        if (cols) {
            _destroyColumnTreeAll(cols, this.allGroups);
        }
        this.cols = null;
        this.fieldRows.clear();
        this.fieldGroups.clear();
        super.destroy();
    }
}
