import { _makeNull } from '../../utils/generic';
import type { IOverlay, IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface ILoadingOverlayParams<TData = any, TContext = any> extends IOverlayParams<TData, TContext> {}

export interface ILoadingOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, ILoadingOverlayParams> {}

export interface ILoadingOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, ILoadingOverlayParams<TData, TContext>> {}

export class LoadingOverlayComponent
    extends OverlayComponent<any, any, ILoadingOverlayParams>
    implements ILoadingOverlayComp<any, any>
{
    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayLoadingTemplate')?.trim());

        this.setTemplate(
            customTemplate ??
                /* html */ `<span aria-live="polite" aria-atomic="true" class="ag-overlay-loading-center"></span>`
        );

        if (!customTemplate) {
            const localeTextFunc = this.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().textContent = localeTextFunc('loadingOoo', 'Loading...');
            });
        }
    }
}
