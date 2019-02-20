// ag-grid-enterprise v20.1.0
import { Component } from 'ag-grid-community';
export declare class NameValueComp extends Component {
    private key;
    private defaultValue;
    private gridOptionsWrapper;
    private context;
    private static TEMPLATE;
    private props;
    private eLabel;
    private eValue;
    constructor(key: string, defaultValue: string);
    protected postConstruct(): void;
    setValue(value: any): void;
}
