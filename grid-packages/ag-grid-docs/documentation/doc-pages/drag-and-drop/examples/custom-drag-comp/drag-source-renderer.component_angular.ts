import {Component} from "@angular/core";

@Component({
    selector: 'child-cell',
    template: `
        <div draggable="true" (dragstart)="onDragStart($event)">Drag Me!</div>`
})
export class DragSourceRenderer {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }


    onDragStart(dragEvent: DragEvent) {
        var userAgent = window.navigator.userAgent;
        dragEvent.dataTransfer.setData('text/plain', 'Dragged item with ID: ' + this.params.node.data.id);
    }
}
