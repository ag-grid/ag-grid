import type { ElementParams, ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan } from 'ag-grid-community';

const LoadingCellRendererElement: ElementParams = {
    tag: 'div',
    cls: 'ag-loading',
    children: [
        { tag: 'span', ref: 'eLoadingIcon', cls: 'ag-loading-icon' },
        { tag: 'span', ref: 'eLoadingText', cls: 'ag-loading-text' },
    ],
};
export class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

    constructor() {
        super(LoadingCellRendererElement);
    }

    public init(params: ILoadingCellRendererParams): void {
        params.node.failedLoad ? this.setupFailed() : this.setupLoading();
    }

    private setupFailed(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
        this.eLoadingText.innerText = localeTextFunc('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eLoadingIcon = _createIconNoSpan('groupLoading', this.beans, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        const localeTextFunc = this.getLocaleTextFunc();
        // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }

    public refresh(_params: ILoadingCellRendererParams): boolean {
        return false;
    }
}
