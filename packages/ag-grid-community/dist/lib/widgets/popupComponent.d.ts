// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";
export declare class PopupComponent extends Component implements IPopupComponent<any> {
    isPopup(): boolean;
    setParentComponent(container: Component): void;
    destroy(): void;
}
