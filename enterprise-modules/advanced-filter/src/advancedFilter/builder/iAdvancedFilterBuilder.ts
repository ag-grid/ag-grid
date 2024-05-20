import { AdvancedFilterModel, AgEvent, BaseCellDataType, JoinAdvancedFilterModel } from '@ag-grid-community/core';

interface AdvancedFilterBuilderItemEvent extends AgEvent {
    item: AdvancedFilterBuilderItem;
}

export interface AdvancedFilterBuilderAddEvent extends AdvancedFilterBuilderItemEvent {
    isJoin: boolean;
}

export interface AdvancedFilterBuilderMoveEvent extends AdvancedFilterBuilderItemEvent {
    backwards: boolean;
}

export interface AdvancedFilterBuilderRemoveEvent extends AdvancedFilterBuilderItemEvent {}

export interface AdvancedFilterBuilderItem {
    filterModel: AdvancedFilterModel | null;
    level: number;
    parent?: JoinAdvancedFilterModel;
    valid: boolean;
    showMove?: boolean;
}

export type CreatePillParams = CreateInputPillParams | CreateSelectPillParams;

interface CreateInputPillParams extends BaseCreatePillParams {
    isSelect: false;
    baseCellDataType: BaseCellDataType;
}

interface CreateSelectPillParams extends BaseCreatePillParams {
    isSelect: true;
    getEditorParams: () => { values?: any[] };
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
}

interface BaseCreatePillParams {
    key: string;
    displayValue: string;
    cssClass: string;
    update: (key: string) => void;
    ariaLabel: string;
}

export class AdvancedFilterBuilderEvents {
    public static readonly EVENT_ADDED = 'advancedFilterBuilderAdded';
    public static readonly EVENT_MOVED = 'advancedFilterBuilderMoved';
    public static readonly EVENT_REMOVED = 'advancedFilterBuilderRemoved';
    public static readonly EVENT_VALUE_CHANGED = 'advancedFilterBuilderValueChanged';
    public static readonly EVENT_VALID_CHANGED = 'advancedFilterBuilderValidChanged';
}
