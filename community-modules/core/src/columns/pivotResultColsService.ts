import { BeanStub } from '../context/beanStub';
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { AbstractColDef, ColDef, ColGroupDef } from '../entities/colDef';
import { Column } from '../entities/column';
import { ColumnEventType } from '../events';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { _areEqual } from '../utils/array';
import { _exists } from '../utils/generic';
import { ColumnFactory } from './columnFactory';
import { ColKey, ColumnCollections, ColumnModel } from './columnModel';
import { destroyColumnTree, getColumnsFromTree } from './columnUtils';
import { VisibleColsService } from './visibleColsService';

@Bean('pivotResultColsService')
export class PivotResultColsService extends BeanStub {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnFactory') private readonly columnFactory: ColumnFactory;
    @Autowired('visibleColsService') private readonly visibleColsService: VisibleColsService;

    // if pivoting, these are the generated columns as a result of the pivot
    private pivotResultCols: ColumnCollections | null;

    // private pivotResultColTree: IProvidedColumn[] | null;
    // private pivotResultColTreeDept = -1;
    // private pivotResultCols_old: Column[] | null;
    // private pivotResultColsMap: { [id: string]: Column };

    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousPivotResultCols: IProvidedColumn[] | null;

    @PreDestroy
    private destroyColumns(): void {
        destroyColumnTree(this.getContext(), this.pivotResultCols?.tree);
    }

    public isPivotResultColsPresent(): boolean {
        return this.pivotResultCols != null;
    }

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): Column | null {
        if (this.pivotResultCols == null) {
            return null;
        }

        const valueColumnToFind = this.columnModel.getColDefCol(valueColKey);

        let foundColumn: Column | null = null;

        this.pivotResultCols.list.forEach((column) => {
            const thisPivotKeys = column.getColDef().pivotKeys;
            const pivotValueColumn = column.getColDef().pivotValueColumn;

            const pivotKeyMatches = _areEqual(thisPivotKeys, pivotKeys);
            const pivotValueMatches = pivotValueColumn === valueColumnToFind;

            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });

        return foundColumn;
    }

    public getPivotResultCols(): ColumnCollections | null {
        return this.pivotResultCols;
    }

    public getPivotResultCol(key: ColKey): Column | null {
        if (!this.pivotResultCols) {
            return null;
        }
        return this.columnModel.getColFromCollection(key, this.pivotResultCols);
    }

    public setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        if (!this.columnModel.isReady()) {
            return;
        }

        // if no cols passed, and we had no cols anyway, then do nothing
        if (colDefs == null && this.pivotResultCols == null) {
            return;
        }

        if (colDefs) {
            this.processPivotResultColDef(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(
                colDefs,
                false,
                this.pivotResultCols?.tree || this.previousPivotResultCols || undefined,
                source
            );
            destroyColumnTree(this.getContext(), this.pivotResultCols?.tree, balancedTreeResult.columnTree);

            const tree = balancedTreeResult.columnTree;
            const treeDepth = balancedTreeResult.treeDept;
            const list = getColumnsFromTree(tree);
            const map = {};

            this.pivotResultCols = { tree, treeDepth, list, map };
            this.pivotResultCols.list.forEach((col) => (this.pivotResultCols!.map[col.getId()] = col));
            this.previousPivotResultCols = null;
        } else {
            this.previousPivotResultCols = this.pivotResultCols ? this.pivotResultCols.tree : null;
            this.pivotResultCols = null;
        }

        this.columnModel.refreshCols();
        this.visibleColsService.refresh(source);
    }

    private processPivotResultColDef(colDefs: (ColDef | ColGroupDef)[] | null) {
        const columnCallback = this.gos.get('processPivotResultColDef');
        const groupCallback = this.gos.get('processPivotResultColGroupDef');

        if (!columnCallback && !groupCallback) {
            return undefined;
        }

        const searchForColDefs = (colDefs2: (ColDef | ColGroupDef)[]): void => {
            colDefs2.forEach((abstractColDef: AbstractColDef) => {
                const isGroup = _exists((abstractColDef as any).children);
                if (isGroup) {
                    const colGroupDef = abstractColDef as ColGroupDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                } else {
                    const colDef = abstractColDef as ColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        };

        if (colDefs) {
            searchForColDefs(colDefs);
        }
    }
}
