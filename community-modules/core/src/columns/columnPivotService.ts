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

@Bean('columnPivotService')
export class ColumnPivotService extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;

        // if pivoting, these are the generated columns as a result of the pivot
    private secondaryBalancedTree: IProvidedColumn[] | null;
    private secondaryColumns: Column[] | null;
    private secondaryColumnsMap: { [id: string]: Column };
    private secondaryHeaderRowCount = 0;
    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousSecondaryColumns: IProvidedColumn[] | null;

    private columnUtilsFeature: ColumnUtilsFeature;

    @PostConstruct
    public init(): void {
        this.columnUtilsFeature = this.createManagedBean(new ColumnUtilsFeature());
    }

    @PreDestroy
    private destroyColumns(): void {
        this.columnUtilsFeature.destroyOldColumns(this.secondaryBalancedTree);
    }

    public isSecondaryColumnsPresent(): boolean {
        return exists(this.secondaryColumns);
    }

    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: ColKey): Column | null {
        if (missing(this.secondaryColumns)) { return null; }

        const valueColumnToFind = this.columnModel.getPrimaryColumn(valueColKey);

        let foundColumn: Column | null = null;

        this.secondaryColumns.forEach(column => {
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

    public getSecondaryColumns(): Column[] | null {
        return this.secondaryColumns ? this.secondaryColumns : null;
    }

    public getSecondaryBalancedTree(): IProvidedColumn[] | null {
        return this.secondaryBalancedTree ? this.secondaryBalancedTree : null;
    }

    public getSecondaryHeaderRowCount(): number {
        return this.secondaryHeaderRowCount;
    }

    public getSecondaryColumn(key: ColKey): Column | null {
        if (!this.secondaryColumns) { return null; }
        return this.columnModel.getColumn(key, this.secondaryColumns, this.secondaryColumnsMap);
    }
    
    
    public setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        if (this.columnModel.isGridColsMising()) { return; }

        const newColsPresent = colDefs;

        // if not cols passed, and we had no cols anyway, then do nothing
        if (!newColsPresent && missing(this.secondaryColumns)) { return; }

        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(
                colDefs,
                false,
                this.secondaryBalancedTree || this.previousSecondaryColumns || undefined,
                source
            );
            this.columnUtilsFeature.destroyOldColumns(this.secondaryBalancedTree, balancedTreeResult.columnTree);
            this.secondaryBalancedTree = balancedTreeResult.columnTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.columnUtilsFeature.getColumnsFromTree(this.secondaryBalancedTree);

            this.secondaryColumnsMap = {};
            this.secondaryColumns.forEach(col => this.secondaryColumnsMap[col.getId()] = col);
            this.previousSecondaryColumns = null;
        } else {
            this.previousSecondaryColumns = this.secondaryBalancedTree;
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsMap = {};
        }

        this.columnModel.updateGridColumns();
        this.columnModel.updateDisplayedColumns(source);
    }

    private processSecondaryColumnDefinitions(colDefs: (ColDef | ColGroupDef)[] | null) {
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