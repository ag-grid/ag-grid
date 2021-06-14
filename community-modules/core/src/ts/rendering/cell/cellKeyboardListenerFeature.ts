import { BeanStub } from "../../context/beanStub";
import { CellCtrl, ICellComp } from "./cellCtrl";
import { Beans } from "../beans";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { KeyCode } from "../../constants/keyCode";
import { RowCtrl } from "../row/rowCtrl";

export class CellKeyboardListenerFeature extends BeanStub {

    private readonly ctrl: CellCtrl;
    private readonly beans: Beans;
    private readonly column: Column;
    private readonly rowNode: RowNode;
    private readonly rowCtrl: RowCtrl | null;
    private readonly scope: any;

    private comp: ICellComp;

    constructor(ctrl: CellCtrl, beans: Beans, column: Column, rowNode: RowNode, scope: any, rowCtrl: RowCtrl | null) {
        super();
        this.ctrl = ctrl;
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
        this.scope = scope;
        this.rowCtrl = rowCtrl;
    }

    public setComp(comp: ICellComp): void {
        this.comp = comp;
    }

    public onKeyDown(event: KeyboardEvent): void {
        const key = event.which || event.keyCode;

        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.F2:
                this.onF2KeyDown();
                break;
            case KeyCode.ESCAPE:
                this.onEscapeKeyDown();
                break;
            case KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case KeyCode.BACKSPACE:
            case KeyCode.DELETE:
                this.onBackspaceOrDeleteKeyPressed(key);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    }

    private onNavigationKeyPressed(event: KeyboardEvent, key: number): void {
        if (this.ctrl.isEditing()) { return; }

        if (event.shiftKey && this.ctrl.temp_isRangeSelectionEnabled()) {
            this.onShiftRangeSelect(key);
        } else {
            this.beans.navigationService.navigateToNextCell(event, key, this.ctrl.getCellPosition(), true);
        }

        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private onShiftRangeSelect(key: number): void {
        if (!this.beans.rangeService) { return; }

        const endCell = this.beans.rangeService.extendLatestRangeInDirection(key);

        if (endCell) {
            this.beans.navigationService.ensureCellVisible(endCell);
        }
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        this.beans.navigationService.onTabKeyDown(this.ctrl, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: number): void {
        if (!this.ctrl.isEditing()) {
            this.comp.startRowOrCellEdit(key);
        }
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        if (this.ctrl.isEditing() || this.rowCtrl!.isEditing()) {
            this.comp.stopEditingAndFocus();
        } else {
            if (this.beans.gridOptionsWrapper.isEnterMovesDown()) {
                this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.ctrl.getCellPosition(), false);
            } else {
                this.comp.startRowOrCellEdit(KeyCode.ENTER);
                if (this.ctrl.isEditing()) {
                    // if we started editing, then we need to prevent default, otherwise the Enter action can get
                    // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                    // preventing default results in a 'new line' character getting inserted in the text area
                    // when the editing was started
                    e.preventDefault();
                }
            }
        }
    }

    private onF2KeyDown(): void {
        if (!this.comp.isEditing()) {
            this.comp.startRowOrCellEdit(KeyCode.F2);
        }
    }

    private onEscapeKeyDown(): void {
        if (this.comp.isEditing()) {
            this.comp.stopRowOrCellEdit(true);
            this.ctrl.focusCell(true);
        }
    }

    public destroy(): void {
    }

}