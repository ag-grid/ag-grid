// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
export declare type LabelAlignment = 'left' | 'right' | 'top';
export interface IAgLabel {
    label?: string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
}
export declare abstract class AgAbstractLabel extends Component {
    protected abstract eLabel: HTMLElement;
    protected labelSeparator: string;
    protected labelAlignment: LabelAlignment;
    protected config: IAgLabel;
    private label;
    protected postConstruct(): void;
    private refreshLabel;
    setLabelSeparator(labelSeparator: string): this;
    setLabel(label: string): this;
    setLabelAlignment(alignment: LabelAlignment): this;
    setLabelWidth(width: number | 'flex'): this;
}
