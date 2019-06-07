// Type definitions for ag-grid-community v21.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Dialog, DialogOptions } from "./dialog";
interface MessageBoxConfig extends DialogOptions {
    message?: string;
}
export declare class MessageBox extends Dialog {
    private message;
    constructor(config: MessageBoxConfig);
    protected postConstruct(): void;
}
export {};
