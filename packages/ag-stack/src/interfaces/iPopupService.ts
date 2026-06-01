import type {
    AddPopupParams,
    AddPopupResult,
    AgComponentPopupPositionParams,
    AgMenuPopupPositionParams,
    AgMousePopupPositionParams,
    AgPopupPositionParams,
} from './iPopup';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPopupService<TPopupPositionParams> {
    readonly beanName: 'popupSvc';

    getPopupParent(): HTMLElement;

    addPopup<TContainerType extends string>(params: AddPopupParams<TContainerType>): AddPopupResult;

    positionPopupByComponent(params: AgComponentPopupPositionParams<TPopupPositionParams>): void;

    positionPopupUnderMouseEvent(params: AgMousePopupPositionParams<TPopupPositionParams>): void;

    positionPopupForMenu(params: AgMenuPopupPositionParams<TPopupPositionParams>): void;

    positionPopup(params: AgPopupPositionParams<TPopupPositionParams>): void;

    callPostProcessPopup(
        params: TPopupPositionParams | undefined,
        type: string,
        ePopup: HTMLElement,
        eventSource?: HTMLElement | null,
        mouseEvent?: MouseEvent | Touch | null
    ): void;

    bringPopupToFront(ePopup: HTMLElement): void;

    getParentRect(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}
