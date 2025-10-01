import type { ICellRendererParams } from 'ag-grid-community';

export class CustomButtonComponent {
    eGui!: HTMLDivElement;
    eButton: any;
    eventListener!: () => void;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        const eButton = document.createElement('button');
        eButton.className = 'btn-simple';
        const company = params.data?.company;
        eButton.textContent = company ? `Launch ${company}!` : 'Launch!';
        this.eventListener = () => console.log('Software Launched');
        eButton.addEventListener('click', this.eventListener);
        this.eGui.appendChild(eButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return true;
    }

    destroy() {
        if (this.eButton) {
            this.eButton.removeEventListener('click', this.eventListener);
        }
    }
}
