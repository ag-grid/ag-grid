import { Component } from "../../widgets/component";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
import { RefSelector } from "../../widgets/componentAnnotations";
import { createIconNoSpan } from "../../utils/icon";

export interface ILoadingCellRendererParams extends ICellRendererParams {}
export interface ILoadingCellRenderer extends ICellRenderer {}

export class LoadingCellRenderer extends Component implements ILoadingCellRenderer {

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
        this.eLoadingText.innerText = 'ERR';
    }

    private setupLoading(): void {
        const eLoadingIcon = createIconNoSpan('groupLoading', this.gridOptionsWrapper, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }

    public refresh(params: any): boolean {
        return false;
    }
}