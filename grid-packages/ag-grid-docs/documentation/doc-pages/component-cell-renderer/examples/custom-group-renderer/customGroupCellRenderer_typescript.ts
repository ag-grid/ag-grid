import { ICellRendererParams, ICellRendererComp, RowNode, RowEvent } from "@ag-grid-community/core";

export class CustomGroupCellRenderer implements ICellRendererComp {
    eGui: HTMLElement | undefined;
    eGroupStatus: HTMLElement | undefined;
    eValueContainer: HTMLElement | undefined;

    node: RowNode | undefined;

    onClick = () => {
        this.node!.setExpanded(!this.node!.expanded);
    };

    onExpandedChanged = (params: RowEvent) => {
        this.eGroupStatus!.setAttribute('style', `cursor: pointer;transform: ${params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};display: inline-block`);
    }

    init(params: ICellRendererParams) {
        this.node = params.node;
        this.eGui = document.createElement('div');

        const paddingLeft = params.node.level * 15;
        this.eGui.setAttribute('style', `padding-left: ${paddingLeft}px`);

        if (this.node.group) {
            this.eGroupStatus = document.createElement('div');
            this.eGroupStatus.setAttribute('style', `cursor: pointer;transform: ${params.node.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};display: inline-block`);
            this.eGroupStatus.innerHTML = '&rarr;'
            this.eGroupStatus.setAttribute('class', 'eGroupStatus');

            this.eGroupStatus.addEventListener('click', this.onClick);

            this.eGui.appendChild(this.eGroupStatus);

            this.node.addEventListener('expandedChanged', this.onExpandedChanged);
        }

        this.eGui.append(' ');

        this.eValueContainer = document.createElement('span');
        this.eValueContainer.innerHTML = params.value == null ? '' : params.value;
        this.eValueContainer.setAttribute('class', 'eValueContainer');
        this.eGui.appendChild(this.eValueContainer);
    }

    getGui() {
        return this.eGui!;
    }

    refresh(params: ICellRendererParams): boolean {
        this.eValueContainer!.innerHTML = params.value == null ? '' : params.value;
        return true;
    }

    destroy(): void {
        if (this.eGroupStatus) {
            this.node!.removeEventListener('expandedChanged', this.onExpandedChanged);
            this.eGroupStatus.removeEventListener('click', this.onClick);
        }
    }
}
