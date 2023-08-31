import { AdvancedFilterModel, AgEvent, BaseCellDataType, JoinAdvancedFilterModel } from "@ag-grid-community/core";

interface AdvancedFilterBuilderItemEvent extends AgEvent {
    item: AdvancedFilterBuilderItem;
}

export interface AdvancedFilterBuilderAddEvent extends AdvancedFilterBuilderItemEvent {
    isJoin: boolean;
}

export interface AdvancedFilterBuilderMoveEvent extends AdvancedFilterBuilderItemEvent {
    backwards: boolean;
}

export interface AdvancedFilterBuilderRemoveEvent extends AdvancedFilterBuilderItemEvent { }

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
    baseCellDataType: BaseCellDataType,
}

interface CreateSelectPillParams extends BaseCreatePillParams {
    isSelect: true;
    getEditorParams: () => { values?: any[] },
}

interface BaseCreatePillParams {
    key: string,
    displayValue: string,
    cssClass: string,
    update: (key: string) => void
}

export class AdvancedFilterBuilderEvents {
    public static readonly ADD_EVENT = 'advancedFilterBuilderAddEvent';
    public static readonly MOVE_EVENT = 'advancedFilterBuilderMoveEvent';
    public static readonly REMOVE_EVENT = 'advancedFilterBuilderRemoveEvent';
    public static readonly VALUE_CHANGED_EVENT = 'advancedFilterBuilderValueChangedEvent';
    public static readonly VALID_CHANGED_EVENT = 'advancedFilterBuilderValidChangedEvent';
}
