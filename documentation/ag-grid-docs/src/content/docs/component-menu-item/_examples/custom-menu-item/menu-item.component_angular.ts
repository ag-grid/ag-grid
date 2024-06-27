import { IMenuItemAngularComp } from '@ag-grid-community/angular';
import { IMenuConfigParams, IMenuItemParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CustomMenuItemParams extends IMenuItemParams {
    buttonValue: string;
}

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div>
            <span class="ag-menu-option-part ag-menu-option-icon" role="presentation"></span>
            <span class="ag-menu-option-part ag-menu-option-text">{{ name }}</span>
            <span class="ag-menu-option-part ag-menu-option-shortcut"
                ><button (click)="onClick()">{{ buttonValue }}</button></span
            >
            <span class="ag-menu-option-part ag-menu-option-popup-pointer">
                @if (showSubMenu) {
                    <span class="ag-icon ag-icon-small-right" unselectable="on" role="presentation"></span>
                }
            </span>
        </div>
    `,
})
export class MenuItem implements IMenuItemAngularComp {
    params!: CustomMenuItemParams;
    name!: string;
    showSubMenu!: boolean;
    buttonValue!: string;

    agInit(params: CustomMenuItemParams): void {
        this.params = params;
        this.name = params.name;
        this.showSubMenu = !!params.subMenu;
        this.buttonValue = params.buttonValue;
    }

    configureDefaults(): boolean | IMenuConfigParams {
        return true;
    }

    onClick(): void {
        alert(`${this.name} clicked`);
    }
}
