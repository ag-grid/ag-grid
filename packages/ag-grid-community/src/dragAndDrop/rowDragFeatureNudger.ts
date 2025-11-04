import { AutoScrollService } from '../agStack/rendering/autoScrollService';
import type { BeanCollection } from '../context/context';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import type { IRowNode } from '../interfaces/iRowNode';

/**
 * Used to handle the auto-scrolling and the throttled make new group and expand logic while dragging rows.
 */
export class RowDragFeatureNudger {
    public readonly autoScroll: AutoScrollService;
    public groupThrottled = false;
    public scrollChanged = false;
    private scrollChanging = false;
    private oldVScroll: number | null = null;
    private groupTimer: number | null = null;
    private groupTarget: IRowNode | null = null;
    private readonly onGroupThrottle: () => void;

    constructor(
        private readonly beans: BeanCollection,
        gridBodyCtrl: GridBodyCtrl
    ) {
        this.onGroupThrottle = () => {
            this.groupTimer = null;
            this.groupThrottled = true;
            this.beans.dragAndDrop?.nudge();
        };

        const getScrollY = () => gridBodyCtrl.scrollFeature.getVScrollPosition().top;
        this.autoScroll = new AutoScrollService({
            scrollContainer: gridBodyCtrl.eBodyViewport,
            scrollAxis: 'y',
            getVerticalPosition: getScrollY,
            setVerticalPosition: (position) => gridBodyCtrl.scrollFeature.setVerticalScrollPosition(position),
            onScrollCallback: () => {
                const newVScroll = getScrollY();
                if (this.oldVScroll !== newVScroll) {
                    this.oldVScroll = newVScroll;
                    this.scrollChanging = true;
                    return;
                }
                const scrollChanged = this.scrollChanging;
                this.scrollChanged = scrollChanged;
                this.scrollChanging = false;
                if (scrollChanged) {
                    this.beans.dragAndDrop?.nudge();
                    this.scrollChanged = false;
                }
            },
        });
    }

    public updateGroup(target: IRowNode | null, canExpand: boolean) {
        if (this.groupTarget && this.groupTarget !== target) {
            this.clearGroup();
        }
        if (target) {
            if (
                canExpand &&
                this.groupThrottled &&
                !target.expanded &&
                target.childrenAfterSort?.length &&
                target.isExpandable()
            ) {
                target.setExpanded(true, undefined, true);
            }

            if (target.expanded && target.childrenAfterSort?.length) {
                this.groupThrottled = true;
                this.groupTarget = target;
            }
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
        this.clearGroup();
        this.autoScroll.ensureCleared();
        this.oldVScroll = null;
        this.scrollChanged = false;
        this.scrollChanging = false;
    }
}
