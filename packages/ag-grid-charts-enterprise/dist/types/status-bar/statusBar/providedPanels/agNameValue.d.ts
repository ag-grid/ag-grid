import type { ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class AgNameValue extends Component {
    private readonly eLabel;
    private readonly eValue;
    constructor();
    setLabel(key: string, defaultValue: string): void;
    setValue(value: any): void;
}
export declare const AgNameValueSelector: ComponentSelector;
