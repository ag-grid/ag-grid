import type { ElementParams, ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';
import { Component, _createElement, _setAriaLabel, _setAriaLabelledBy } from 'ag-grid-community';

const SkeletonCellRendererElement: ElementParams = { tag: 'div', cls: 'ag-skeleton-container' };

export class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {
    constructor() {
        super(SkeletonCellRendererElement);
    }

    public init(params: ILoadingCellRendererParams): void {
        const id = `ag-cell-skeleton-renderer-${this.getCompId()}`;
        this.getGui().setAttribute('id', id);
        this.addDestroyFunc(() => _setAriaLabelledBy(params.eParentOfValue));
        _setAriaLabelledBy(params.eParentOfValue, id);

        params.node.failedLoad ? this.setupFailed() : this.setupLoading(params);
    }

    private setupFailed(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        this.getGui().textContent = localeTextFunc('loadingError', 'ERR');

        const ariaFailed = localeTextFunc('ariaSkeletonCellLoadingFailed', 'Row failed to load');
        _setAriaLabel(this.getGui(), ariaFailed);
    }

    private setupLoading(params: ILoadingCellRendererParams): void {
        const skeletonEffect = _createElement({
            tag: 'div',
            cls: 'ag-skeleton-effect',
        });

        // Use the row index to derive a width value for the skeleton cell
        // to avoid them having uniform width when rendering
        const rowIndex = params.node.rowIndex;
        if (rowIndex != null) {
            // Base value of 75% with variation between [-25%, 25%]. We alternate between sin and
            // cos to achieve a semi-random appearance without actually needing a random number.
            // We avoid using random numbers because then skeletons have consistent widths after
            // being scrolled on and off screen.
            const width = 75 + 25 * (rowIndex % 2 === 0 ? Math.sin(rowIndex) : Math.cos(rowIndex));
            skeletonEffect.style.width = `${width}%`;
        }

        this.getGui().appendChild(skeletonEffect);

        const localeTextFunc = this.getLocaleTextFunc();
        const ariaLoading = localeTextFunc('ariaSkeletonCellLoading', 'Row data is loading');
        _setAriaLabel(this.getGui(), ariaLoading);
    }

    public refresh(_params: ILoadingCellRendererParams): boolean {
        return false;
    }
}
