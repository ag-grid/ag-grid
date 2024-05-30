import { _setAriaLabel, _setAriaLabelledBy } from '../../utils/aria';
import { Component } from '../../widgets/component';
import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from './loadingCellRenderer';

export class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {
    private static TEMPLATE = `<div class="ag-skeleton-container"></div>`;

    constructor() {
        super(SkeletonCellRenderer.TEMPLATE);
    }

    public init(params: ILoadingCellRendererParams): void {
        const id = `ag-cell-skeleton-renderer-${this.getCompId()}`;
        this.getGui().setAttribute('id', id);
        this.addDestroyFunc(() => _setAriaLabelledBy(params.eParentOfValue));
        _setAriaLabelledBy(params.eParentOfValue, id);

        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }

    private setupFailed(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.getGui().innerText = localeTextFunc('loadingError', 'ERR');

        const ariaFailed = localeTextFunc('ariaSkeletonCellLoadingFailed', 'Row failed to load');
        _setAriaLabel(this.getGui(), ariaFailed);
    }

    private setupLoading(): void {
        const eDocument = this.gos.getDocument();
        const skeletonEffect = eDocument.createElement('div');
        skeletonEffect.classList.add('ag-skeleton-effect');

        this.getGui().appendChild(skeletonEffect);

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const ariaLoading = localeTextFunc('ariaSkeletonCellLoading', 'Row data is loading');
        _setAriaLabel(this.getGui(), ariaLoading);
    }

    public refresh(params: ILoadingCellRendererParams): boolean {
        return false;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public override destroy(): void {
        super.destroy();
    }
}
