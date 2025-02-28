import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

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
    private params!: ICellRendererParams;

    paddingLeft = signal<number>(0);
    isGroup = signal<boolean>(false);
    rotation = signal<string>('');
    value = signal<string>('');

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.paddingLeft.set(params.node.level * 15);
        this.isGroup.set(!!params.node.group);
        this.rotation.set(params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)');
        this.value.set(params.value);

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
        this.rotation.set(this.params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)');
    };
}
