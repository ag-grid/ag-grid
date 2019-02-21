import { PopupWindow } from "./popupWindow";
export declare class PopupMessageBox extends PopupWindow {
    private readonly title;
    private readonly message;
    constructor(title: string, message: string);
    protected postConstruct(): void;
}
