type CustomActiveOverlayParams = {
    heading?: string;
    message?: string;
};

export class CustomActiveOverlay {
    private eGui!: HTMLElement;
    private headingEl!: HTMLHeadingElement;
    private messageEl!: HTMLParagraphElement;

    public init(params: CustomActiveOverlayParams = {}): void {
        this.eGui = document.createElement('div');
        this.eGui.className = 'custom-active-overlay';

        const bodyEl = document.createElement('div');
        bodyEl.className = 'custom-active-overlay__body';
        bodyEl.setAttribute('role', 'presentation');
        bodyEl.setAttribute('aria-live', 'polite');
        bodyEl.setAttribute('aria-atomic', 'true');

        this.headingEl = document.createElement('h2');
        this.messageEl = document.createElement('p');

        bodyEl.append(this.headingEl, this.messageEl);
        this.eGui.append(bodyEl);

        this.refresh(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: CustomActiveOverlayParams = {}): void {
        const heading = params.heading ?? 'Active Overlay';
        const message = params.message ?? 'This overlay is rendered via activeOverlay.';

        this.headingEl.textContent = heading;
        this.messageEl.textContent = message;
    }

    public destroy(): void {
        // no-op
    }
}
