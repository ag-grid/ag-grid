import { Component } from '@angular/core';

import type { IBuiltInTooltipAngularComp } from 'ag-grid-angular';
import type { IBuiltInTooltipParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div class="control-tooltip">
            <span>{{ params.heading }}</span>
            <strong>{{ params.text }}</strong>
            <small>{{ params.location }} / {{ params.control }}</small>
        </div>
    `,
})
export class CustomBuiltInTooltip implements IBuiltInTooltipAngularComp {
    public params!: IBuiltInTooltipParams & { heading: string };

    public agInit(params: IBuiltInTooltipParams & { heading: string }): void {
        this.params = params;
    }
}
