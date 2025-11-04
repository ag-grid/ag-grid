type StatusOverlayParams = {
    heading?: string;
    message?: string;
};

export class StatusOverlay {
    private eGui!: HTMLElement;
    private headingEl!: HTMLHeadingElement;
    private messageEl!: HTMLParagraphElement;

    public init(params: StatusOverlayParams = {}): void {
        this.eGui = document.createElement('div');
        this.eGui.className = 'status-overlay';

        const bodyEl = document.createElement('div');
        bodyEl.className = 'status-overlay__body';
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

    public refresh(params: StatusOverlayParams = {}): void {
        const heading = params.heading ?? 'Status Update';
        const message = params.message ?? 'Custom overlay supplied from the components map.';

        this.headingEl.textContent = heading;
        this.messageEl.textContent = message;
    }

    public destroy(): void {
        // no-op
    }
}
