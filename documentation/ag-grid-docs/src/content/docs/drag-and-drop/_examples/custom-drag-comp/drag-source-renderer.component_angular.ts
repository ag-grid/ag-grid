import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <div draggable="true" (dragstart)="onDragStart($event)">Drag Me!</div>`,
})
export class DragSourceRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    onDragStart(dragEvent: DragEvent) {
        dragEvent.dataTransfer!.setData('text/plain', 'Dragged item with ID: ' + this.params.node.data.id);
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
