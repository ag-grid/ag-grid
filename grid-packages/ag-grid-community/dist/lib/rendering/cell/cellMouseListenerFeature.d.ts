import { Column } from "../../entities/column";
import { Beans } from "../beans";
import { CellCtrl } from "./cellCtrl";
export declare class CellMouseListenerFeature extends Beans {
    private readonly cellCtrl;
    private readonly beans;
    private readonly column;
    private lastIPadMouseClickEvent;
    constructor(ctrl: CellCtrl, beans: Beans, column: Column);
    onMouseEvent(eventName: string, mouseEvent: MouseEvent): void;
    private onCellClicked;
    private isDoubleClickOnIPad;
    private onCellDoubleClicked;
    private onMouseDown;
    private isRightClickInExistingRange;
    private containsWidget;
    private onMouseOut;
    private onMouseOver;
    private mouseStayingInsideCell;
    destroy(): void;
}
