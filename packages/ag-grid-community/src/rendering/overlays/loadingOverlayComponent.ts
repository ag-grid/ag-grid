import type { ElementParams } from '../../utils/dom';
import { _makeNull } from '../../utils/generic';
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
    attrs: { 'aria-live': 'polite', 'aria-atomic': 'true', 'aria-hidden': 'true' },
};

export class LoadingOverlayComponent
    extends OverlayComponent<any, any, ILoadingOverlayParams>
    implements ILoadingOverlayComp<any, any>
{
    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayLoadingTemplate')?.trim());

        if (customTemplate) {
            this.setTemplate(customTemplate);
            return;
        }

        this.setTemplate(LoadingOverlayElement);

        const localeTextFunc = this.getLocaleTextFunc();
        const eGui = this.getGui();

        // This need to be set synchronously to ensure the loading screen is visible immediately
        eGui.textContent = localeTextFunc('loadingOoo', 'Loading...');

        // we set aria-hidden = true and clear it with a setTimeout
        // because some screen readers only announce `aria-live` text when
        // there is a "text change", so we force a change.
        setTimeout(() => {
            eGui.removeAttribute('aria-hidden');
            eGui.textContent += ' ';
        }, 0);
    }
}
