export class CustomButtonComponent {
    eGui!: HTMLDivElement;
    eButton!: HTMLButtonElement;
    eventListener!: () => void;

    init() {
        this.eGui = document.createElement('div');
        this.eButton = document.createElement('button');
        this.eButton.className = 'btn-simple';
        this.eButton.textContent = 'Custom Button';
        this.eventListener = () => {
            console.log('Button clicked');
        };
        this.eButton.addEventListener('click', this.eventListener);
        this.eGui.appendChild(this.eButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return true;
    }

    destroy() {
        this.eButton?.removeEventListener('click', this.eventListener);
    }

    suppressGridClickHandling(event: MouseEvent) {
        return this.eButton.contains(event.target as HTMLElement);
    }
}
