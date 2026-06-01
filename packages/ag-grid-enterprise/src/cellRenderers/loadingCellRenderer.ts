import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';
import { Component, _createIconNoSpan } from 'ag-grid-community';

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
        if (params.node.failedLoad) {
            this.setupFailed();
        } else {
            this.setupLoading();
        }
    }

    private setupFailed(): void {
        this.eLoadingText.textContent = this.getLocaleTextFunc()('loadingError', 'ERR');
    }

    private setupLoading(): void {
        const eLoadingIcon = _createIconNoSpan('groupLoading', this.beans, null);
        if (eLoadingIcon) {
            this.eLoadingIcon.appendChild(eLoadingIcon);
        }

        this.eLoadingText.textContent = this.getLocaleTextFunc()('loadingOoo', 'Loading...');
    }

    public refresh(_params: ILoadingCellRendererParams): boolean {
        return false;
    }
}
