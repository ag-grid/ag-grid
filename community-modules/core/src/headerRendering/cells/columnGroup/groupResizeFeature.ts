import { ColumnEventType } from "../../../events";
import { ColumnModel, ColumnResizeSet } from "../../../columns/columnModel";
import { BeanStub } from "../../../context/beanStub";
import { Autowired, PostConstruct } from "../../../context/context";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { AutoWidthCalculator } from "../../../rendering/autoWidthCalculator";
import { HorizontalResizeService } from "../../common/horizontalResizeService";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";
import { IHeaderResizeFeature } from "../abstractCell/abstractHeaderCellCtrl";

interface ColumnSizeAndRatios {
    columnsToResize: Column[];
    resizeStartWidth: number;
    resizeRatios: number[];
    groupAfterColumns?: Column[];
    groupAfterStartWidth?: number;
    groupAfterRatios?: number[];
}
export class GroupResizeFeature extends BeanStub implements IHeaderResizeFeature {

    private eResize: HTMLElement;
    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;
    private pinned: ColumnPinnedType;

    private resizeCols?: Column[];
    private resizeStartWidth: number;
    private resizeRatios?: number[];

    private resizeTakeFromCols?: Column[];
    private resizeTakeFromStartWidth?: number;
    private resizeTakeFromRatios?: number[];

    @Autowired('horizontalResizeService') private readonly horizontalResizeService: HorizontalResizeService;
    @Autowired('autoWidthCalculator') private readonly autoWidthCalculator: AutoWidthCalculator;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    constructor(comp: IHeaderGroupCellComp, eResize: HTMLElement,  pinned: ColumnPinnedType, columnGroup: ColumnGroup) {
        super();

        this.eResize = eResize;
        this.comp = comp;
        this.pinned = pinned;
        this.columnGroup = columnGroup;
    }

