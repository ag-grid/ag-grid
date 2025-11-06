import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { IOverlay, IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface ILoadingOverlayParams<TData = any, TContext = any> extends IOverlayParams<TData, TContext> {}

export interface ILoadingOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, ILoadingOverlayParams> {}

export interface ILoadingOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, ILoadingOverlayParams<TData, TContext>> {}

const LoadingOverlayElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay-loading-center',
    children: [
        { tag: 'span', ref: 'eLoadingIcon', cls: 'ag-loading-icon' },
        { tag: 'span', ref: 'eLoadingText', cls: 'ag-loading-text' },
    ],
};
export class LoadingOverlayComponent
    extends OverlayComponent<any, any, ILoadingOverlayParams>
    implements ILoadingOverlayComp<any, any>
{
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayLoadingTemplate')?.trim());

        this.setTemplate(customTemplate ?? LoadingOverlayElement);

        if (!customTemplate) {
            const eLoadingIcon = _createIconNoSpan('overlayLoading', this.beans, null);
            if (eLoadingIcon) {
                this.eLoadingIcon.appendChild(eLoadingIcon);
            }
            const localeTextFunc = this.getLocaleTextFunc();
            const loadingText = localeTextFunc('loadingOoo', 'Loading...');
            this.eLoadingText.textContent = loadingText;
            this.beans.ariaAnnounce.announceValue(loadingText, 'overlay');
        }
    }
}
