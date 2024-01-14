// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    private onNavigationKeyDown;
    private onShiftRangeSelect;
    private onTabKeyDown;
    private onBackspaceOrDeleteKeyDown;
    private onEnterKeyDown;
    private onF2KeyDown;
    private onEscapeKeyDown;
    processCharacter(event: KeyboardEvent): void;
    private onSpaceKeyDown;
    destroy(): void;
}
