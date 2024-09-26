import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div [style.paddingLeft.px]="paddingLeft">
            @if (isGroup) {
                <div
                    [style.transform]="rotation"
                    [style.cursor]="'pointer'"
                    [style.display]="'inline-block'"
                    (click)="onClick()"
                >
                    &rarr;
                </div>
            }
            &nbsp;
            {{ params.value }}
        </div>
    `,
})
export class CustomGroupCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;
    public paddingLeft!: number;
    public isGroup!: boolean;
    public rotation!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.paddingLeft = params.node.level * 15;
        this.isGroup = !!params.node.group;
        this.rotation = params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)';

        this.params.node.addEventListener('expandedChanged', this.onExpand);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }

    destroy() {
        this.params.node.removeEventListener('expandedChanged', this.onExpand);
    }

    onClick() {
        this.params.node.setExpanded(!this.params.node.expanded);
    }

    onExpand = () => {
        this.rotation = this.params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)';
    };
}
