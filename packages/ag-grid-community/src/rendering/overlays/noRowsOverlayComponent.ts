import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import type { INoRowsOverlayParams, IOverlay, IOverlayComp } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface INoRowsOverlay<TData = any, TContext = any> extends IOverlay<TData, TContext, INoRowsOverlayParams> {}

export interface INoRowsOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, INoRowsOverlayParams<TData, TContext>> {}
const NoRowsOverlayElement: ElementParams = { tag: 'span', cls: 'ag-overlay-no-rows-center' };

export class NoRowsOverlayComponent
    extends OverlayComponent<any, any, INoRowsOverlayParams>
    implements INoRowsOverlayComp<any, any>
{
    public init(params: INoRowsOverlayParams): void {
        const { beans, gos } = this;
        const customTemplate = _makeNull(gos.get('overlayNoRowsTemplate')?.trim());

        this.setTemplate(customTemplate ?? NoRowsOverlayElement);

        if (!customTemplate) {
            const noRowsText =
                params.agNoRowsOverlayText ?? this.getLocaleTextFunc()('noRowsToShow', 'No Rows To Show');
            this.getGui().textContent = noRowsText;

            beans.ariaAnnounce.announceValue(noRowsText, 'overlay');
        }
    }
}
