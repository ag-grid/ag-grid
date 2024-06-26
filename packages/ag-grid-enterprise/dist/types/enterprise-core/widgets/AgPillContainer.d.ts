import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export interface PillRendererParams<TValue> {
    eWrapper?: HTMLElement;
    announceItemFocus?: () => void;
    onPillMouseDown?: (e: MouseEvent) => void;
    getValue: () => TValue[] | null;
    setValue: (value: TValue[] | null) => void;
}
export declare class AgPillContainer<TValue> extends Component {
    private focusService;
    private params;
    private pills;
    wireBeans(beans: BeanCollection): void;
    constructor();
    init(params: PillRendererParams<TValue>): void;
    refresh(): void;
    onNavigationKeyDown(e: KeyboardEvent): void;
    private clearPills;
    private onPillButtonClick;
    private onPillKeyDown;
    private deletePill;
    destroy(): void;
}
