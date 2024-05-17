import { IHeaderAngularComp } from '@ag-grid-community/angular';
import { IHeaderParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

export interface ICustomHeaderParams {
    menuIcon: string;
}

@Component({
    standalone: true,
    imports: [NgClass],
    template: `
        <div class="headerWrapper">
            @if (params.enableMenu) {
                <div #menuButton class="customHeaderMenuButton" (click)="onMenuClicked($event)">
                    <i class="fa {{ params.menuIcon }}"></i>
                </div>
            }
            <div #label class="customHeaderLabel">{{ params.displayName }}</div>
            @if (params.enableSorting) {
                <div (click)="onSortRequested('asc', $event)" [ngClass]="ascSort" class="customSortDownLabel">
                    <i class="fa fa-long-arrow-alt-down"></i>
                </div>
                <div (click)="onSortRequested('desc', $event)" [ngClass]="descSort" class="customSortUpLabel">
                    <i class="fa fa-long-arrow-alt-up"></i>
                </div>
                <div (click)="onSortRequested('', $event)" [ngClass]="noSort" class="customSortRemoveLabel">
                    <i class="fa fa-times"></i>
                </div>
            }
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }

            .headerWrapper {
                display: flex;
                overflow: hidden;
                gap: 0.25rem;
            }

            .customHeaderLabel {
                overflow: hidden;
                text-overflow: ellipsis;
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

    public ascSort = 'inactive';
    public descSort = 'inactive';
    public noSort = 'inactive';

    @ViewChild('menuButton', { read: ElementRef }) public menuButton!: ElementRef;
    @ViewChild('label', { read: ElementRef }) public label!: ElementRef;

    agInit(params: IHeaderParams & ICustomHeaderParams): void {
        this.params = params;

        params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.onSortChanged();
        params.setTooltip(
            params.displayName,
            () => this.label.nativeElement.scrollWidth > this.label.nativeElement.clientWidth
        );
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
