import type { AgEvent } from './agEvent';

export interface AgCheckboxChangedEvent extends AgEvent<'checkboxChanged'> {
    id: string;
    name: string;
    selected?: boolean;
    previousValue: boolean | undefined;
}

export type ScrollDirection = 'horizontal' | 'vertical';

export interface AgBodyScrollEvent extends AgEvent<'bodyScroll'> {
    direction: ScrollDirection;
    left: number;
    top: number;
}

export interface BaseEvents {
    checkboxChanged: AgCheckboxChangedEvent;
    bodyScroll: AgBodyScrollEvent;
}
