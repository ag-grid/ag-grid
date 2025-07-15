import { AutoScrollService } from '../../autoScrollService';
import type { BeanCollection } from '../../context/context';
import type { GridBodyCtrl } from '../../gridBodyComp/gridBodyCtrl';
import type { IRowNode } from '../../interfaces/iRowNode';

/**
 * Used to handle the auto-scrolling and the throttled make new group and expand logic while dragging rows.
 */
export class RowDragNudger {
    private oldVScroll = 0;

    public groupTimer: number | null = null;
    public groupTarget: IRowNode | null = null;
    public groupThrottled = false;
    public readonly autoScrollService: AutoScrollService;

    private onGroupThrottle = () => {
        this.groupTimer = null;
        this.groupThrottled = true;
        this.beans.dragAndDrop?.nudge();
        const target = this.groupTarget;
        if (target && !target.expanded && target.childrenAfterSort?.length && target.isExpandable()) {
            target.setExpanded(true, undefined, true);
        }
    };

    private getScrollY = () => this.gridBodyCtrl.scrollFeature.getVScrollPosition().top;

    private onScroll = () => {
        const newVScroll = this.getScrollY();
        if (this.oldVScroll !== newVScroll) {
            this.oldVScroll = newVScroll;
            this.clearGroup();
            this.beans.dragAndDrop?.nudge();
        }
    };

    constructor(
        private readonly beans: BeanCollection,
        private gridBodyCtrl: GridBodyCtrl
    ) {
        this.autoScrollService = new AutoScrollService({
            scrollContainer: gridBodyCtrl.eBodyViewport,
            scrollAxis: 'y',
            getVerticalPosition: this.getScrollY,
            setVerticalPosition: (position) => this.gridBodyCtrl.scrollFeature.setVerticalScrollPosition(position),
            onScrollCallback: this.onScroll,
        });
    }

    public updateGroup(target: IRowNode | null) {
        if (this.groupTarget !== null && this.groupTarget !== target) {
            this.clearGroup();
        }
        if (target !== null && target.expanded && target.childrenAfterSort?.length) {
            this.groupThrottled = true;
            this.groupTarget = target;
        }
    }

    public startGroup(target: IRowNode | null) {
        this.groupTarget = target;
        if (this.groupTimer === null) {
            this.groupTimer = window.setTimeout(this.onGroupThrottle, this.beans.gos.get('rowDragInsertDelay'));
        }
    }

    private clearGroup() {
        this.groupThrottled = false;
        this.groupTarget = null;
        const timer = this.groupTimer;
        if (timer !== null) {
            this.groupTimer = null;
            window.clearTimeout(timer);
        }
    }

    public clear() {
        this.autoScrollService.ensureCleared();
        this.clearGroup();
    }
}
