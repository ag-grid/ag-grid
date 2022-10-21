import { ColumnModel, ColumnResizeSet } from "../../../columns/columnModel";
import { Constants } from "../../../constants/constants";
import { BeanStub } from "../../../context/beanStub";
import { Autowired, PostConstruct } from "../../../context/context";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { AutoWidthCalculator } from "../../../rendering/autoWidthCalculator";
import { HorizontalResizeService } from "../../common/horizontalResizeService";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";

export class GroupResizeFeature extends BeanStub {

    private eResize: HTMLElement;
    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;
    private pinned: ColumnPinnedType;

    private resizeCols: Column[];
    private resizeStartWidth: number;
    private resizeRatios: number[];

    private resizeTakeFromCols: Column[] | null;
    private resizeTakeFromStartWidth: number | null;
    private resizeTakeFromRatios: number[] | null;

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
            this.comp.addOrRemoveResizableCssClass('ag-hidden', true);
            return;
        }

        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        if (!this.gridOptionsService.is('suppressAutoSize')) {
            const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');

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

                this.resizeLeafColumnsToFit();
            });
        }
    }

    public onResizeStart(shiftKey: boolean): void {
        this.calculateInitialValues();

        let takeFromGroup: ColumnGroup | null = null;

        if (shiftKey) {
            takeFromGroup = this.columnModel.getDisplayedGroupAfter(this.columnGroup);
        }

        if (takeFromGroup) {
            const takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();

            this.resizeTakeFromCols = takeFromLeafCols.filter(col => col.isResizable());

            this.resizeTakeFromStartWidth = 0;
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromStartWidth! += col.getActualWidth());
            this.resizeTakeFromRatios = [];
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromRatios!.push(col.getActualWidth() / this.resizeTakeFromStartWidth!));
        } else {
            this.resizeTakeFromCols = null;
            this.resizeTakeFromStartWidth = null;
            this.resizeTakeFromRatios = null;
        }

        this.comp.addOrRemoveCssClass('ag-column-resizing', true);

    }

    public onResizing(finished: boolean, resizeAmount: any): void {
        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        const width = this.resizeStartWidth + resizeAmountNormalised;

        this.resizeColumns(width, finished);
    }

    public resizeLeafColumnsToFit(): void {
        const preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        this.calculateInitialValues();

        if (preferredSize > this.resizeStartWidth) {
            this.resizeColumns(preferredSize, true);
        }
    }

    public resizeColumns(totalWidth: number, finished: boolean = true): void {
        const resizeSets: ColumnResizeSet[] = [];

        resizeSets.push({
            columns: this.resizeCols,
            ratios: this.resizeRatios,
            width: totalWidth
        });

        if (this.resizeTakeFromCols) {
            const diff = totalWidth - this.resizeStartWidth;
            resizeSets.push({
                columns: this.resizeTakeFromCols,
                ratios: this.resizeTakeFromRatios!,
                width: this.resizeTakeFromStartWidth! - diff
            });
        }

        this.columnModel.resizeColumnSets({
            resizeSets,
            finished,
            source: 'uiColumnDragged'
        });

        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    }

    private calculateInitialValues(): void {
        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = leafCols.filter(col => col.isResizable());
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(col => this.resizeStartWidth += col.getActualWidth());
        this.resizeRatios = [];
        this.resizeCols.forEach(col => this.resizeRatios.push(col.getActualWidth() / this.resizeStartWidth));
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    private normaliseDragChange(dragChange: number): number {
        let result = dragChange;

        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== Constants.PINNED_LEFT) {
                result *= -1;
            }
        } else if (this.pinned === Constants.PINNED_RIGHT) {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }

        return result;
    }
}