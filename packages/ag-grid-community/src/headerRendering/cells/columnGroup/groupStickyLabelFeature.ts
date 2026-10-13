import { BeanStub } from '../../../context/beanStub';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { BodyScrollEvent } from '../../../events';

// the grid body keeps the pinned widths in these variables, so no label is told of a change
const LTR_OFFSET = 'calc(var(--ag-cell-horizontal-padding) + var(--ag-internal-pinned-left-width, 0px))';
const RTL_OFFSET = 'calc(var(--ag-cell-horizontal-padding) + var(--ag-internal-pinned-right-width, 0px))';

export class GroupStickyLabelFeature extends BeanStub {
    private isSticky = false;
    private left: number | null = null;
    private right: number | null = null;

    constructor(
        private readonly eLabel: HTMLElement,
        private readonly columnGroup: AgColumnGroup
    ) {
        super();
    }

    public postConstruct(): void {
        const { columnGroup, beans } = this;
        const { ctrlsSvc } = beans;
        ctrlsSvc.whenReady(this, () => {
            const refreshPosition = this.refreshPosition.bind(this);

            // the offset applies only while the label is sticky
            if (this.gos.get('enableRtl')) {
                this.eLabel.style.setProperty('right', RTL_OFFSET);
            } else {
                this.eLabel.style.setProperty('left', LTR_OFFSET);
            }

            this.addManagedEventListeners({
                bodyScroll: (event: BodyScrollEvent) => {
                    if (event.direction === 'horizontal') {
                        this.updateSticky(event.left);
                    }
                },
                columnResized: refreshPosition,
            });
            this.addManagedListeners(columnGroup, {
                leftChanged: refreshPosition,
                displayedChildrenChanged: refreshPosition,
            });

            this.refreshPosition();
        });
    }

    private refreshPosition(): void {
        const { columnGroup, beans } = this;
        const left = columnGroup.getLeft();
        const width = columnGroup.getActualWidth();

        // a reused group can move lanes, and only the scrolling lane slides under the pinned columns
        if (columnGroup.pinnedLane !== 1 || left == null || width === 0) {
            this.left = null;
            this.right = null;
            this.setSticky(false);
            return;
        }

        this.left = left;
        this.right = left + width;

        const scrollPosition = beans.colViewport.getScrollPosition();
        if (scrollPosition != null) {
            this.updateSticky(scrollPosition);
        }
    }

    private updateSticky(scrollLeft: number): void {
        const { left, right } = this;

        if (left == null || right == null) {
            this.setSticky(false);
            return;
        }

        // column left values and scroll positions are both "distance from start edge",
        // so the viewport edge computation is the same in LTR and RTL.
        this.setSticky(left < scrollLeft && right > scrollLeft);
    }

    private setSticky(value: boolean): void {
        const { isSticky, eLabel } = this;
        if (isSticky === value) {
            return;
        }

        this.isSticky = value;
        eLabel.classList.toggle('ag-sticky-label', value);
    }
}