    @PostConstruct
    private postConstruct(): void {

        if (!this.columnGroup.isResizable()) {
            this.comp.setResizableDisplayed(false);
            return;
        }

        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        if (!this.gos.get('suppressAutoSize')) {
            const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

            this.eResize.addEventListener('dblclick', () => {
                // get list of all the column keys we are responsible for
                const keys: string[] = [];
                const leafCols = this.columnGroup.getDisplayedLeafColumns();

                leafCols.forEach((column: Column) => {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });

                if (keys.length > 0) {
                    this.columnModel.autoSizeColumns({
                        columns: keys,
                        skipHeader: skipHeaderOnAutoSize,
                        stopAtGroup: this.columnGroup,
                        source: 'uiColumnResized'
                    });
                }

                this.resizeLeafColumnsToFit('uiColumnResized');
            });
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        const initialValues = this.getInitialValues(shiftKey);
        this.storeLocalValues(initialValues);
        this.toggleColumnResizing(true);
    }

    public onResizing(finished: boolean, resizeAmount: any, source: ColumnEventType = 'uiColumnResized'): void {
        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        const width = this.resizeStartWidth + resizeAmountNormalised;

        this.resizeColumnsFromLocalValues(width, source, finished);
    }

    public getInitialValues(shiftKey?: boolean): ColumnSizeAndRatios {
        const columnsToResize = this.getColumnsToResize();
        const resizeStartWidth = this.getInitialSizeOfColumns(columnsToResize);
        const resizeRatios = this.getSizeRatiosOfColumns(columnsToResize, resizeStartWidth);

        const columnSizeAndRatios: ColumnSizeAndRatios = {
            columnsToResize,
            resizeStartWidth,
            resizeRatios
        };

        let groupAfter: ColumnGroup | null = null;

        if (shiftKey) {
            groupAfter = this.columnModel.getDisplayedGroupAtDirection(this.columnGroup, 'After');
        }

        if (groupAfter) {
            const takeFromLeafCols = groupAfter.getDisplayedLeafColumns();
            const groupAfterColumns = columnSizeAndRatios.groupAfterColumns = takeFromLeafCols.filter(col => col.isResizable());
            const groupAfterStartWidth = columnSizeAndRatios.groupAfterStartWidth = this.getInitialSizeOfColumns(groupAfterColumns);
            columnSizeAndRatios.groupAfterRatios = this.getSizeRatiosOfColumns(groupAfterColumns, groupAfterStartWidth);
        } else {
            columnSizeAndRatios.groupAfterColumns = undefined;
            columnSizeAndRatios.groupAfterStartWidth = undefined;
            columnSizeAndRatios.groupAfterRatios = undefined;
        }

        return columnSizeAndRatios;
    }

    private storeLocalValues(initialValues: ColumnSizeAndRatios): void {
        const {
            columnsToResize, resizeStartWidth, resizeRatios,
            groupAfterColumns, groupAfterStartWidth, groupAfterRatios
        } = initialValues;

        this.resizeCols = columnsToResize;
        this.resizeStartWidth = resizeStartWidth;
        this.resizeRatios = resizeRatios;

        this.resizeTakeFromCols = groupAfterColumns;
        this.resizeTakeFromStartWidth = groupAfterStartWidth;
        this.resizeTakeFromRatios = groupAfterRatios;
    }

    private clearLocalValues(): void {
        this.resizeCols = undefined;
        this.resizeRatios = undefined;

        this.resizeTakeFromCols = undefined;
        this.resizeTakeFromRatios = undefined;
    }

    public resizeLeafColumnsToFit(source: ColumnEventType): void {
        const preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        const initialValues = this.getInitialValues();

        if (preferredSize > initialValues.resizeStartWidth) {
            this.resizeColumns(initialValues, preferredSize, source, true);
        }
    }

    private resizeColumnsFromLocalValues(totalWidth: number, source: ColumnEventType, finished: boolean = true): void {
        if (!this.resizeCols || !this.resizeRatios) { return; }

        const initialValues: ColumnSizeAndRatios = {
            columnsToResize: this.resizeCols,
            resizeStartWidth: this.resizeStartWidth,
            resizeRatios: this.resizeRatios,
            groupAfterColumns: this.resizeTakeFromCols ?? undefined,
            groupAfterStartWidth: this.resizeTakeFromStartWidth ?? undefined,
            groupAfterRatios: this.resizeTakeFromRatios ?? undefined
        }

        this.resizeColumns(initialValues, totalWidth, source, finished);
    }

    public resizeColumns(initialValues: ColumnSizeAndRatios, totalWidth: number, source: ColumnEventType, finished: boolean = true): void {
        const {
            columnsToResize, resizeStartWidth, resizeRatios,
            groupAfterColumns, groupAfterStartWidth, groupAfterRatios
        } = initialValues;

        const resizeSets: ColumnResizeSet[] = [];

        resizeSets.push({
            columns: columnsToResize,
            ratios: resizeRatios,
            width: totalWidth
        });

        if (groupAfterColumns) {
            const diff = totalWidth - resizeStartWidth;
            resizeSets.push({
                columns: groupAfterColumns,
                ratios: groupAfterRatios!,
                width: groupAfterStartWidth! - diff
            });
        }

        this.columnModel.resizeColumnSets({
            resizeSets,
            finished,
            source: source
        });

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.comp.addOrRemoveCssClass('ag-column-resizing', resizing);
    }

    private getColumnsToResize(): Column[] {
        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        return leafCols.filter(col => col.isResizable());
    }

    private getInitialSizeOfColumns(columns: Column[]): number {
        return columns.reduce(
            (totalWidth: number, column: Column) => totalWidth + column.getActualWidth(), 0
        );
    }

    private getSizeRatiosOfColumns(columns: Column[], initialSizeOfColumns: number): number[] {
        return columns.map(column => column.getActualWidth() / initialSizeOfColumns);
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    private normaliseDragChange(dragChange: number): number {
        let result = dragChange;

        if (this.gos.get('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== 'left') {
                result *= -1;
            }
        } else if (this.pinned === 'right') {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }

        return result;
    }

    protected destroy(): void {
        super.destroy();
        this.clearLocalValues();
    }
}