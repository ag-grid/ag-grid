import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { IHeaderGroupAngularComp } from 'ag-grid-angular';
import { IHeaderGroupParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [NgClass],
    template: `
        <div class="ag-header-group-cell-label">
            <div #label class="customHeaderLabel">{{ params.displayName }}</div>
            <div class="customExpandButton" [ngClass]="expandState" (click)="expandOrCollapse()">
                <i class="fa fa-arrow-right"></i>
            </div>
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }

            .customExpandButton {
                float: right;
                margin-top: 2px;
                margin-left: 3px;
            }

            .expanded {
                animation-name: toExpanded;
                animation-duration: 1s;
                -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
                transform: rotate(180deg);
            }

            .fa-arrow-right {
                color: cornflowerblue;
            }

            .collapsed {
                animation-name: toCollapsed;
                animation-duration: 1s;
                -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
                transform: rotate(0deg);
            }

            .ag-header-group-cell-label {
                display: flex;
                gap: 0.25rem;
                overflow: hidden;
            }

            .customHeaderLabel {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .customHeaderMenuButton,
            .customHeaderLabel,
            .customSortDownLabel,
            .customSortUpLabel,
            .customSortRemoveLabel {
                margin-top: 2px;
                float: left;
            }

            .customSortDownLabel {
                margin-left: 10px;
            }

            .customSortUpLabel {
                margin-left: 1px;
            }

            .customSortRemoveLabel {
                float: left;
                font-size: 11px;
            }

            @keyframes toExpanded {
                from {
                    -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
                    transform: rotate(0deg);
                }
                to {
                    -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
                    transform: rotate(180deg);
                }
            }

            @keyframes toCollapsed {
                from {
                    -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
                    transform: rotate(180deg);
                }
                to {
                    -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
                    transform: rotate(0deg);
                }
            }
        `,
    ],
})
export class CustomHeaderGroup implements IHeaderGroupAngularComp {
    public params!: IHeaderGroupParams;
    public expandState!: string;

    @ViewChild('label', { read: ElementRef }) public label!: ElementRef;

    agInit(params: IHeaderGroupParams): void {
        this.params = params;

        this.params.columnGroup
            .getProvidedColumnGroup()
            .addEventListener('expandedChanged', this.syncExpandButtons.bind(this));
        this.params.setTooltip(
            params.displayName,
            () => this.label.nativeElement.scrollWidth > this.label.nativeElement.clientWidth
        );

        this.syncExpandButtons();
    }

    expandOrCollapse() {
        const currentState = this.params.columnGroup.getProvidedColumnGroup().isExpanded();
        this.params.setExpanded(!currentState);
    }

    syncExpandButtons() {
        if (this.params.columnGroup.getProvidedColumnGroup().isExpanded()) {
            this.expandState = 'expanded';
        } else {
            this.expandState = 'collapsed';
        }
    }
}
