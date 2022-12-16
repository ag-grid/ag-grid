import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { GroupCellRendererParams, IRowNode } from '@ag-grid-community/core';

interface GroupRowParams extends GroupCellRendererParams {
    flagCodes: Record<string, string>;
}

@Component({
    selector: 'group-row-cell',
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
            margin: 0 4px;
            position: relative;
            top: 2px;
        }
    `
    ]
})
export class GroupRowInnerRenderer implements ICellRendererAngularComp {

    public flagCodeImg!: string;
    public flagCode!: any;
    public node!: IRowNode;

    agInit(params: GroupRowParams): void {
        this.node = params.node;
        this.flagCode = params.flagCodes[params.node.key || ''];
        this.flagCodeImg = `https://flags.fmcdn.net/data/flags/mini/${this.flagCode}.png`;
    }

    refresh(): boolean {
        return false;
    }
}
