import type { ILoadingCellRendererComp, ILoadingCellRendererParams } from 'ag-grid-community';

export class CustomLoadingCellRenderer implements ILoadingCellRendererComp {
    eGui!: HTMLElement;

    init(params: ILoadingCellRendererParams & { loadingMessage: string }) {
        const wrapper = (this.eGui = document.createElement('div'));
        wrapper.classList.add('ag-custom-loading-cell');
        if (params.node.failedLoad) {
            wrapper.innerHTML = `
                <i class="fas fa-times"></i>
                <span>Data failed to load</span>
            `;
            return;
        }
        wrapper.innerHTML = `
            <i class="fas fa-spinner fa-pulse"></i> 
            <span>${params.loadingMessage} </span>
        `;
    }

    getGui() {
        return this.eGui;
    }
}
