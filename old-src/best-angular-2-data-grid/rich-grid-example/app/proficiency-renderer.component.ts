import {Component, ViewEncapsulation} from "@angular/core";

@Component({
    selector: 'proficiency-renderer',
    template: `
     <div class="div-percent-bar" [ngStyle]="styles">
        <div class="div-percent-value">{{value}}%</div>
        <div class=div-outer-div></div>
    </div>
    `,
    styles: [
        `
        .div-percent-bar {
            display: inline-block;
            height: 100%;
            position: relative;
            z-index: 0;
        }

        .div-percent-value {
            position: absolute;
            padding-left: 4px;
            font-weight: bold;
            font-size: 13px;
            z-index: 10;
        }
        
        .div-outer-div {
            display: inline-block;
            height: 100%;
            width: 100%;
        }
`
    ]
})
export class ProficiencyCellRenderer {
    private params: any;
    private value: any;
    private styles: any;

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;

        this.styles = {
            width: this.value + "%",
            backgroundColor: '#00A000'
        };

        if (this.value < 20) {
            this.styles.backgroundColor = 'red';
        } else if (this.params.value < 60) {
            this.styles.backgroundColor = '#ff9900';
        }
    }
}
