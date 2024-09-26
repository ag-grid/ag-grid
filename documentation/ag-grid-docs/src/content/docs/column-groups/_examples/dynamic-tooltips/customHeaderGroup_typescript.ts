import type { IHeaderGroupComp, IHeaderGroupParams } from 'ag-grid-community';

export class CustomHeaderGroup implements IHeaderGroupComp {
    params!: IHeaderGroupParams;
    eGui!: HTMLDivElement;
    onExpandButtonClickedListener: any;
    eExpandButton: any;
    onExpandChangedListener: any;

    init(params: IHeaderGroupParams) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-header-group-cell-label';
        this.eGui.innerHTML =
            '' +
            '<div class="customHeaderLabel">' +
            this.params.displayName +
            '</div>' +
            '<div class="customExpandButton"><i class="fa fa-arrow-right"></i></div>';

        this.onExpandButtonClickedListener = this.expandOrCollapse.bind(this);
        this.eExpandButton = this.eGui.querySelector('.customExpandButton');
        this.eExpandButton.addEventListener('click', this.onExpandButtonClickedListener);

        this.onExpandChangedListener = this.syncExpandButtons.bind(this);
        this.params.columnGroup
            .getProvidedColumnGroup()
            .addEventListener('expandedChanged', this.onExpandChangedListener);

        this.syncExpandButtons();

        params.setTooltip(this.params.displayName, () => {
            const el = this.eGui.querySelector('.customHeaderLabel');
            if (!el) {
                return true;
            }
            return el?.scrollWidth > el.clientWidth;
        });
    }

    getGui() {
        return this.eGui;
    }

    expandOrCollapse() {
        const currentState = this.params.columnGroup.getProvidedColumnGroup().isExpanded();
        this.params.setExpanded(!currentState);
    }

    syncExpandButtons() {
        function collapsed(toDeactivate: any) {
            toDeactivate.className = toDeactivate.className.split(' ')[0] + ' collapsed';
        }

        function expanded(toActivate: any) {
            toActivate.className = toActivate.className.split(' ')[0] + ' expanded';
        }

        if (this.params.columnGroup.getProvidedColumnGroup().isExpanded()) {
            expanded(this.eExpandButton);
        } else {
            collapsed(this.eExpandButton);
        }
    }

    destroy() {
        this.eExpandButton.removeEventListener('click', this.onExpandButtonClickedListener);
    }
}
