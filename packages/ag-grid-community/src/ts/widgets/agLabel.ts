import { Component } from "./component";
import { _ } from "../utils";

export interface IAgLabel {
    label?: string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
}

export abstract class AgLabel extends Component {
    protected abstract eLabel: HTMLElement;

    protected labelSeparator: string = ':';
    private label: string;

    private refreshLabel() {
        this.eLabel.innerText = this.label + this.labelSeparator;
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

    public setLabelWidth(width: number | 'flex'): this {
        if (this.label == null) {
            return this;
        }

        _.setElementWidth(this.eLabel, width);

        return this;
    }
}