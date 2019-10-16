import { TextCellEditor } from "./textCellEditor";

export class PopupTextCellEditor extends TextCellEditor {

    public isPopup(): boolean {
        return true;
    }

}
