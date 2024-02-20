import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ChartType,
    Column,
    IAggFunc,
    IRangeService,
    PostConstruct,
    SeriesChartType,
} from "@ag-grid-community/core";
import { ChartDatasource, ChartDatasourceParams } from "../datasource/chartDatasource";
import { ChartTranslationService } from '../services/chartTranslationService';
import { ChartColumnService } from "../services/chartColumnService";
import { ComboChartModel } from "./comboChartModel";
import { isHierarchical } from "../utils/seriesTypeMapper";

export interface ColState {
    column?: Column;
    colId: string;
    displayName: string | null;
    selected?: boolean;
    order: number;
}

export interface ChartModelParams {
    chartId: string;
    pivotChart: boolean;
    chartType: ChartType;
    chartThemeName: string;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
    unlinkChart?: boolean;
    crossFiltering?: boolean;
    seriesChartTypes?: SeriesChartType[];
}

export class ChartDataModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('rangeService') private readonly rangeService: IRangeService;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    public readonly params: ChartModelParams;

    // this is used to associate chart ranges with charts
    public readonly chartId: string;

    public suppressChartRanges: boolean;
    public aggFunc?: string | IAggFunc;
    public pivotChart: boolean;

    public chartType: ChartType;
    public chartThemeName: string;
    public unlinked = false;
    public chartData: any[] = [];
    public valueColState: ColState[] = [];
    public dimensionColState: ColState[] = [];
    public columnNames: { [p: string]: string[]; } = {};

    public valueCellRange?: CellRange;
    public dimensionCellRange?: CellRange;

    public comboChartModel: ComboChartModel;
    private chartColumnService: ChartColumnService;
    private datasource: ChartDatasource;

    public referenceCellRange: CellRange;
    public suppliedCellRange: CellRange;

    public crossFiltering = false;

    private grouping = false;

    public constructor(params: ChartModelParams) {
        super();

        this.params = params;
        this.chartId = params.chartId;
        this.chartType = params.chartType;
        this.pivotChart = params.pivotChart;
        this.chartThemeName = params.chartThemeName;
        this.aggFunc = params.aggFunc;
        this.referenceCellRange = params.cellRange;
        this.suppliedCellRange = params.cellRange;
        this.suppressChartRanges = params.suppressChartRanges;
        this.unlinked = !!params.unlinkChart;
        this.crossFiltering = !!params.crossFiltering;
    }

    @PostConstruct
    private init(): void {
        this.datasource = this.createManagedBean(new ChartDatasource());
        this.chartColumnService = this.createManagedBean(new ChartColumnService());
        this.comboChartModel = this.createManagedBean(new ComboChartModel(this));
        this.updateCellRanges();
        this.updateData();
    }

    public updateModel(params: ChartModelParams): void {
        const {
            cellRange,
            chartType,
            pivotChart,
            chartThemeName,
            aggFunc,
            suppressChartRanges,
            unlinkChart,
            crossFiltering,
            seriesChartTypes
        } = params;

        if (cellRange !== this.suppliedCellRange) {
            this.dimensionCellRange = undefined;
            this.valueCellRange = undefined;
        }

        this.chartType = chartType;
        this.pivotChart = pivotChart;
        this.chartThemeName = chartThemeName;
        this.aggFunc = aggFunc;
        this.referenceCellRange = cellRange;
        this.suppliedCellRange = cellRange;
        this.suppressChartRanges = suppressChartRanges;
        this.unlinked = !!unlinkChart;
        this.crossFiltering = !!crossFiltering;

        this.updateSelectedDimensions(cellRange?.columns);
        this.updateCellRanges();

        const shouldUpdateComboModel = this.isComboChart() || seriesChartTypes;
        if (shouldUpdateComboModel) {
            this.comboChartModel.update(seriesChartTypes);
        }

        if (!this.unlinked) {
            this.updateData();
        }
    }

    public updateCellRanges(updatedColState?: ColState): void {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }

        const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
        const allColsFromRanges = this.getAllColumnsFromRanges();

        if (updatedColState) {
            this.updateColumnState(updatedColState);
        }

        this.setDimensionCellRange(dimensionCols, allColsFromRanges, updatedColState);
        this.setValueCellRange(valueCols, allColsFromRanges, updatedColState);

        if (!updatedColState) {
            this.resetColumnState();
            // dimension / category cell range could be out of sync after resetting column state when row grouping
            this.syncDimensionCellRange();
        }

        this.comboChartModel.updateSeriesChartTypes();
    }

    public updateData(): void {
        const { startRow, endRow } = this.getRowIndexes();

        if (this.pivotChart) {
            this.resetColumnState();
        }

        this.grouping = this.isGrouping();

        const params: ChartDatasourceParams = {
            aggFunc: this.aggFunc,
            dimensionCols: this.getSelectedDimensions(),
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            crossFiltering: this.crossFiltering,
            valueCols: this.getSelectedValueCols(),
            startRow,
            endRow,
            isScatter: _.includes(['scatter', 'bubble'], this.chartType)
        };

        const { chartData, columnNames } = this.datasource.getData(params);

        this.chartData = chartData;
        this.columnNames = columnNames;
    }

    public isGrouping(): boolean {
        const usingTreeData = this.gridOptionsService.get('treeData');
        const groupedCols = usingTreeData ? null : this.chartColumnService.getRowGroupColumns();
        const isGroupActive = usingTreeData || (groupedCols && groupedCols.length > 0);

        // charts only group when the selected category is a group column
        const colIds = this.getSelectedDimensions().map(({ colId }) => colId);
        const displayedGroupCols = this.chartColumnService.getGroupDisplayColumns();
        const groupDimensionSelected = displayedGroupCols.map(col => col.getColId()).some(id => colIds.includes(id));
        return !!isGroupActive && groupDimensionSelected;
    }

    public getSelectedValueCols(): Column[] {
        return this.valueColState.filter(cs => cs.selected).map(cs => cs.column!);
    }

    public getSelectedDimensions(): ColState[] {
        return this.dimensionColState.filter(cs => cs.selected);
    }

    public getColDisplayName(col: Column): string | null {
        return this.chartColumnService.getColDisplayName(col);
    }

    public isPivotMode(): boolean {
        return this.chartColumnService.isPivotMode();
    }

    public getChartDataType(colId: string): string | undefined {
        const column = this.chartColumnService.getColumn(colId);
        return column ? column.getColDef().chartDataType : undefined;
    }

    private isPivotActive(): boolean {
        return this.chartColumnService.isPivotActive();
    }

    private createCellRange(type: CellRangeType, ...columns: Column[]): CellRange {
        return {
            id: this.chartId, // set range ID to match chart ID so we can identify changes to the ranges for this chart
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns,
            startColumn: type === CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type
        };
    }

    private getAllColumnsFromRanges(): Set<Column> {
        if (this.pivotChart) {
            return _.convertToSet(this.chartColumnService.getAllDisplayedColumns());
        }

        const columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;

        if (this.dimensionCellRange) {
            columns.push(...this.dimensionCellRange.columns);
        }

        if (this.valueCellRange) {
            columns.push(...this.valueCellRange.columns);
        }

        return _.convertToSet(columns);
    }

    private getRowIndexes(): { startRow: number; endRow: number; } {
        let startRow = 0, endRow = 0;
        const { rangeService, valueCellRange, dimensionCellRange } = this;

        // Not all chart types require a value series (e.g. hierarchical charts),
        // so fall back to using the dimension cell range for inferring row indices
        const cellRange = valueCellRange || dimensionCellRange;

        if (rangeService && cellRange) {
            startRow = rangeService.getRangeStartRow(cellRange).rowIndex;

            // when the last row the cell range is a pinned 'bottom' row, the `endRow` index is set to -1 which results
            // in the ChartDatasource processing all non pinned rows from the `startRow` index.
            const endRowPosition = rangeService.getRangeEndRow(cellRange);
            endRow = endRowPosition.rowPinned === 'bottom' ? -1 : endRowPosition.rowIndex;
        }

        return { startRow, endRow };
    }

    private resetColumnState(): void {
        const { dimensionCols, valueCols } = this.chartColumnService.getChartColumns();
        const allCols = this.getAllColumnsFromRanges();
        const isInitialising = this.valueColState.length < 1;

        this.dimensionColState = [];
        this.valueColState = [];

        const supportsMultipleDimensions = isHierarchical(this.chartType);
        let hasSelectedDimension = false;
        let order = 1;

        const aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO

        dimensionCols.forEach(column => {
            const isAutoGroupCol = column.getColId() === 'ag-Grid-AutoColumn';

            let selected = false;
            if (this.crossFiltering && this.aggFunc) {
                if (aggFuncDimension.getColId() === column.getColId()) {
                    selected = true;
                }
            } else {
                selected = isAutoGroupCol ? true : (!hasSelectedDimension || supportsMultipleDimensions) && allCols.has(column);
            }

            this.dimensionColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected,
                order: order++
            });

            if (selected) {
                hasSelectedDimension = true;
            }
        });

        const defaultCategory = {
            colId: ChartDataModel.DEFAULT_CATEGORY,
            displayName: this.chartTranslationService.translate('defaultCategory'),
            selected: !hasSelectedDimension, // if no dimensions in range select the default
            order: 0
        };

        this.dimensionColState.unshift(defaultCategory);

        const valueColumnsFromReferenceRange = this.referenceCellRange.columns.filter(c => valueCols.has(c));

        valueCols.forEach(column => {
            // first time the value cell range is set, preserve the column order from the supplied range
            if (isInitialising && _.includes(this.referenceCellRange.columns, column)) {
                column = valueColumnsFromReferenceRange.shift()!;
            }

            this.valueColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: allCols.has(column),
                order: order++
            });
        });
    }

    private updateColumnState(updatedCol: ColState): void {
        const idsMatch = (cs: ColState) => cs.colId === updatedCol.colId;
        const { dimensionColState, valueColState } = this;

        // Determine whether the specified column is a dimension or value column
        const matchedDimensionColState = dimensionColState.find(idsMatch);
        const matchedValueColState = valueColState.find(idsMatch);

        if (matchedDimensionColState) {
            // For non-hierarchical chart types, only one dimension can be selected
            const supportsMultipleDimensions = isHierarchical(this.chartType);
            if (!supportsMultipleDimensions) {
                // Determine which column should end up selected, if any
                const selectedColumnState = updatedCol.selected
                    ? matchedDimensionColState
                    : dimensionColState
                        .filter((cs) => cs !== matchedDimensionColState)
                        .find(({ selected }) => selected);
                // Update the selection state of all dimension columns
                dimensionColState.forEach(cs => cs.selected = (cs === selectedColumnState));
            } else {
                // Update the selection state of the specified dimension column
                matchedDimensionColState.selected = updatedCol.selected;
            }
        } else if (matchedValueColState) {
            // Update the selection state of the specified value column
            matchedValueColState.selected = updatedCol.selected;
        }

        const allColumns = [...dimensionColState, ...valueColState];
        const orderedColIds: string[] = [];

        // calculate new order
        allColumns.forEach((col: ColState, i: number) => {
            if (i === updatedCol.order) {
                orderedColIds.push(updatedCol.colId);
            }

            if (col.colId !== updatedCol.colId) {
                orderedColIds.push(col.colId);
            }
        });

        // update col state with new order
        allColumns.forEach(col => {
            const order = orderedColIds.indexOf(col.colId);
            col.order = order >= 0 ? orderedColIds.indexOf(col.colId) : allColumns.length - 1;
        });

        this.reorderColState();
    }

    private reorderColState(): void {
        const ascColStateOrder = (a: ColState, b: ColState) => a.order - b.order;
        this.dimensionColState.sort(ascColStateOrder);
        this.valueColState.sort(ascColStateOrder);
    }

    private setDimensionCellRange(dimensionCols: Set<Column>, colsInRange: Set<Column>, updatedColState?: ColState): void {
        this.dimensionCellRange = undefined;

        if (!updatedColState && !this.dimensionColState.length) {
            const supportsMultipleDimensions = isHierarchical(this.chartType);
            const selectedCols = new Array<Column>();
            // use first dimension column in range by default, or all dimension columns for hierarchical charts
            dimensionCols.forEach(col => {
                if ((selectedCols.length > 0 && !supportsMultipleDimensions) || !colsInRange.has(col)) { return; }
                selectedCols.push(col);
            });
            if (selectedCols.length > 0) {
                this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedCols);
            }
            return;
        }

        let selectedDimensionColStates = updatedColState ? [updatedColState] : [];
        if (this.crossFiltering && this.aggFunc) {
            const aggFuncDimension = this.suppliedCellRange.columns[0]; //TODO
            selectedDimensionColStates = this.dimensionColState.filter(cs => cs.colId === aggFuncDimension.getColId());
        } else if (selectedDimensionColStates.length === 0 || selectedDimensionColStates.some(({ column }) => !column || !dimensionCols.has(column))) {
            selectedDimensionColStates = this.dimensionColState.filter(cs => cs.selected);
        }

        const isDefaultCategory = selectedDimensionColStates.length === 1
            ? selectedDimensionColStates[0].colId === ChartDataModel.DEFAULT_CATEGORY
            : false;
        const selectedColumns = selectedDimensionColStates.map(({ column }) => column)
            .filter((value): value is NonNullable<typeof value> => value != null);
        if (selectedColumns.length > 0 && !isDefaultCategory) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedColumns);
        }
    }

    private setValueCellRange(valueCols: Set<Column>, colsInRange: Set<Column>, updatedColState?: ColState): void {
        this.valueCellRange = undefined;

        const selectedValueCols: Column[] = [];

        valueCols.forEach(col => {
            if (updatedColState && updatedColState.colId === col.getColId()) {
                if (updatedColState.selected) {
                    selectedValueCols.push(updatedColState.column!);
                }
            } else if (colsInRange.has(col)) {
                selectedValueCols.push(col);
            }
        });

        if (selectedValueCols.length > 0) {
            let orderedColIds: string[] = [];

            if (this.valueColState.length > 0) {
                orderedColIds = this.valueColState.map(c => c.colId);
            } else {
                colsInRange.forEach(c => orderedColIds.push(c.getColId()));
            }

            selectedValueCols.sort((a, b) => orderedColIds.indexOf(a.getColId()) - orderedColIds.indexOf(b.getColId()));

            this.valueCellRange = this.createCellRange(CellRangeType.VALUE, ...selectedValueCols);
        }
    }

    private updateSelectedDimensions(columns: Column[]): void {
        const colIdSet = new Set(columns.map((column) => column.getColId()));

        // For non-hierarchical chart types, only one dimension can be selected
        const supportsMultipleDimensions = isHierarchical(this.chartType);
        if (!supportsMultipleDimensions) {
            // Determine which column should end up selected, if any
            // if no dimension found in supplied columns use the default category (always index = 0)
            const foundColState = this.dimensionColState.find((colState) => colIdSet.has(colState.colId)) || this.dimensionColState[0];
            const selectedColumnId = foundColState.colId;
            // Update the selection state of all dimension columns
            this.dimensionColState = this.dimensionColState.map((colState) => ({
                ...colState,
                selected: colState.colId === selectedColumnId,
            }));
        } else {
            // Update the selection state of all dimension columns, selecting only the provided columns from the chart model
            const foundColStates = this.dimensionColState.filter((colState) => colIdSet.has(colState.colId));
            const selectedColumnIds = new Set(foundColStates.map((colState) => colState.colId));
            this.dimensionColState = this.dimensionColState.map((colState) => ({
                ...colState,
                selected: selectedColumnIds.has(colState.colId),
            }));
        }
    }

    private syncDimensionCellRange() {
        const selectedDimensions = this.getSelectedDimensions();
        if (selectedDimensions.length === 0) return;
        const selectedCols = selectedDimensions.map(({ column }) => column)
            .filter((value): value is NonNullable<typeof value> => value != null);
        if (selectedCols.length > 0) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, ...selectedCols);
        }
    }

    public isComboChart(): boolean {
        return ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
    }
}
