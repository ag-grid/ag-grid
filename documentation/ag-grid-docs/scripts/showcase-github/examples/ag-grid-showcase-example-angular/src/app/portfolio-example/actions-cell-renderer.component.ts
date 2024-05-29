import { Component } from '@angular/core';

import { type ICellRendererAngularComp } from 'ag-grid-angular';
import { type ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'actions-cell-renderer',
    standalone: true,
    imports: [],
    template: `
        <button class="button-secondary advice">
            <img [src]="imgSrc" class="adviceIcon" alt="Documentation icon" />
        </button>
    `,
    styles: `
        .advice {
            height: 32px;
            display: flex !important;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #686868;
            margin-top: 4px;
        }

        .adviceIcon {
            height: 16px;
            width: 16px;
            opacity: 0.6;
        }
    `,
})
export class ActionsCellRenderer implements ICellRendererAngularComp {
    public value!: string;
    public imgSrc: string = '/example/finance/icons/documentation.svg';

    agInit(params: ICellRendererParams): void {
        this.value = params.value;
    }

    // Return Cell Value
    refresh(params: ICellRendererParams): boolean {
        this.value = params.value;
        return true;
    }
}
