import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'app-loading-overlay',
    template: `
        <div style="display: flex">
            <span *ngIf="params.enableMenu" #menuButton class="ag-icon ag-icon-menu"
                  (click)="onMenuClicked($event)"></span>
            <div style="flex-grow: 1;"><span ref="eText">{{params.displayName}}</span></div>
        </div>
    `
})
export class CustomHeader {

    private params: any;

    @ViewChild('menuButton', {read: ElementRef}) public menuButton;

    agInit(params): void {
        this.params = params;
        console.log('CustomHeader.init() -> ' + this.params.column.getId());
    }

    refresh(params): boolean {
        this.params = params;
        console.log('CustomHeader.refresh() -> ' + this.params.column.getId() + ' returning ' + true);
        return true;
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    };
}
