import { _makeNull } from '../../utils/generic';
import type { IOverlay, IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface INoRowsOverlayParams<TData = any, TContext = any> extends IOverlayParams<TData, TContext> {}

export interface INoRowsOverlay<TData = any, TContext = any> extends IOverlay<TData, TContext, INoRowsOverlayParams> {}

export interface INoRowsOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, INoRowsOverlayParams<TData, TContext>> {}

export class NoRowsOverlayComponent
    extends OverlayComponent<any, any, INoRowsOverlayParams>
    implements INoRowsOverlayComp<any, any>
{
    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayNoRowsTemplate')?.trim());

        this.setTemplate(customTemplate ?? /* html */ `<span class="ag-overlay-no-rows-center"></span>`);

        if (!customTemplate) {
            const localeTextFunc = this.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().textContent = localeTextFunc('noRowsToShow', 'No Rows To Show');
            });
        }
    }
}
