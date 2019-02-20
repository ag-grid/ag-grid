// Type definitions for ag-grid-community v20.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
import { Context } from "../context/context";
export declare class PopupWindow extends Component {
    private static TEMPLATE;
    static DESTROY_EVENT: string;
    protected context: Context;
    private popupService;
    private eContentWrapper;
    private eTitle;
    protected closePopup: () => void;
    constructor();
    protected postConstruct(): void;
    setBody(eBody: HTMLElement): void;
    setTitle(title: string): void;
    private onBtClose;
    destroy(): void;
}
