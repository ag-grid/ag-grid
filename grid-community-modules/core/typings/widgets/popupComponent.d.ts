import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";
export declare class PopupComponent extends Component implements IPopupComponent<any> {
    isPopup(): boolean;
    setParentComponent(container: Component): void;
    destroy(): void;
}
