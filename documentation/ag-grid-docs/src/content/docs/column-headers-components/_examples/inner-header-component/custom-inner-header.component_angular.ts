import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IInnerHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

export interface ICustomInnerHeaderParams {
    icon: string;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,

    template: `
        <div class="customInnerHeader">
            @if (icon()) {
                <i class="fa {{ icon() }}"></i>
            }
            <span>{{ displayName() }}</span>
        </div>
    `,
    styles: [
        `
            .customInnerHeader {
                display: flex;
                gap: 0.25rem;
                align-items: center;
            }

            .customInnerHeader span {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .fa {
                color: cornflowerblue;
            }
        `,
    ],
})
export class CustomInnerHeader implements IInnerHeaderAngularComp {
    icon = signal('');
    displayName = signal('');

    agInit(params: IHeaderParams & ICustomInnerHeaderParams): void {
        this.icon.set(params.icon);
        this.displayName.set(params.displayName);
    }

    refresh(params: IHeaderParams): boolean {
        return false;
    }
}
