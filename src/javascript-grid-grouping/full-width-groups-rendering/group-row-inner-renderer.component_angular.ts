import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'floating-cell',
    template: `
        <div class="row">
            <img *ngIf="flagCode" class="flag" border="0" width="20" height="15" [src]="flagCodeImg" />
            <span class="groupTitle"> {{countryName}}</span>
            <span class="medal gold"> Gold: {{goldCount}}</span>
            <span class="medal silver"> Silver: {{silverCount}}</span>
            <span class="medal bronze"> Bronze: {{bronzeCount}}</span>
        </div>`,
    styles: [
        `
        .row {
            display: inline-block;
        }
        
        .groupTitle {
            font-size: 16px; font-weight: bold;
        }
        
        .medal {
            margin-left: 10px;
            background-color: black;
            padding: 2px;
            border-radius: 2px;
        }
        
        .gold {
            color: gold;
        }
        
        .silver {
            color: silver;
        }
        
        .bronze {
            color: lightsalmon;
        }
        
        .flag {
            margin-left: 4px;
            position: relative;
            top: 2px;
        }
    `
    ]
})
export class GroupRowInnerRenderer implements ICellRendererAngularComp {
    private flagCodeImg: string;
    private countryName: number;
    private goldCount: number;
    private silverCount: number;
    private bronzeCount: number;
    private flagCode: any;

    agInit(params: any): void {
        const node = params.node;
        const aggData = node.aggData;
        this.flagCode = params.flagCodes[params.node.key];
        this.flagCodeImg = `https://flags.fmcdn.net/data/flags/mini/${this.flagCode}.png`;
        this.countryName = node.key;
        this.goldCount = aggData.gold;
        this.silverCount = aggData.silver;
        this.bronzeCount = aggData.bronze;
    }

    refresh(): boolean {
        return false;
    }
}