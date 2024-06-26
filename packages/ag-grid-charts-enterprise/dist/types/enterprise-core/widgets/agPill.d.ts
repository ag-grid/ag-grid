import { Component } from 'ag-grid-community';
export interface PillConfig {
    onKeyDown?: (e?: KeyboardEvent) => void;
    onButtonClick?: (e?: MouseEvent) => void;
}
export declare class AgPill extends Component {
    private readonly config;
    private readonly eText;
    private readonly eButton;
    constructor(config: PillConfig);
    postConstruct(): void;
    toggleCloseButtonClass(className: string, force?: boolean): void;
    setText(text: string): void;
    getText(): string | null;
}
