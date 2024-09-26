import type { ITooltipComp, ITooltipParams } from 'ag-grid-community';

export class CustomTooltip implements ITooltipComp {
    eGui!: HTMLElement;
    params!: ITooltipParams & { type: string };

    constructor() {
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    init(params: ITooltipParams & { type: string }) {
        this.params = params;
        const type = params.type || 'primary';
        const data = params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data;
        const eGui = (this.eGui = document.createElement('div'));

        eGui.classList.add('custom-tooltip');
        eGui.innerHTML = `
            <div class="panel panel-${type}">
                <div class="panel-heading">
                    <h3 class="panel-title">${data.country}</h3>
                </div>
                <form class="panel-body">
                    <div class="form-group">
                        <input type="text" class="form-control" id="name" placeholder="Name" autocomplete="off" value="${data.athlete}" onfocus="this.select()">
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                    <p>Total: ${data.total}</p>
                </form>
            </div>`;

        eGui.querySelector('form')?.addEventListener('submit', this.onFormSubmit);
    }

    onFormSubmit(e: Event) {
        e.preventDefault();
        const { params } = this;
        const { node } = params;

        const target = (e.target as Element).querySelector('input') as HTMLInputElement;

        if (target?.value) {
            node?.setDataValue('athlete', target.value);
            if (this.params.hideTooltipCallback) {
                this.params.hideTooltipCallback();
            }
        }
    }

    getGui() {
        return this.eGui;
    }

    destroy(): void {
        this.eGui.querySelector('form')?.removeEventListener('submit', this.onFormSubmit);
    }
}
