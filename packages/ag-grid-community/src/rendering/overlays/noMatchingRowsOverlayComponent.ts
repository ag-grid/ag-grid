import { _makeNull } from '../../agStack/utils/generic';
import type { ElementParams } from '../../utils/element';
import type {
    INoMatchingRowsOverlayParams,
    IOverlay,
    IOverlayComp,
    NoMatchingRowsOverlayUserParams,
} from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface INoMatchingRowsOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, INoMatchingRowsOverlayParams> {}

export interface INoMatchingRowsOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, INoMatchingRowsOverlayParams<TData, TContext>> {}
const NoMatchingRowsOverlayElement: ElementParams = { tag: 'span', cls: 'ag-overlay-no-matching-rows-center' };

export class NoMatchingRowsOverlayComponent
    extends OverlayComponent<any, any, INoMatchingRowsOverlayParams & NoMatchingRowsOverlayUserParams>
    implements INoMatchingRowsOverlayComp<any, any>
{
    public init(params: INoMatchingRowsOverlayParams & NoMatchingRowsOverlayUserParams): void {
        const { beans } = this;

        this.setTemplate(NoMatchingRowsOverlayElement);

        const noRowsText =
            params.agNoMatchingRowsOverlayText ?? this.getLocaleTextFunc()('noMatchingRows', 'No Matching Rows');
        this.getGui().textContent = noRowsText;

        beans.ariaAnnounce.announceValue(noRowsText, 'overlay');
    }
}
