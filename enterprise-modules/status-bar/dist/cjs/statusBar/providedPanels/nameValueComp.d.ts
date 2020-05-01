import { Component, GridOptionsWrapper } from '@ag-grid-community/core';
export declare class NameValueComp extends Component {
    protected gridOptionsWrapper: GridOptionsWrapper;
    protected events: (() => void)[];
    private static TEMPLATE;
    private eLabel;
    private eValue;
    constructor();
    setLabel(key: string, defaultValue: string): void;
    setValue(value: any): void;
    destroy(): void;
}
