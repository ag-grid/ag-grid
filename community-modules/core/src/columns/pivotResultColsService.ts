import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, PreDestroy } from "../context/context";
import { AbstractColDef, ColDef, ColGroupDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { ColumnEventType } from "../events";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { areEqual } from "../utils/array";
import { exists, missing, missingOrEmpty } from "../utils/generic";
import { ColumnFactory } from "./columnFactory";
import { ColKey, ColumnModel } from "./columnModel";
import { ColumnUtilsFeature } from "./columnUtilsFeature";

@Bean('pivotResultColsService')
export class PivotResultColsService extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnFactory') private readonly columnFactory: ColumnFactory;

    private columnUtilsFeature: ColumnUtilsFeature;

    // if pivoting, these are the generated columns as a result of the pivot
    private pivotResultColTree: IProvidedColumn[] | null;
    private pivotResultColTreeDept = 0;
    private pivotResultCols: Column[] | null;
    private pivotResultColsMap: { [id: string]: Column };

    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousPivotResultCols: IProvidedColumn[] | null;

    @PostConstruct
    public init(): void {
        this.columnUtilsFeature = this.createManagedBean(new ColumnUtilsFeature());
    }

    @PreDestroy
    private destroyColumns(): void {
        this.columnUtilsFeature.destroyColumns(this.pivotResultColTree);
    }

    public isPivotResultColsPresent(): boolean {
        return this.pivotResultCols != null;
    }

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): Column | null {
        if (this.pivotResultCols == null) { return null; }

        const valueColumnToFind = this.columnModel.getProvidedColumn(valueColKey);

        let foundColumn: Column | null = null;

        this.pivotResultCols.forEach(column => {
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

    public getPivotResultCols(): Column[] | null {
        return this.pivotResultCols ? this.pivotResultCols : null;
    }

    public getPivotResultCol(key: ColKey): Column | null {
        if (!this.pivotResultCols) { return null; }
        return this.columnModel.getColumn(key, this.pivotResultCols, this.pivotResultColsMap);
    }

    public getPivotResultBalancedTree(): IProvidedColumn[] | null {
        return this.pivotResultColTree ? this.pivotResultColTree : null;
    }

    public getPivotResultHeaderRowCount(): number {
        return this.pivotResultColTreeDept;
    }
    
    public setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        if (this.columnModel.isLiveColsMising()) { return; }

        // if not cols passed, and we had no cols anyway, then do nothing
        if (colDefs==null && this.pivotResultCols==null) { return; }

        if (colDefs) {
            this.processPivotResultColDef(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(
                colDefs,
                false,
                this.pivotResultColTree || this.previousPivotResultCols || undefined,
                source
            );
            this.columnUtilsFeature.destroyColumns(this.pivotResultColTree, balancedTreeResult.columnTree);
            this.pivotResultColTree = balancedTreeResult.columnTree;
            this.pivotResultColTreeDept = balancedTreeResult.treeDept + 1;
            this.pivotResultCols = this.columnUtilsFeature.getColumnsFromTree(this.pivotResultColTree);

            this.pivotResultColsMap = {};
            this.pivotResultCols.forEach(col => this.pivotResultColsMap[col.getId()] = col);
            this.previousPivotResultCols = null;
        } else {
            this.previousPivotResultCols = this.pivotResultColTree;
            this.pivotResultColTree = null;
            this.pivotResultColTreeDept = -1;
            this.pivotResultCols = null;
            this.pivotResultColsMap = {};
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