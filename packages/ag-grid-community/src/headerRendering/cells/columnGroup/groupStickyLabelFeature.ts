import { _getScrollLeft } from '../../../agStack/utils/dom';
import { BeanStub } from '../../../context/beanStub';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';

export class GroupStickyLabelFeature extends BeanStub {
    private eViewport: HTMLElement | null = null;
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
            const headerRowContainer = ctrlsSvc.getHeaderRowContainerCtrl(columnGroup.getPinned());
            if (!headerRowContainer) {
                return;
            }

            this.eViewport = headerRowContainer.eViewport;
            const refreshPosition = this.refreshPosition.bind(this);
            const updateSticky = this.updateSticky.bind(this);

            if (columnGroup.getPinned() == null) {
                this.addManagedElementListeners(this.eViewport, {
                    scroll: updateSticky,
                });
            }

            this.addManagedListeners(columnGroup, {
                leftChanged: refreshPosition,
                displayedChildrenChanged: refreshPosition,
            });
            this.addManagedEventListeners({
                columnResized: refreshPosition,
            });

            this.refreshPosition();
        });
    }

    private refreshPosition(): void {
        const { columnGroup } = this;
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
        this.updateSticky();
    }

    private updateSticky(): void {
        const { beans, eViewport, left, right } = this;
        if (!eViewport) {
            return;
        }

        if (left == null || right == null) {
            this.setSticky(false);
            return;
        }

        const { gos, visibleCols } = beans;
        const isRtl = gos.get('enableRtl');
        const scrollLeft = _getScrollLeft(eViewport, isRtl);
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
}
