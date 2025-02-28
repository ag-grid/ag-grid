import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams, IRowNode } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [style.paddingLeft.px]="paddingLeft()">
            @if (isGroup()) {
                <div
                    [style.transform]="rotation()"
                    [style.cursor]="'pointer'"
                    [style.display]="'inline-block'"
                    (click)="onClick()"
                >
                    &rarr;
                </div>
            }
            &nbsp;
            {{ value() }}
        </div>
    `,
})
export class CustomGroupCellRenderer implements ICellRendererAngularComp {
    private node!: IRowNode;

    value = signal<string>('');
    paddingLeft = signal(0);
    isGroup = signal(false);
    rotation = signal('');

    agInit(params: ICellRendererParams): void {
        this.value.set(params.value);
        this.node = params.node;
        this.paddingLeft.set(this.node.level * 15);
        this.isGroup.set(!!this.node.group);
        this.rotation.set(this.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)');

        this.node.addEventListener('expandedChanged', this.onExpand);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }

    destroy() {
        this.node.removeEventListener('expandedChanged', this.onExpand);
    }

    onClick() {
        this.node.setExpanded(!this.node.expanded);
    }

    onExpand = () => {
        this.rotation.set(this.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)');
    };
}
