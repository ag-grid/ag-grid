import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';

import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

export interface ICustomHeaderParams {
    menuIcon: string;
}

@Component({
    standalone: true,
    imports: [NgClass],
    template: `
        <div>
            @if (params.enableFilterButton) {
                <div #menuButton class="customHeaderMenuButton" (click)="onMenuClicked($event)">
                    <i class="fa {{ params.menuIcon }}"></i>
                </div>
            }
            <div class="customHeaderLabel">{{ params.displayName }}</div>
            @if (params.enableSorting) {
                <div (click)="onSortRequested('asc', $event)" [ngClass]="ascSort()" class="customSortDownLabel">
                    <i class="fa fa-long-arrow-alt-down"></i>
                </div>
                <div (click)="onSortRequested('desc', $event)" [ngClass]="descSort()" class="customSortUpLabel">
                    <i class="fa fa-long-arrow-alt-up"></i>
                </div>
                <div (click)="onSortRequested('', $event)" [ngClass]="noSort()" class="customSortRemoveLabel">
                    <i class="fa fa-times"></i>
                </div>
            }
        </div>
    `,
    styles: [
        `
            .customHeaderMenuButton,
            .customHeaderLabel,
            .customSortDownLabel,
            .customSortUpLabel,
            .customSortRemoveLabel {
                float: left;
                margin: 0 0 0 3px;
            }

            .customSortUpLabel {
                margin: 0;
            }

            .customSortRemoveLabel {
                font-size: 11px;
            }

            .active {
                color: cornflowerblue;
            }
        `,
    ],
})
export class CustomHeader implements IHeaderAngularComp {
    public params!: IHeaderParams & ICustomHeaderParams;

    public ascSort = signal('inactive');
    public descSort = signal('inactive');
    public noSort = signal('inactive');

    @ViewChild('menuButton', { read: ElementRef }) public menuButton!: ElementRef;

    agInit(params: IHeaderParams & ICustomHeaderParams): void {
        this.params = params;

        params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));

        this.onSortChanged();
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    }

    onSortChanged() {
        this.ascSort.set('inactive');
        this.descSort.set('inactive');
        this.noSort.set('inactive');
        const sort = this.params.column.getSortDef()?.direction;
        if (sort === 'asc') {
            this.ascSort.set('active');
        } else if (sort === 'desc') {
            this.descSort.set('active');
        } else {
            this.noSort.set('active');
        }
    }

    onSortRequested(order: 'asc' | 'desc' | null, event: any) {
        this.params.setSort(order, event.shiftKey);
    }

    refresh(params: IHeaderParams) {
        return false;
    }
}
