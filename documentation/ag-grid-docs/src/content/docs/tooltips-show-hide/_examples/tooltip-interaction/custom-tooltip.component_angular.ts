import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ITooltipAngularComp } from 'ag-grid-angular';
import type { ITooltipParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
    template: ` <div class="custom-tooltip">
        <div [ngClass]="'panel panel-' + type()">
            <div class="panel-heading">
                <h3 class="panel-title">{{ data()?.country }}</h3>
            </div>
            <form class="panel-body" (submit)="onFormSubmit($event)">
                <div class="form-group">
                    <input
                        type="text"
                        class="form-control"
                        id="name"
                        placeholder="Name"
                        autocomplete="off"
                        value="{{ data()?.athlete }}"
                        (focus)="$event.target.select()"
                    />
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
                <p>Total: {{ data()?.total }}</p>
            </form>
        </div>
    </div>`,
    styles: [
        `
            .custom-tooltip p {
                margin: 5px;
                white-space: nowrap;
            }

            .custom-tooltip p:first-of-type {
                font-weight: bold;
            }
        `,
    ],
})
export class CustomTooltip implements ITooltipAngularComp {
    private params!: { type: string } & ITooltipParams;

    data = signal<any>(undefined);
    type = signal<string>('primary');

    agInit(params: { type: string } & ITooltipParams): void {
        this.params = params;

        this.data.set(params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data);
        this.type.set(this.params.type || 'primary');
    }

    onFormSubmit(e: Event) {
        e.preventDefault();

        const { node } = this.params;

        const input = (e.target as HTMLElement).querySelector('input') as HTMLInputElement;

        if (input.value) {
            node?.setDataValue('athlete' as any, input.value);

            this.params.hideTooltipCallback?.();
        }
    }
}
