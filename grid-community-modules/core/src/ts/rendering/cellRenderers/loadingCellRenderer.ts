import { Component } from "../../widgets/component";
import { ICellRendererParams } from "./iCellRenderer";
import { RefSelector } from "../../widgets/componentAnnotations";
import { createIconNoSpan } from "../../utils/icon";
import { IComponent } from "../../interfaces/iComponent";

export interface ILoadingCellRendererParams<TData = any> extends ICellRendererParams<TData> { }
export interface ILoadingCellRenderer { }
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> { }

export class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {

    private static TEMPLATE =
        `<div class="ag-loading">
            <span class="ag-loading-icon" ref="eLoadingIcon"></span>
            <span class="ag-loading-text" ref="eLoadingText"></span>
        </div>`;

    @RefSelector('eLoadingIcon') private eLoadingIcon: HTMLElement;
    @RefSelector('eLoadingText') private eLoadingText: HTMLElement;

    constructor() {
        super(LoadingCellRenderer.TEMPLATE);
    }

    public init(params: ILoadingCellRendererParams): void {
        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }

    private setupFailed(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eLoadingIcon = createIconNoSpan('groupLoading', this.gridOptionsService, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
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