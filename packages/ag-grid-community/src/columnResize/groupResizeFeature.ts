import { _cancelColumnWidthAnimation } from '../columns/columnWidthAnimation';
import { BeanStub } from '../context/beanStub';
import { getDragSign } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColumnEventType } from '../events';
import type { IHeaderResizeFeature } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { IHeaderGroupCellComp } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { GroupResizePlan } from './columnResizeService';

export class GroupResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private dragPlan: GroupResizePlan | null = null;
    private dragTakeFromAdjacent = false;
    private dragGroupWidth = 0;
    private dragSign = 1;

    constructor(
        private readonly comp: IHeaderGroupCellComp,
        private readonly eResize: HTMLElement,
        private readonly columnGroup: AgColumnGroup
    ) {
        super();
    }

    public postConstruct(): void {
        if (!this.columnGroup.isResizable()) {
            this.comp.setResizableDisplayed(false);
            return;
        }

        const { horizontalResizeSvc, gos, colAutosize } = this.beans;

        const finishedWithResizeFunc = horizontalResizeSvc!.addResizeBar({
            eResizeBar: this.eResize,
            isColumn: true,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true),
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        if (!gos.get('suppressAutoSize') && colAutosize) {
            this.addDestroyFunc(
                colAutosize.addColumnGroupResize(this.eResize, this.columnGroup, () =>
                    this.resizeLeafColumnsToFit('uiColumnResized')
                )
            );
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        const { columnGroup, beans } = this;
        const colResize = beans.colResize!;
        const takeFromAdjacent = colResize.takesFromAdjacent(shiftKey);
        this.dragPlan = colResize.planGroupResize(columnGroup, takeFromAdjacent);
        this.dragTakeFromAdjacent = takeFromAdjacent;
        this.dragGroupWidth = columnGroup.getActualWidth();
        this.dragSign = getDragSign(this.gos.get('enableRtl'), columnGroup.pinnedLane);
        _cancelColumnWidthAnimation(beans);
        this.toggleColumnResizing(true);
    }

    private onResizing(finished: boolean, amount: number): void {
        const plan = this.dragPlan;
        if (!plan) {
            return;
        }
        const { columnGroup, beans } = this;
        const change = amount * this.dragSign;
        const held =
            beans.pinnedCols?.limitResize(columnGroup, this.dragTakeFromAdjacent, change, this.dragGroupWidth) ??
            change;
        beans.colResize!.resizeGroup(plan, plan.group.startWidth + held, finished, 'uiColumnResized');
        if (finished) {
            this.dragPlan = null;
            this.toggleColumnResizing(false);
        }
    }

    /** One keyboard step: each press plans afresh, so a held key steps from the widths the last press left. */
    public resizeByKey(delta: number, takeFromAdjacent: boolean): void {
        const colResize = this.beans.colResize!;
        const plan = colResize.planGroupResize(this.columnGroup, takeFromAdjacent);
        colResize.resizeGroup(plan, plan.group.startWidth + delta, true, 'uiColumnResized');
    }

    public resizeLeafColumnsToFit(source: ColumnEventType): void {
        const { autoWidthCalc, colResize, pinnedCols } = this.beans;
        const columnGroup = this.columnGroup;
        const growth = autoWidthCalc!.getPreferredWidthForColumnGroup(columnGroup) - columnGroup.getActualWidth();
        const held = pinnedCols?.limitsAutoSize(source) ? pinnedCols.limitResize(columnGroup, false, growth) : growth;
        if (held <= 0) {
            return;
        }
        const plan = colResize!.planGroupResize(columnGroup, false);
        colResize!.resizeGroup(plan, plan.group.startWidth + held, true, source, columnGroup);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.comp.toggleCss('ag-column-resizing', resizing);
    }

    public override destroy(): void {
        super.destroy();

        this.dragPlan = null;
    }
}
