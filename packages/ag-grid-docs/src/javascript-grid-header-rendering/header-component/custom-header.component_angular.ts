import {Component, ViewChild, ElementRef} from '@angular/core';
import {ILoadingOverlayComponentAngularComp} from "ag-grid-angular";

@Component({
    selector: 'app-loading-overlay',
    template: `
        <div>
            <div *ngIf="params.enableMenu" #menuButton class="customHeaderMenuButton" (click)="onMenuClicked($event)"><i class="fa {{params.menuIcon}}"></i></div> 
            <div class="customHeaderLabel">{{params.displayName}}</div> 
            <div *ngIf="params.enableSorting" (click)="onSortRequested('asc', $event)" [ngClass]="ascSort" class="customSortDownLabel"><i class="fa fa-long-arrow-alt-down"></i></div> 
            <div *ngIf="params.enableSorting" (click)="onSortRequested('desc', $event)" [ngClass]="descSort" class="customSortUpLabel"><i class="fa fa-long-arrow-alt-up"></i></div> 
            <div *ngIf="params.enableSorting" (click)="onSortRequested('', $event)" [ngClass]="noSort" class="customSortRemoveLabel"><i class="fa fa-times"></i></div>
        </div>
    `,
    styles: [
        `
        .customHeaderMenuButton, 
        .customHeaderLabel, 
        .customSortDownLabel, 
        .customSortUpLabel, 
        .customSortRemoveLabel 
        {
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
export class CustomHeader {
    private params: any;

    private ascSort: string;
    private descSort: string;
    private noSort: string;

    @ViewChild('menuButton', {read: ElementRef}) public menuButton;

    agInit(params): void {
        this.params = params;

        params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    };

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

    onSortRequested(order, event) {
        this.params.setSort(order, event.shiftKey);
    }
}
