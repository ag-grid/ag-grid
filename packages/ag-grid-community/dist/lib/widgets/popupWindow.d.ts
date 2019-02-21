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
