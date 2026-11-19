import type { IBuiltInTooltipComp, IBuiltInTooltipParams } from 'ag-grid-community';

export class CustomBuiltInTooltip implements IBuiltInTooltipComp {
    private eGui!: HTMLElement;

    public init(params: IBuiltInTooltipParams & { heading: string }): void {
        this.eGui = document.createElement('div');
        this.eGui.className = 'control-tooltip';

        const heading = document.createElement('span');
        heading.textContent = params.heading;
        const text = document.createElement('strong');
        text.textContent = params.text;
        const source = document.createElement('small');
        source.textContent = `${params.location} / ${params.control}`;

        this.eGui.append(heading, text, source);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}
