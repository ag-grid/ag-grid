import { Component } from "./component";
import { _ } from "../utils";
import { PostConstruct } from "../context/context";

export interface IAgLabel {
    label?: string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
}

export type LabelAlignment = 'left' | 'right' | 'top';

export abstract class AgLabel extends Component {
    protected abstract eLabel: HTMLElement;

    protected labelSeparator: string = '';
    protected labelAlignment: LabelAlignment = 'left';
    private label: string = '';

    @PostConstruct
    protected postConstruct() {
        this.setLabelAlignment(this.labelAlignment);
        this.refreshLabel();
    }

    private refreshLabel() {
        this.eLabel.innerText = this.label + this.labelSeparator;
        _.addOrRemoveCssClass(this.eLabel, 'ag-hidden', this.label === '');
    }

    public setLabelSeparator(labelSeparator: string): this {
        if (this.labelSeparator === labelSeparator) {
            return this;
        }

        this.labelSeparator = labelSeparator;

        if (this.label != null) {
            this.refreshLabel();
        }

        return this;
    }

    public setLabel(label: string): this {
        if (this.label === label) {
            return this;
        }

        this.label = label;

        this.refreshLabel();

        return this;
    }

    public setLabelAlignment(alignment: LabelAlignment): this {
        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-label-align-left', alignment === 'left');
        _.addOrRemoveCssClass(eGui, 'ag-label-align-right', alignment === 'right');
        _.addOrRemoveCssClass(eGui, 'ag-label-align-top', alignment === 'top');

        return this;
    }

    public setLabelWidth(width: number | 'flex'): this {
        if (this.label == null) {
            return this;
        }

        _.setElementWidth(this.eLabel, width);

        return this;
    }
}