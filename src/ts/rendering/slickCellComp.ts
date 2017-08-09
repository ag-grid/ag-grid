import {Component} from "../widgets/component";
import {Beans} from "./beans";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {SlickRowComp} from "./slickRowComp";
import {_} from "../utils";
import {SetLeftFeature} from "./features/setLeftFeature";

export class SlickCellComp extends Component {

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private slickRowComp: SlickRowComp;
    private eParentRow: HTMLElement;
    private active = true;

    constructor(beans: Beans, column: Column, rowNode: RowNode, slickRowComp: SlickRowComp) {
        super();
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
        this.slickRowComp = slickRowComp;

        this.addDestroyableEventListener(column, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.addDestroyableEventListener(column, Column.EVENT_WIDTH_CHANGED, this.onWidthChanged.bind(this));
    }

    public getParentRow(): HTMLElement {
        return this.eParentRow;
    }

    public setParentRow(eParentRow: HTMLElement): void {
        this.eParentRow = eParentRow;
    }

    public getColumn(): Column {
        return this.column;
    }

    // lazy load the reference to the UI from the row. doing a lazy load ensures quicker row
    // redraw, we only look up this reference if / when we need it.
    private ensureGuiExists(): void {
        if (_.exists(super.getGui())) { return; }
        let eGui = this.slickRowComp.getElementForCell(this.column);
        this.setGui(eGui);
    }

    public getGui(): HTMLElement {
        this.ensureGuiExists();
        return super.getGui();
    }

    public detach(): void {
        this.eParentRow.removeChild(this.getGui());
    }

    public destroy(): void {
        this.active = false;
    }

    private onLeftChanged(): void {
        this.ensureGuiExists();
        let left = this.column.getLeft();
        this.getGui().style.left = left + 'px';
    }

    private onWidthChanged(): void {
        this.ensureGuiExists();
        let width = this.column.getActualWidth();
        this.getGui().style.width = width + 'px';
    }
}
