import {Component, ViewChild, ElementRef} from '@angular/core';
import {ILoadingOverlayComponentAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'app-loading-overlay',
    template: `
        <div style="display: flex">
            <span *ngIf="params.enableMenu" #menuButton class="ag-icon ag-icon-menu" (click)="onMenuClicked($event)"></span>
            <div style="flex-grow: 1;"><span ref="eText">{{params.displayName}}</span></div>
        </div>
    `
})
export class CustomHeader {

    private params: any;

    @ViewChild('menuButton', {read: ElementRef}) public menuButton;

    agInit(params): void {
        this.params = params;
    }

    refresh(params): boolean {
        this.params = params;
        return true;
    }

    onMenuClicked() {
        this.params.showColumnMenu(this.menuButton.nativeElement);
    };
}
