import type { ElementParams } from '../../utils/element';
import type {
    INoMatchingRowsOverlayParams,
    IOverlay,
    IOverlayComp,
    IOverlayParams,
    OverlayComponentUserParams,
} from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface INoMatchingRowsOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, INoMatchingRowsOverlayParams<TData, TContext>> {}
export interface INoMatchingRowsOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, INoMatchingRowsOverlayParams<TData, TContext>> {}

const NoMatchingRowsOverlayElement: ElementParams = { tag: 'span', cls: 'ag-overlay-no-matching-rows-center' };

export class NoMatchingRowsOverlayComponent
    extends OverlayComponent<any, any, IOverlayParams & OverlayComponentUserParams>
    implements INoMatchingRowsOverlayComp<any, any>
{
    public init(params: INoMatchingRowsOverlayParams & OverlayComponentUserParams): void {
        const { beans } = this;

        this.setTemplate(NoMatchingRowsOverlayElement);

        const noRowsText =
            params.noMatchingRows?.overlayText ?? this.getLocaleTextFunc()('noMatchingRows', 'No Matching Rows');
        this.getGui().textContent = noRowsText;

        beans.ariaAnnounce.announceValue(noRowsText, 'overlay');
    }
}
