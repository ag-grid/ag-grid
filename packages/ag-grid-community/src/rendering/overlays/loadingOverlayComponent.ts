import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import type { IOverlay, IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface ILoadingOverlayParams<TData = any, TContext = any> extends IOverlayParams<TData, TContext> {}

export interface ILoadingOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, ILoadingOverlayParams> {}

export interface ILoadingOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, ILoadingOverlayParams<TData, TContext>> {}

const LoadingOverlayElement: ElementParams = {
    tag: 'span',
    cls: 'ag-overlay-loading-center',
};
export class LoadingOverlayComponent
    extends OverlayComponent<any, any, ILoadingOverlayParams>
    implements ILoadingOverlayComp<any, any>
{
    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayLoadingTemplate')?.trim());

        this.setTemplate(customTemplate ?? LoadingOverlayElement);

        if (!customTemplate) {
            const localeTextFunc = this.getLocaleTextFunc();
            const loadingText = localeTextFunc('loadingOoo', 'Loading...');
            this.getGui().textContent = loadingText;
            this.beans.ariaAnnounce.announceValue(loadingText, 'overlay');
        }
    }
}
