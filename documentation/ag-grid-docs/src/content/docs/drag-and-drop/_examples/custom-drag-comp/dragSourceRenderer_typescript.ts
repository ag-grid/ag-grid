import type { ICellRendererComp, ICellRendererParams, IRowNode } from 'ag-grid-community';

export class DragSourceRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    rowNode!: IRowNode;
    onDragStartListener: any;

    init(params: ICellRendererParams) {
        const eTemp = document.createElement('div');
        eTemp.innerHTML = '<div draggable="true">Drag Me!</div>';

        this.eGui = eTemp.firstChild as HTMLElement;
        this.rowNode = params.node;

        this.onDragStartListener = this.onDragStart.bind(this);
        this.eGui.addEventListener('dragstart', this.onDragStartListener);
    }

    onDragStart(dragEvent: any) {
        dragEvent.dataTransfer.setData('text/plain', 'Dragged item with ID: ' + this.rowNode.data.id);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    destroy() {
        this.eGui.removeEventListener('dragstart', this.onDragStartListener);
    }
}
