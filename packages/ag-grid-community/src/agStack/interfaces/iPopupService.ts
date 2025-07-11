import type { AddPopupParams, AddPopupResult, BasePopupPositionParams } from './iPopup';

export interface IPopupService<TPopupPositionParams extends BasePopupPositionParams> {
    getPopupParent(): HTMLElement;

    addPopup<TContainerType extends string>(params: AddPopupParams<TContainerType>): AddPopupResult;

    positionPopupByComponent(params: TPopupPositionParams & { type: string; eventSource: HTMLElement }): void;
}
