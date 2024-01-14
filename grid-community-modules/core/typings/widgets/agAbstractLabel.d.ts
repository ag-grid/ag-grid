import { Component } from "./component";
export declare type LabelAlignment = 'left' | 'right' | 'top';
export interface IAgLabelParams {
    label?: HTMLElement | string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
}
export declare abstract class AgAbstractLabel<TConfig extends IAgLabelParams = IAgLabelParams> extends Component {
    protected abstract eLabel: HTMLElement;
    protected readonly config: TConfig;
    protected labelSeparator: string;
    protected labelAlignment: LabelAlignment;
    protected disabled: boolean;
    private label;
    constructor(config?: TConfig, template?: string);
    protected postConstruct(): void;
    protected refreshLabel(): void;
    setLabelSeparator(labelSeparator: string): this;
    getLabelId(): string;
    getLabel(): HTMLElement | string;
    setLabel(label: HTMLElement | string): this;
    setLabelAlignment(alignment: LabelAlignment): this;
    setLabelEllipsis(hasEllipsis: boolean): this;
    setLabelWidth(width: number | 'flex'): this;
    setDisabled(disabled: boolean): this;
    isDisabled(): boolean;
}
