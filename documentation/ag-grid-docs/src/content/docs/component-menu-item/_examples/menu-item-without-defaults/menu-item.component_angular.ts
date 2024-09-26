import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IMenuItemAngularComp } from 'ag-grid-angular';
import type { Column, IFilterComp, IMenuItemParams } from 'ag-grid-community';

export interface CustomMenuItemParams extends IMenuItemParams {
    column: Column;
}

@Component({
    standalone: true,
    imports: [FormsModule, NgClass, NgStyle],
    template: `
        <div>
            <div
                #option
                tabindex="-1"
                class="ag-menu-option"
                [ngClass]="{ 'ag-menu-option-active': active }"
                (mouseenter)="onMouseEnter()"
                (mouseleave)="onMouseLeave()"
                (click)="onClick()"
                (keydown)="onOptionKeyDown($event)"
            >
                <span class="ag-menu-option-part ag-menu-option-icon" role="presentation">
                    <span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>
                </span>
                <span class="ag-menu-option-part ag-menu-option-text">Filter</span>
                <span class="ag-menu-option-part ag-menu-option-popup-pointer">
                    <span
                        class="ag-icon"
                        [ngClass]="{ 'ag-icon-tree-closed': !expanded, 'ag-icon-tree-open': expanded }"
                        unselectable="on"
                        role="presentation"
                    ></span>
                </span>
            </div>
            <div
                #filterWrapper
                [ngStyle]="{ display: expanded ? 'block' : 'none' }"
                (keydown)="onFilterWrapperKeyDown($event)"
            ></div>
        </div>
    `,
})
export class MenuItem implements IMenuItemAngularComp {
    @ViewChild('option', { read: ElementRef }) private option!: ElementRef;
    @ViewChild('filterWrapper', { read: ElementRef }) private filterWrapper!: ElementRef;

    params!: CustomMenuItemParams;
    expanded: boolean = false;
    active: boolean = false;

    agInit(params: CustomMenuItemParams): void {
        this.params = params;
        params.api.getColumnFilterInstance<IFilterComp>(params.column).then((filter) => {
            this.filterWrapper.nativeElement.appendChild(filter!.getGui());
        });
    }

    setActive(active: boolean): void {
        this.active = active;
        if (active) {
            this.option.nativeElement.focus();
        }
    }

    onMouseEnter(): void {
        this.setActive(true);
        this.params.onItemActivated();
    }

    onMouseLeave(): void {
        this.setActive(false);
    }

    onClick(): void {
        this.expanded = !this.expanded;
    }

    onOptionKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.onClick();
        }
    }

    onFilterWrapperKeyDown(e: KeyboardEvent): void {
        // stop the menu from handling keyboard navigation inside the filter
        e.stopPropagation();
    }
}
