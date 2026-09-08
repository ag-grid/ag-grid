import type {
    AdvancedFilterModel,
    AgColumn,
    AgEvent,
    BaseCellDataType,
    JoinAdvancedFilterModel,
    SetFilterModelValue,
} from 'ag-grid-community';

import type { SetValuesPillComp } from '../set/setValuesPillComp';
import type { InputPillComp } from './inputPillComp';
import type { SelectPillComp } from './selectPillComp';

interface AdvancedFilterBuilderItemEvent<T extends AdvancedFilterBuilderEvents> extends AgEvent<T> {
    item: AdvancedFilterBuilderItem;
}

export interface AdvancedFilterBuilderAddEvent extends AdvancedFilterBuilderItemEvent<'advancedFilterBuilderAdded'> {
    isJoin: boolean;
}

export interface AdvancedFilterBuilderMoveEvent extends AdvancedFilterBuilderItemEvent<'advancedFilterBuilderMoved'> {
    backwards: boolean;
}

export interface AdvancedFilterBuilderRemoveEvent extends AdvancedFilterBuilderItemEvent<'advancedFilterBuilderRemoved'> {}

export interface AdvancedFilterBuilderItem {
    filterModel: AdvancedFilterModel | null;
    level: number;
    parent?: JoinAdvancedFilterModel;
    valid: boolean;
    /** Why this condition cannot be applied, for the Apply button to report when the row is not mounted. */
    validationMessage?: string | null;
    showMove?: boolean;
}

export type CreatePillParams = CreateInputPillParams | CreateSelectPillParams | CreateSetPillParams;

/** What `createPill` returns, for the three wrappers that pass it around without knowing which it built. */
export type Pill = SelectPillComp | InputPillComp | SetValuesPillComp;

interface CreateSetPillParams extends BaseCreatePillParams<SetFilterModelValue> {
    isSelect: 'set';
    column: AgColumn;
    values: SetFilterModelValue;
}

interface CreateInputPillParams extends BaseCreatePillParams {
    isSelect: false;
    valueFormatter: (value: string) => string;
    /** Converts the stored value into the text the editor opens with. Defaults to the stored value. */
    editValueFormatter?: (value: string) => string;
    baseCellDataType: BaseCellDataType;
}

interface CreateSelectPillParams extends BaseCreatePillParams {
    isSelect: true;
    displayValue: string;
    getEditorParams: () => { values?: any[] };
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
}

interface BaseCreatePillParams<TValue = string> {
    key: string;
    cssClass: string;
    update: (value: TValue) => void;
    ariaLabel: string;
}

export type AdvancedFilterBuilderEvents =
    | 'advancedFilterBuilderAdded'
    | 'advancedFilterBuilderMoved'
    | 'advancedFilterBuilderRemoved'
    | 'advancedFilterBuilderValueChanged'
    | 'advancedFilterBuilderValidChanged';
