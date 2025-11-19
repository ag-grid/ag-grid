import { AutoScrollService } from '../agStack/rendering/autoScrollService';
import type { BeanCollection } from '../context/context';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';

/** Handles auto-scrolling behaviour while dragging rows. */
export class RowDragFeatureNudger {
    public readonly autoScroll: AutoScrollService;
    public scrollChanged = false;
    private scrollChanging = false;
    private oldVScroll: number | null = null;

    constructor(
        private readonly beans: BeanCollection,
        gridBodyCtrl: GridBodyCtrl
    ) {
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

    public clear() {
        this.autoScroll.ensureCleared();
        this.oldVScroll = null;
        this.scrollChanged = false;
        this.scrollChanging = false;
    }
}
