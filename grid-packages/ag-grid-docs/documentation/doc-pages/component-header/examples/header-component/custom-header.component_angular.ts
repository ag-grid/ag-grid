import { Component, ElementRef, ViewChild } from '@angular/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular'
import { IHeaderParams } from '@ag-grid-community/core'

export interface ICustomHeaderParams {
    menuIcon: string;
}

@Component({
    selector: 'app-custom-header',
    template: `
      <div>
      <div *ngIf="params.enableMenu" #menuButton class="customHeaderMenuButton" (click)="onMenuClicked($event)"><i class="fa {{params.menuIcon}}"></i>
      </div>
      <div class="customHeaderLabel">{{ params.displayName }}</div>
      <div *ngIf="params.enableSorting" (click)="onSortRequested('asc', $event)" [ngClass]="ascSort" class="customSortDownLabel"><i
          class="fa fa-long-arrow-alt-down"></i></div>
      <div *ngIf="params.enableSorting" (click)="onSortRequested('desc', $event)" [ngClass]="descSort" class="customSortUpLabel"><i
          class="fa fa-long-arrow-alt-up"></i></div>
      <div *ngIf="params.enableSorting" (click)="onSortRequested('', $event)" [ngClass]="noSort" class="customSortRemoveLabel"><i
          class="fa fa-times"></i></div>
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
        `
    ]
})
export class CustomHeader implements IHeaderAngularComp {
    public params!: IHeaderParams & ICustomHeaderParams;

    public ascSort = 'inactive';
    public descSort = 'inactive';
    public noSort = 'inactive';

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
        this.ascSort = this.descSort = this.noSort = 'inactive';
        if (this.params.column.isSortAscending()) {
            this.ascSort = 'active';
        } else if (this.params.column.isSortDescending()) {
            this.descSort = 'active';
        } else {
            this.noSort = 'active';
        }
    }

    onSortRequested(order: 'asc' | 'desc' | null, event: any) {
        this.params.setSort(order, event.shiftKey);
    }

    refresh(params: IHeaderParams) {
        return false;
    }
}
