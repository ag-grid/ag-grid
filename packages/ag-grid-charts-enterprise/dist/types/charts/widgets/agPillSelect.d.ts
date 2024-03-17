import { Component } from "ag-grid-community";
export interface AgPillSelectParams<TValue = string | null> {
    valueList?: TValue[];
    selectedValueList?: TValue[];
    valueFormatter?: (value: TValue) => string;
    ariaLabel?: string;
    selectPlaceholder?: string;
    onValuesChange?: (params: AgPillSelectChangeParams<TValue>) => void;
    dragSourceId?: string;
    maxSelection?: number;
}
export interface AgPillSelectChangeParams<TValue> {
    added: TValue[];
    removed: TValue[];
    updated: TValue[];
    selected: TValue[];
}
export declare class AgPillSelect<TValue = string | null> extends Component {
    private static TEMPLATE;
    private dropZonePanel;
    private eSelect?;
    private readonly config;
    private valueList;
    private selectedValues;
    private valueFormatter;
    private onValuesChange?;
    constructor(config?: AgPillSelectParams<TValue>);
    private init;
    setValues(valueList: TValue[], selectedValues: TValue[]): this;
    setValueFormatter(valueFormatter: (value: TValue) => string): this;
    private initSelect;
    private createSelectOptions;
    private addValue;
    private updateValues;
    private getChanges;
    private refreshSelect;
    protected destroy(): void;
}
