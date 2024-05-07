import { Component } from "../../widgets/component";
import { ILoadingCellRendererComp, ILoadingCellRendererParams } from "./loadingCellRenderer";
import { setAriaLabel, setAriaLabelledBy } from "../../utils/aria";

export class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {
    private static TEMPLATE =
        `<div class="ag-skeleton-container"></div>`;


    constructor() {
        super(SkeletonCellRenderer.TEMPLATE);
    }

    public init(params: ILoadingCellRendererParams): void {
        const id = `ag-cell-skeleton-renderer-${this.getCompId()}`;
        this.getGui().setAttribute('id', id);
        this.addDestroyFunc(() => setAriaLabelledBy(params.eParentOfValue));
        setAriaLabelledBy(params.eParentOfValue, id);

        params.node.failedLoad ? this.#setupFailed() : this.#setupLoading();
    }

    #setupFailed(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.getGui().innerText = localeTextFunc('loadingError', 'ERR');

        const ariaFailed = localeTextFunc('ariaSkeletonCellLoadingFailed', 'Row failed to load')
        setAriaLabel(this.getGui(), ariaFailed);
    }

    #setupLoading(): void {
        const eDocument = this.gos.getDocument();
        const skeletonEffect = eDocument.createElement('div');
        skeletonEffect.classList.add('ag-skeleton-effect');
        
        this.getGui().appendChild(skeletonEffect);

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const ariaLoading = localeTextFunc('ariaSkeletonCellLoading', 'Row data is loading')
        setAriaLabel(this.getGui(), ariaLoading);
    }

    public refresh(params: ILoadingCellRendererParams): boolean {
        return false;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }
}