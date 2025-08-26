import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import type { IOverlay, IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface INoRowsOverlayParams<TData = any, TContext = any> extends IOverlayParams<TData, TContext> {}

export interface INoRowsOverlay<TData = any, TContext = any> extends IOverlay<TData, TContext, INoRowsOverlayParams> {}

export interface INoRowsOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, INoRowsOverlayParams<TData, TContext>> {}
const NoRowsOverlayElement: ElementParams = { tag: 'span', cls: 'ag-overlay-no-rows-center' };

export class NoRowsOverlayComponent
    extends OverlayComponent<any, any, INoRowsOverlayParams>
    implements INoRowsOverlayComp<any, any>
{
    public init(): void {
        const customTemplate = _makeNull(this.gos.get('overlayNoRowsTemplate')?.trim());

        this.setTemplate(customTemplate ?? NoRowsOverlayElement);

        if (!customTemplate) {
            const localeTextFunc = this.getLocaleTextFunc();
            const noRowsText = localeTextFunc('noRowsToShow', 'No Rows To Show');
            this.getGui().textContent = noRowsText;

            this.beans.ariaAnnounce.announceValue(noRowsText, 'overlay');
        }
    }
}
