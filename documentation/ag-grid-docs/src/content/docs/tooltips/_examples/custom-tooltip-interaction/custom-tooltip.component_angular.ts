import { ITooltipAngularComp } from '@ag-grid-community/angular';
import { ITooltipParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    imports: [NgClass],
    template: ` <div class="custom-tooltip">
        <div [ngClass]="'panel panel-' + type">
            <div class="panel-heading">
                <h3 class="panel-title">{{ data.country }}</h3>
            </div>
            <form class="panel-body" (submit)="onFormSubmit($event)">
                <div class="form-group">
                    <input
                        type="text"
                        class="form-control"
                        id="name"
                        placeholder="Name"
                        autocomplete="off"
                        value="{{ data.athlete }}"
                        (focus)="$event.target.select()"
                    />
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
                <p>Total: {{ data.total }}</p>
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
    public data!: any;
    public type!: string;

    agInit(params: { type: string } & ITooltipParams): void {
        this.params = params;

        this.data = params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data;
        this.type = this.params.type || 'primary';
    }

    onFormSubmit(e: Event) {
        e.preventDefault();

        const { node } = this.params;

        const input = (e.target as HTMLElement).querySelector('input') as HTMLInputElement;

        if (input.value) {
            node?.setDataValue('athlete' as any, input.value);

            if (this.params.hideTooltipCallback) {
                this.params.hideTooltipCallback();
            }
        }
    }
}
