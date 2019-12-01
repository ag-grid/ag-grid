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
