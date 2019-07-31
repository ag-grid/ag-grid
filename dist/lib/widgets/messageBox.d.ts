// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgDialog, DialogOptions } from "./agDialog";
interface MessageBoxConfig extends DialogOptions {
    message?: string;
}
export declare class MessageBox extends AgDialog {
    private message;
    constructor(config: MessageBoxConfig);
    postConstruct(): void;
}
export {};
