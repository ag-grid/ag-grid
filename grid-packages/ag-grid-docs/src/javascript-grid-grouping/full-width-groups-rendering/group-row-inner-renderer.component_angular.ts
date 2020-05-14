import {Component} from '@angular/core';
import {RowNode} from '@ag-grid-community/all-modules';
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'floating-cell',
    template: `
        <div class="row">
            <img *ngIf="flagCode" class="flag" border="0" width="20" height="15" [src]="flagCodeImg" />
            <span class="groupTitle">{{node.key}}</span>
            <span class="medal gold" attr.aria-label="{{node.key}} - {{node.aggData.gold}} gold medals"><i class="fas fa-medal"></i>{{node.aggData.gold}}</span>
            <span class="medal silver" attr.aria-label="{{node.key}} - {{node.aggData.silver}} silver medals"><i class="fas fa-medal"></i>{{node.aggData.silver}}</span>
            <span class="medal bronze" attr.aria-label="{{node.key}} - {{node.aggData.bronze}} bronze medals"><i class="fas fa-medal"></i>{{node.aggData.bronze}}</span>
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
            margin: 0 5px;
        }

        .gold {
            color: #e4ab11;
        }

        .silver {
            color: #bbb4bb;
        }

        .bronze {
            color: #be9088;
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
