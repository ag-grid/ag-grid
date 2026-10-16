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
        const colResize = this.beans.colResize!;
        this.dragPlan = colResize.planGroupResize(this.columnGroup, colResize.takesFromAdjacent(shiftKey));
        this.dragSign = getDragSign(this.gos.get('enableRtl'), this.columnGroup.pinnedLane);
        _cancelColumnWidthAnimation(this.beans);
        this.toggleColumnResizing(true);
    }

    private onResizing(finished: boolean, resizeAmount: number): void {
        const plan = this.dragPlan;
        if (!plan) {
            return;
        }
        const width = plan.group.startWidth + resizeAmount * this.dragSign;
        this.beans.colResize!.resizeGroup(plan, width, finished, 'uiColumnResized');
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
        const { autoWidthCalc, colResize } = this.beans;
        const preferredSize = autoWidthCalc!.getPreferredWidthForColumnGroup(this.columnGroup);
        const plan = colResize!.planGroupResize(this.columnGroup, false);
        if (preferredSize <= plan.group.startWidth) {
            return;
        }
        colResize!.resizeGroup(plan, preferredSize, true, source, true);
        this.toggleColumnResizing(false);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.comp.toggleCss('ag-column-resizing', resizing);
    }

    public override destroy(): void {
        super.destroy();

        this.dragPlan = null;
    }
}
