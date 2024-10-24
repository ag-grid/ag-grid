import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, Context } from '../context/context';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import { _getCheckboxes, _getHeaderCheckbox } from '../gridOptionsUtils';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { ColumnGroupService } from './columnGroups/columnGroupService';
import type { ColKey, ColumnCollections, ColumnModel } from './columnModel';
import type { ColumnStateService } from './columnStateService';
import {
    _areColIdsEqual,
    _columnsMatch,
    _convertColumnEventSourceType,
    _destroyColumnTree,
    _updateColsMap,
    isColumnSelectionCol,
} from './columnUtils';
import type { VisibleColsService } from './visibleColsService';

export const CONTROLS_COLUMN_ID_PREFIX = 'ag-Grid-SelectionColumn' as const;

export class SelectionColService extends BeanStub implements NamedBean {
    beanName = 'selectionColService' as const;

    private context: Context;
    private columnGroupService?: ColumnGroupService;
    private autoColService?: IAutoColService;
    private columnModel: ColumnModel;
    private visibleColsService: VisibleColsService;
    private columnStateService: ColumnStateService;
    // selection checkbox columns
    public selectionCols: ColumnCollections | null;

    public wireBeans(beans: BeanCollection): void {
        this.context = beans.context;
        this.columnGroupService = beans.columnGroupService;
        this.autoColService = beans.autoColService;
        this.columnModel = beans.columnModel;
        this.visibleColsService = beans.visibleColsService;
        this.columnStateService = beans.columnStateService;
    }

    public postConstruct(): void {
        this.addManagedPropertyListener('rowSelection', (event) => {
            this.onSelectionOptionsChanged(
                event.currentValue,
                event.previousValue,
                _convertColumnEventSourceType(event.source)
            );
        });
    }

    public addSelectionCols(cols: ColumnCollections): void {
        if (this.selectionCols == null) {
            return;
        }
        cols.list = this.selectionCols.list.concat(cols.list);
        cols.tree = this.selectionCols.tree.concat(cols.tree);
        _updateColsMap(cols);
    }

    public createSelectionCols(
        cols: ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void {
        const destroyCollection = () => {
            _destroyColumnTree(this.context, this.selectionCols?.tree);
            this.selectionCols = null;
        };

        // the new tree dept will equal the current tree dept of cols
        const newTreeDepth = cols.treeDepth;
        const oldTreeDepth = this.selectionCols?.treeDepth ?? -1;
        const treeDeptSame = oldTreeDepth == newTreeDepth;

        const list = this.generateSelectionCols();
        const areSame = _areColIdsEqual(list, this.selectionCols?.list ?? []);

        if (areSame && treeDeptSame) {
            return;
        }

        destroyCollection();
        const treeDepth = this.columnGroupService?.findDepth(cols.tree) ?? 0;
        const tree = this.autoColService?.balanceTreeForAutoCols(list, treeDepth) ?? [];
        this.selectionCols = {
            list,
            tree,
            treeDepth,
            map: {},
        };

        const putSelectionColsFirstInList = (cols?: AgColumn[] | null): AgColumn[] | null => {
            if (!cols) {
                return null;
            }
            // we use colId, and not instance, to remove old selectionCols
            const colsFiltered = cols.filter((col) => !isColumnSelectionCol(col));
            return [...list, ...colsFiltered];
        };

        updateOrders(putSelectionColsFirstInList);
    }

    private isSelectionColumnEnabled(): boolean {
        const { gos } = this;
        const so = gos.get('rowSelection');
        if (!so || typeof so !== 'object') {
            return false;
        }

        const checkboxes = !!_getCheckboxes(so);
        const headerCheckbox = _getHeaderCheckbox(so);

        return checkboxes || headerCheckbox;
    }

    private generateSelectionCols(): AgColumn[] {
        if (!this.isSelectionColumnEnabled()) {
            return [];
        }

        const selectionColumnDef = this.gos.get('selectionColumnDef');
        const enableRTL = this.gos.get('enableRtl');
        const colDef: ColDef = {
            // overridable properties
            width: 50,
            resizable: false,
            suppressHeaderMenuButton: true,
            sortable: false,
            suppressMovable: true,
            lockPosition: enableRTL ? 'right' : 'left',
            comparator(valueA, valueB, nodeA, nodeB) {
                const aSelected = nodeA.isSelected();
                const bSelected = nodeB.isSelected();
                return aSelected && bSelected ? 0 : aSelected ? 1 : -1;
            },
            editable: false,
            suppressFillHandle: true,
            // overrides
            ...selectionColumnDef,
            // non-overridable properties
            colId: CONTROLS_COLUMN_ID_PREFIX,
        };
        const col = new AgColumn(colDef, null, colDef.colId!, false);
        this.createBean(col);
        return [col];
    }

    public putSelectionColsFirstInList(list: AgColumn[], cols?: AgColumn[] | null): AgColumn[] | null {
        if (!cols) {
            return null;
        }
        // we use colId, and not instance, to remove old selectionCols
        const colsFiltered = cols.filter((col) => !isColumnSelectionCol(col));
        return [...list, ...colsFiltered];
    }

    public getSelectionCol(key: ColKey): AgColumn | null {
        return this.selectionCols?.list.find((col) => _columnsMatch(col, key)) ?? null;
    }

    public getSelectionCols(): AgColumn[] | null {
        return this.selectionCols?.list ?? null;
    }

    private onSelectionOptionsChanged(
        current: GridOptions['rowSelection'],
        prev: GridOptions['rowSelection'],
        source: ColumnEventType
    ) {
        const prevCheckbox = prev && typeof prev !== 'string' ? _getCheckboxes(prev) : undefined;
        const currCheckbox = current && typeof current !== 'string' ? _getCheckboxes(current) : undefined;
        const checkboxHasChanged = prevCheckbox !== currCheckbox;

        const prevHeaderCheckbox = prev && typeof prev !== 'string' ? _getHeaderCheckbox(prev) : undefined;
        const currHeaderCheckbox = current && typeof current !== 'string' ? _getHeaderCheckbox(current) : undefined;
        const headerCheckboxHasChanged = prevHeaderCheckbox !== currHeaderCheckbox;

        if (checkboxHasChanged || headerCheckboxHasChanged) {
            this.columnModel.refreshAll(source);
        }
    }

    public override destroy(): void {
        _destroyColumnTree(this.context, this.selectionCols?.tree);
        super.destroy();
    }

    public refreshVisibility(): void {
        if (!this.isSelectionColumnEnabled()) {
            return;
        }

        const visibleColumns = this.visibleColsService.getAllTrees() ?? [];

        if (visibleColumns.length === 0) {
            return;
        }

        // case 1: only one column showing -- selection column
        if (visibleColumns.length === 1) {
            const firstColumn = visibleColumns[0];

            if (!firstColumn.isColumn || !isColumnSelectionCol(firstColumn)) {
                return;
            }

            this.columnStateService.applyColumnState({ state: [{ colId: firstColumn.getColId(), hide: true }] }, 'api');

            return;
        }

        // case 2: multiple columns showing -- none are selection column
        if (!visibleColumns.some((c) => c.isColumn && isColumnSelectionCol(c))) {
            const existingState = this.columnStateService
                .getColumnState()
                .find((state) => isColumnSelectionCol(state.colId));

            if (existingState) {
                this.columnStateService.applyColumnState(
                    {
                        state: [{ colId: existingState.colId, hide: !existingState.hide }],
                    },
                    'api'
                );
            }
        }
    }
}
