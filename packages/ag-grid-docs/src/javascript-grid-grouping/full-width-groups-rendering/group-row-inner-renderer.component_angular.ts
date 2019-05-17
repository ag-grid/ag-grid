import {Component} from '@angular/core';
import {RowNode} from 'ag-grid-community';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'floating-cell',
    template: `
        <div class="row">
            <img *ngIf="flagCode" class="flag" border="0" width="20" height="15" [src]="flagCodeImg" />
            <span class="groupTitle"> {{node.key}}</span>
            <span class="medal gold"> Gold: {{node.aggData.gold}}</span>
            <span class="medal silver"> Silver: {{node.aggData.silver}}</span>
            <span class="medal bronze"> Bronze: {{node.aggData.bronze}}</span>
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
    private flagCode: any;
    private node: RowNode;

    agInit(params: any): void {
        this.node = params.node;
        this.flagCode = params.flagCodes[params.node.key];
        this.flagCodeImg = `https://flags.fmcdn.net/data/flags/mini/${this.flagCode}.png`;
    }

    refresh(): boolean {
        return false;
    }
}