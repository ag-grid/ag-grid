import {Component, ElementRef, ViewChild} from '@angular/core';
import {ILoadingOverlayComponentAngularComp} from "ag-grid-angular";

@Component({
    selector: 'app-loading-overlay',
    template: `
        <div class="ag-header-group-cell-label">
            <div class="customHeaderLabel">{{this.params.displayName}}</div>
            <div class="customExpandButton" [ngClass]="this.expandState" (click)="expandOrCollapse()"><i class="fa fa-arrow-right"></i></div>
        </div>
    `,
    styles: [
        `
        .customExpandButton{
            float:right;
            margin-top: 5px;
            margin-left: 3px;
        }

        .expanded {
            animation-name: toExpanded;
            animation-duration: 1s;
            -ms-transform: rotate(180deg); /* IE 9 */
            -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
            transform: rotate(180deg);
        }

        .collapsed {
            color: cornflowerblue;
            animation-name: toCollapsed;
            animation-duration: 1s;
            -ms-transform: rotate(0deg); /* IE 9 */
            -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
            transform: rotate(0deg);
        }

        .customHeaderMenuButton{
            margin-top: 5px;
            margin-left: 4px;
            float: left;
        }

        .customHeaderLabel{
            margin-left: 5px;
            margin-top: 3px;
            float: left;
        }

        .customSortDownLabel{
            float: left;
            margin-left: 10px;
            margin-top: 5px;
        }

        .customSortUpLabel{
            float: left;
            margin-left: 3px;
            margin-top: 4px;
        }

        .customSortRemoveLabel{
            float: left;
            font-size: 11px;
            margin-left: 3px;
            margin-top: 6px;
        }

        .active {
            color: cornflowerblue;
        }



        @keyframes  toExpanded{
            from {
                color: cornflowerblue;
                -ms-transform: rotate(0deg); /* IE 9 */
                -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
                transform: rotate(0deg);
            }
            to {
                color: black;
                -ms-transform: rotate(180deg); /* IE 9 */
                -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
                transform: rotate(180deg);
            }
        }

        @keyframes toCollapsed{
            from {
                color: black;
                -ms-transform: rotate(180deg); /* IE 9 */
                -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
                transform: rotate(180deg);
            }
            to {
                color: cornflowerblue;
                -ms-transform: rotate(0deg); /* IE 9 */
                -webkit-transform: rotate(0deg); /* Chrome, Safari, Opera */
                transform: rotate(0deg);
            }
        }
    `
    ]
})
export class CustomHeaderGroup {
    private params: any;
    private expandState: string;

    agInit(params): void {
        this.params = params;

        this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.syncExpandButtons.bind(this));

        this.syncExpandButtons();
    }

    expandOrCollapse() {
        let currentState = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
        this.params.setExpanded(!currentState);
    }

    syncExpandButtons() {
        if (this.params.columnGroup.getOriginalColumnGroup().isExpanded()) {
            this.expandState = 'expanded';
        } else {
            this.expandState = 'collapsed';
        }
    }
}
