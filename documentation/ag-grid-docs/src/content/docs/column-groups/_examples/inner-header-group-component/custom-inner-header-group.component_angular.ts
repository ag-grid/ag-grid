import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IInnerHeaderGroupAngularComp } from 'ag-grid-angular';
import type { IHeaderGroupParams } from 'ag-grid-community';

export interface ICustomInnerHeaderGroupParams {
    icon: string;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="customInnerHeaderGroup">
            @if (icon()) {
                <i class="fa {{ icon() }}"></i>
            }
            <span>{{ displayName() }}</span>
        </div>
    `,
    styles: [
        `
            .customInnerHeaderGroup {
                display: flex;
                gap: 0.25rem;
                align-items: center;
            }

            .customInnerHeaderGroup span {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .fa {
                color: cornflowerblue;
            }
        `,
    ],
})
export class CustomInnerHeaderGroup implements IInnerHeaderGroupAngularComp {
    icon = signal('');
    displayName = signal('');

    agInit(params: IHeaderGroupParams & ICustomInnerHeaderGroupParams): void {
        this.icon.set(params.icon);
        this.displayName.set(params.displayName);
    }

    refresh(params: IHeaderGroupParams & ICustomInnerHeaderGroupParams): boolean {
        return false;
    }
}
