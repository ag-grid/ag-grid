import { Component } from "./component";
import { IPopupComponent } from "../interfaces/iPopupComponent";

export class PopupComponent extends Component implements IPopupComponent {
    isPopup() {
        return true;
    }
}