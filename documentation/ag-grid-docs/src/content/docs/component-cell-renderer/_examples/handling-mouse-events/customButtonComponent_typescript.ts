export class CustomButtonComponent {
    eGui!: HTMLDivElement;
    destroyListener!: () => void;

    init() {
        this.eGui = document.createElement('div');
        const eButton = document.createElement('button');
        eButton.textContent = 'Custom Button';
        const eventListener = () => {
            console.log('Button clicked');
        };
        eButton.addEventListener('click', eventListener);
        this.destroyListener = () => {
            eButton.removeEventListener('click', eventListener);
        };
        this.eGui.appendChild(eButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return true;
    }

    destroy() {
        this.destroyListener();
    }
}
