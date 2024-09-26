export class CustomButtonComponent {
    eGui!: HTMLDivElement;
    eButton: any;
    eventListener!: () => void;

    init() {
        this.eGui = document.createElement('div');
        const eButton = document.createElement('button');
        eButton.className = 'btn-simple';
        eButton.textContent = 'Launch!';
        this.eventListener = () => alert('Software Launched');
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
