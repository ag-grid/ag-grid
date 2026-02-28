import { BeanStub } from '../../../context/beanStub';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { BodyScrollEvent } from '../../../events';

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
            const refreshStickyOffset = this.refreshStickyOffset.bind(this);

            if (columnGroup.getPinned() == null) {
                this.addManagedEventListeners({
                    bodyScroll: (event: BodyScrollEvent) => {
                        if (event.direction === 'horizontal') {
                            this.updateSticky(event.left);
                        }
                    },
                    leftPinnedWidthChanged: refreshStickyOffset,
                });
            }

            this.addManagedListeners(columnGroup, {
                leftChanged: refreshPosition,
                displayedChildrenChanged: refreshPosition,
            });
            this.addManagedEventListeners({
                columnResized: refreshPosition,
            });

            this.addManagedPropertyListener('enableRtl', refreshStickyOffset);
            this.refreshStickyOffset();
            this.refreshPosition();
        });
    }

    private refreshPosition(): void {
        const { columnGroup, beans } = this;
        const left = columnGroup.getLeft();
        const width = columnGroup.getActualWidth();

        if (left == null || width === 0) {
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
        const { beans, left, right } = this;

        if (left == null || right == null) {
            this.setSticky(false);
            return;
        }

        const { gos, visibleCols } = beans;
        const isRtl = gos.get('enableRtl');
        const viewportEdge = isRtl ? visibleCols.bodyWidth - scrollLeft : scrollLeft;
        this.setSticky(left < viewportEdge && right > viewportEdge);
    }

    private setSticky(value: boolean): void {
        const { isSticky, eLabel } = this;
        if (isSticky === value) {
            return;
        }

        this.isSticky = value;
        eLabel.classList.toggle('ag-sticky-label', value);
    }

    private refreshStickyOffset(): void {
        if (this.columnGroup.getPinned() != null) {
            this.eLabel.style.removeProperty('left');
            this.eLabel.style.removeProperty('right');
            return;
        }

        const {
            beans: { gos, visibleCols },
            eLabel,
        } = this;
        const pinnedOffset = visibleCols.getLeftStickyColumnContainerWidth();
        const offset = `calc(var(--ag-cell-horizontal-padding) + ${pinnedOffset}px)`;

        if (gos.get('enableRtl')) {
            eLabel.style.removeProperty('left');
            eLabel.style.setProperty('right', offset);
            return;
        }

        eLabel.style.removeProperty('right');
        eLabel.style.setProperty('left', offset);
    }
}
