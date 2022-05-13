import { BeanStub } from "../../context/beanStub";
import { CellCtrl } from "./cellCtrl";
import { Beans } from "../beans";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { RowCtrl } from "../row/rowCtrl";
export declare class CellKeyboardListenerFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly beans;
    private readonly rowNode;
    private readonly rowCtrl;
    private eGui;
    constructor(ctrl: CellCtrl, beans: Beans, column: Column, rowNode: RowNode, rowCtrl: RowCtrl);
    setComp(eGui: HTMLElement): void;
    onKeyDown(event: KeyboardEvent): void;
    private onNavigationKeyPressed;
    private onShiftRangeSelect;
    private onTabKeyDown;
    private onBackspaceOrDeleteKeyPressed;
    private onEnterKeyDown;
    private onF2KeyDown;
    private onEscapeKeyDown;
    onKeyPress(event: KeyboardEvent): void;
    private onSpaceKeyPressed;
    destroy(): void;
}
