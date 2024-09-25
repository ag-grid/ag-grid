import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

export interface GroupFlagCellRendererParams extends ICellRendererParams {
    flagCodes: Record<string, string>;
}

export class GroupRowInnerRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    params!: GroupFlagCellRendererParams;
    dataChangedListener!: () => void;

    init(params: GroupFlagCellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.style.display = 'inline-block';
        this.params = params;
        this.refreshGui();

        this.dataChangedListener = () => {
            this.refreshGui();
        };

        params.api.addEventListener('cellValueChanged', this.dataChangedListener);
        params.api.addEventListener('filterChanged', this.dataChangedListener);
    }

    refreshGui() {
        var flagCode = this.params.flagCodes[this.params.node.key!];

        var html = '';

        if (flagCode) {
            html +=
                '<img class="flag" border="0" width="20" height="15" src="https://flags.fmcdn.net/data/flags/mini/' +
                flagCode +
                '.png">';
        }

        var node = this.params.node;
        var aggData = node.aggData;

        html += '<span class="groupTitle">COUNTRY_NAME</span>';
        html +=
            '<span class="medal gold" aria-label="COUNTRY_NAME - GOLD_COUNT gold medals"><i class="fas fa-medal"></i>GOLD_COUNT</span>';
        html +=
            '<span class="medal silver" aria-label="COUNTRY_NAME - SILVER_COUNT silver medals"><i class="fas fa-medal"></i>SILVER_COUNT</span>';
        html +=
            '<span class="medal bronze" aria-label="COUNTRY_NAME - BRONZE_COUNT bronze medals"><i class="fas fa-medal"></i>BRONZE_COUNT</span>';

        html = html
            .replace(/COUNTRY_NAME/g, node.key!)
            .replace(/GOLD_COUNT/g, aggData.gold)
            .replace(/SILVER_COUNT/g, aggData.silver)
            .replace(/BRONZE_COUNT/g, aggData.bronze);

        this.eGui.innerHTML = html;
    }

    destroy() {
        if (!this.params.api.isDestroyed()) {
            this.params.api.removeEventListener('cellValueChanged', this.dataChangedListener);
            this.params.api.removeEventListener('filterChanged', this.dataChangedListener);
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
