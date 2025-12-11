import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type {
    ILoadingOverlayParams,
    IOverlay,
    IOverlayComp,
    IOverlayParams,
    OverlayComponentUserParams,
} from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface ILoadingOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, ILoadingOverlayParams<TData, TContext>> {}

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
    extends OverlayComponent<any, any, IOverlayParams & OverlayComponentUserParams>
    implements ILoadingOverlayComp<any, any>
{
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingText: HTMLElement = RefPlaceholder;

    public init(params: ILoadingOverlayParams & OverlayComponentUserParams): void {
        const { beans, gos } = this;
        const customTemplate = _makeNull(gos.get('overlayLoadingTemplate')?.trim());

        this.setTemplate(customTemplate ?? LoadingOverlayElement);

        if (!customTemplate) {
            const eLoadingIcon = _createIconNoSpan('overlayLoading', beans, null);
            if (eLoadingIcon) {
                this.eLoadingIcon.appendChild(eLoadingIcon);
            }
            const loadingText = params.loading?.overlayText ?? this.getLocaleTextFunc()('loadingOoo', 'Loading...');
            this.eLoadingText.textContent = loadingText;
            beans.ariaAnnounce.announceValue(loadingText, 'overlay');
        }
    }
}
