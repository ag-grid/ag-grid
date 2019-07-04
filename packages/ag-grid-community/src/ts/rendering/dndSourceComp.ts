import {Component} from "../widgets/component";
import {PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {Beans} from "./beans";
import {Column} from "../entities/column";
import {_} from "../utils";

export class DndSourceComp extends Component {

    private readonly beans: Beans;

    private readonly rowNode: RowNode;
    private readonly column: Column;
    private readonly cellValue: string;

    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans) {
        super(`<div class="ag-row-drag" draggable="true"></div>`);
        this.rowNode = rowNode;
        this.column = column;
        this.cellValue = cellValue;
        this.beans = beans;
    }

    @PostConstruct
    private postConstruct(): void {
        const eGui = this.getGui();
        eGui.appendChild(_.createIconNoSpan('rowDrag', this.beans.gridOptionsWrapper, null));
        this.addDragSource();
        this.checkVisibility();
    }

    private addDragSource(): void {
        this.addGuiEventListener('dragstart', this.onDragStart.bind(this));
    }

    private onDragStart(e: DragEvent): void {
        try {
            const jsonData = JSON.stringify(this.rowNode.data);
            e.dataTransfer.setData('application/json', jsonData);
            e.dataTransfer.setData('text/plain', jsonData);
        } catch (e) {
            // if we cannot convert the data to json, then we do not set the type
        }
    }

    private checkVisibility(): void {
        const visible = this.column.isDndSource(this.rowNode);
        this.setVisible(visible, null);
    }
}
