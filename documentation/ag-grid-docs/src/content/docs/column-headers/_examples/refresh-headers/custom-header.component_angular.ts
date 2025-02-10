import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal } from '@angular/core';

import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="display: flex">
            @if (enableFilterButton()) {
                <span #menuButton class="ag-icon ag-icon-menu" (click)="onMenuClicked($event)"></span>
            }
            <div style="flex-grow: 1;">
                <span>{{ displayName() }}</span>
            </div>
        </div>
    `,
})
export class CustomHeader implements IHeaderAngularComp {
    private params!: IHeaderParams;

    enableFilterButton = signal<boolean>(false);
    displayName = signal<string>('');

    @ViewChild('menuButton', { read: ElementRef }) public menuButton!: ElementRef;

    agInit(params: IHeaderParams): void {
        this.update(params);
        console.log('CustomHeader.agInit() -> ' + params.column.getId());
    }

    refresh(params: IHeaderParams): boolean {
        const refreshed = this.update(params);
        console.log('CustomHeader.refresh() -> ' + params.column.getId() + ' returning ' + refreshed);
        return refreshed;
    }

    private update(params: IHeaderParams): boolean {
        this.params = params;

        const res = this.enableFilterButton() === params.enableFilterButton;

        this.enableFilterButton.set(params.enableFilterButton);
        this.displayName.set(params.displayName);

        return res;
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    }
}
