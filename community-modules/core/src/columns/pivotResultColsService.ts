import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, PreDestroy } from "../context/context";
import { AbstractColDef, ColDef, ColGroupDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { ColumnEventType } from "../events";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { areEqual } from "../utils/array";
import { exists, missing, missingOrEmpty } from "../utils/generic";
import { ColumnFactory } from "./columnFactory";
import { ColKey, ColumnCollections, ColumnModel } from "./columnModel";
import { ColumnUtilsFeature } from "./columnUtilsFeature";

@Bean('pivotResultColsService')
export class PivotResultColsService extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnFactory') private readonly columnFactory: ColumnFactory;

    private columnUtilsFeature: ColumnUtilsFeature;

    // if pivoting, these are the generated columns as a result of the pivot
    private pivotResultCols: ColumnCollections | null;

    // private pivotResultColTree: IProvidedColumn[] | null;
    // private pivotResultColTreeDept = -1;
    // private pivotResultCols_old: Column[] | null;
    // private pivotResultColsMap: { [id: string]: Column };

    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousPivotResultCols: IProvidedColumn[] | null;

    @PostConstruct
    public init(): void {
        this.columnUtilsFeature = this.createManagedBean(new ColumnUtilsFeature());
    }

    @PreDestroy
    private destroyColumns(): void {
        this.columnUtilsFeature.destroyColumns(this.getContext(), this.pivotResultCols?.tree);
    }

    public isPivotResultColsPresent(): boolean {
        return this.pivotResultCols != null;
    }

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): Column | null {
        if (this.pivotResultCols == null) { return null; }

        const valueColumnToFind = this.columnModel.getProvidedColumn(valueColKey);

        let foundColumn: Column | null = null;

        this.pivotResultCols.list.forEach(column => {
            const thisPivotKeys = column.getColDef().pivotKeys;
            const pivotValueColumn = column.getColDef().pivotValueColumn;

            const pivotKeyMatches = areEqual(thisPivotKeys, pivotKeys);
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
        if (!this.pivotResultCols) { return null; }
        return this.columnModel.getColumn(key, this.pivotResultCols.list, this.pivotResultCols.map);
    }

/*
    public getPivotResultCols(): Column[] | null {
        return this.pivotResultCols_old ? this.pivotResultCols_old : null;
    }

    public getPivotResultBalancedTree(): IProvidedColumn[] | null {
        return this.pivotResultColTree ? this.pivotResultColTree : null;
    }

    public getPivotResultTreeDept(): number {
        return this.pivotResultColTreeDept;
    }*/
    
    public setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        if (this.columnModel.isLiveColsMising()) { return; }

        // if not cols passed, and we had no cols anyway, then do nothing
        if (colDefs==null && this.pivotResultCols==null) { return; }

        if (colDefs) {
            this.processPivotResultColDef(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(
                colDefs,
                false,
                this.pivotResultCols?.tree || this.previousPivotResultCols || undefined,
                source
            );
            this.columnUtilsFeature.destroyColumns(this.getContext(), this.pivotResultCols?.tree, balancedTreeResult.columnTree);

            const tree = balancedTreeResult.columnTree;
            const treeDepth = balancedTreeResult.treeDept;
            const list = this.columnUtilsFeature.getColumnsFromTree(tree);

            this.pivotResultCols = {
                tree: tree,
                treeDepth: treeDepth,
                list: list,
                map: {}
            };
            this.pivotResultCols.list.forEach(col => this.pivotResultCols!.map[col.getId()] = col);
            this.previousPivotResultCols = null;
        } else {
            this.previousPivotResultCols = this.pivotResultCols ? this.pivotResultCols.tree : null;
            this.pivotResultCols = null;
        }

        this.columnModel.updateLiveCols();
        this.columnModel.updatePresentedCols(source);
    }

    private processPivotResultColDef(colDefs: (ColDef | ColGroupDef)[] | null) {
        const columnCallback = this.gos.get('processPivotResultColDef');
        const groupCallback = this.gos.get('processPivotResultColGroupDef');

        if (!columnCallback && !groupCallback) { return undefined; }

        const searchForColDefs = (colDefs2: (ColDef | ColGroupDef)[]): void => {
            colDefs2.forEach((abstractColDef: AbstractColDef) => {
                const isGroup = exists((abstractColDef as any).children);
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