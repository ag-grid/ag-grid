export class CustomOverlay {
    private eGui!: HTMLElement;

    public init(): void {
        const eGui = document.createElement('div');
        this.eGui = eGui;
        eGui.className = 'my-custom-overlay';
        eGui.innerText = 'Custom overlay';
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}
