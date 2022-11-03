import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { clearElement, setDisabled, setDisplayed, setElementWidth } from "../utils/dom";
import { setAriaRole } from "../utils/aria";

export type LabelAlignment = 'left' | 'right' | 'top';

export interface IAgLabel {
    label?: HTMLElement | string;
    labelWidth?: number | 'flex';
    labelSeparator?: string;
    labelAlignment?: LabelAlignment;
}

export abstract class AgAbstractLabel<TConfig extends IAgLabel = IAgLabel> extends Component {
    protected abstract eLabel: HTMLElement;

    protected readonly config: TConfig;
    protected labelSeparator: string = '';
    protected labelAlignment: LabelAlignment = 'left';
    protected disabled: boolean = false;
    private label: HTMLElement | string = '';

    constructor(config?: TConfig, template?: string) {
        super(template);

        this.config = config || {} as any;
    }

    @PostConstruct
    protected postConstruct() {
        this.addCssClass('ag-labeled');
        this.eLabel.classList.add('ag-label');

        const { labelSeparator, label, labelWidth, labelAlignment } = this.config;

        if (labelSeparator != null) {
            this.setLabelSeparator(labelSeparator);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (labelWidth != null) {
            this.setLabelWidth(labelWidth);
        }

        this.setLabelAlignment(labelAlignment || this.labelAlignment);
        this.refreshLabel();
    }

    protected refreshLabel() {
        clearElement(this.eLabel);

        if (typeof this.label === 'string') {
            this.eLabel.innerText = this.label + this.labelSeparator;
        } else if (this.label) {
            this.eLabel.appendChild(this.label);
        }

        if (this.label === '') {
            setDisplayed(this.eLabel, false);
            setAriaRole(this.eLabel, 'presentation');
        } else {
            setDisplayed(this.eLabel, true);
            setAriaRole(this.eLabel, null);
        }
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

    public getLabelId(): string {
        this.eLabel.id = this.eLabel.id || `ag-${this.getCompId()}-label`;

        return this.eLabel.id;
    }

    public getLabel(): HTMLElement | string {
        return this.label;
    }

    public setLabel(label: HTMLElement | string): this {
        if (this.label === label) {
            return this;
        }

        this.label = label;

        this.refreshLabel();

        return this;
    }

    public setLabelAlignment(alignment: LabelAlignment): this {
        const eGui = this.getGui();
        const eGuiClassList = eGui.classList;

        eGuiClassList.toggle('ag-label-align-left', alignment === 'left');
        eGuiClassList.toggle('ag-label-align-right', alignment === 'right');
        eGuiClassList.toggle('ag-label-align-top', alignment === 'top');

        return this;
    }

    public setLabelWidth(width: number | 'flex'): this {
        if (this.label == null) {
            return this;
        }

        setElementWidth(this.eLabel, width);

        return this;
    }

    public setDisabled(disabled: boolean): this {
        disabled = !!disabled;

        const element = this.getGui();

        setDisabled(element, disabled);
        element.classList.toggle('ag-disabled', disabled);

        this.disabled = disabled;

        return this;
    }

    public isDisabled(): boolean {
        return !!this.disabled;
    }
}