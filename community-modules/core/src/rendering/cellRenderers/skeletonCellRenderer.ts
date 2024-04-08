import { Component } from "../../widgets/component";
import { ICellRendererParams } from "./iCellRenderer";
import { createIconNoSpan } from "../../utils/icon";
import { IComponent } from "../../interfaces/iComponent";
import { RefSelector } from "../../widgets/componentAnnotations";

export interface ILoadingCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, TContext> { }
export interface ILoadingCellRenderer { }
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> { }

export class SkeletonCellRenderer extends Component implements ILoadingCellRendererComp {

    private static TEMPLATE =
        `<div class="ag-skeleton-container" ref="eSkeletonContainer"></div>`;

    @RefSelector('eSkeletonContainer') private eSkeletonContainer: HTMLElement;

    constructor() {
        super(SkeletonCellRenderer.TEMPLATE);
    }

    public init(params: ILoadingCellRendererParams): void {
        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }

    private setupFailed(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eSkeletonContainer.innerText = localeTextFunc('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eDocument = this.gos.getDocument();
        const skeletonEffect = eDocument.createElement('div');
        skeletonEffect.classList.add('ag-skeleton-effect');

        this.eSkeletonContainer.appendChild(skeletonEffect);
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