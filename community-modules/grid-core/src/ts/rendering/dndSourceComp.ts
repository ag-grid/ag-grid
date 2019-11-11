import { Component } from "../widgets/component";
import { PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { Beans } from "./beans";
import { Column } from "../entities/column";
import { _ } from "../utils";

export class DndSourceComp extends Component {

    private readonly beans: Beans;

    private readonly rowNode: RowNode;
    private readonly column: Column;
    private readonly cellValue: string;
    private readonly eCell: HTMLElement;

    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans, eCell: HTMLElement) {
        super(`<div class="ag-row-drag" draggable="true"></div>`);
        this.rowNode = rowNode;
        this.column = column;
        this.cellValue = cellValue;
        this.beans = beans;
        this.eCell = eCell;
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

    private onDragStart(dragEvent: DragEvent): void {

        const providedOnRowDrag = this.column.getColDef().dndSourceOnRowDrag;
        const isIE = _.isBrowserIE();

        if (!isIE) {
            dragEvent.dataTransfer.setDragImage(this.eCell, 0, 0);
        }

        // default behaviour is to convert data to json and set into drag component
        const defaultOnRowDrag = () => {
            try {
                const jsonData = JSON.stringify(this.rowNode.data);

                if (isIE) {
                    dragEvent.dataTransfer.setData('text', jsonData);
                } else {
                    dragEvent.dataTransfer.setData('application/json', jsonData);
                    dragEvent.dataTransfer.setData('text/plain', jsonData);
                }

            } catch (e) {
                // if we cannot convert the data to json, then we do not set the type
            }
        };

        if (providedOnRowDrag) {
            providedOnRowDrag({rowNode: this.rowNode, dragEvent: dragEvent});
        } else {
            defaultOnRowDrag();
        }
    }

    private checkVisibility(): void {
        const visible = this.column.isDndSource(this.rowNode);
        this.setDisplayed(visible);
    }
}
