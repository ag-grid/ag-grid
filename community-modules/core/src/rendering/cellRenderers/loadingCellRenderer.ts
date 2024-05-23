import type { IComponent } from '../../interfaces/iComponent';
import { _createIconNoSpan } from '../../utils/icon';
import { Component, RefPlaceholder } from '../../widgets/component';
import type { ICellRendererParams } from './iCellRenderer';

export interface ILoadingCellRendererParams<TData = any, TContext = any> extends ICellRendererParams<TData, TContext> {}
export interface ILoadingCellRenderer {}
export interface ILoadingCellRendererComp extends ILoadingCellRenderer, IComponent<ILoadingCellRendererParams> {}

export class LoadingCellRenderer extends Component implements ILoadingCellRendererComp {
    private static TEMPLATE = `<div class="ag-loading">
            <span class="ag-loading-icon" data-ref="eLoadingIcon"></span>
            <span class="ag-loading-text" data-ref="eLoadingText"></span>
        </div>`;

    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

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
        const eLoadingIcon = _createIconNoSpan('groupLoading', this.gos, null);
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
