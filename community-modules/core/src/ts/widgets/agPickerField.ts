import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { exists } from "../utils/generic";
import { setElementWidth, isVisible } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
import { IAgLabel } from './agAbstractLabel';

export abstract class AgPickerField<TElement extends HTMLElement, TValue> extends AgAbstractField<TValue> {
    public abstract showPicker(): Component;
    protected value: TValue;
    protected isPickerDisplayed: boolean = false;
    protected isDestroyingPicker: boolean = false;
    private skipClick: boolean = false;
    private pickerComponent: Component;

    @RefSelector('eLabel') protected readonly eLabel: HTMLElement;
    @RefSelector('eWrapper') protected readonly eWrapper: HTMLElement;
    @RefSelector('eDisplayField') protected readonly eDisplayField: TElement;
    @RefSelector('eIcon') private readonly eIcon: HTMLButtonElement;

    constructor(config?: IAgLabel, className?: string, private readonly pickerIcon?: string, ariaRole?: string) {
        super(config,
            /* html */ `<div class="ag-picker-field" role="presentation">
                <div ref="eLabel"></div>
                <div ref="eWrapper"
                    class="ag-wrapper ag-picker-field-wrapper"
                    tabIndex="-1"
                    aria-expanded="false"
                    ${ariaRole ? `role="${ariaRole}"` : ''}
                >
                    <div ref="eDisplayField" class="ag-picker-field-display"></div>
                    <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                </div>
            </div>`, className);
    }

    protected postConstruct() {
        super.postConstruct();

        const displayId = `${this.getCompId()}-display`;

        this.eDisplayField.setAttribute('id', displayId);
        setAriaDescribedBy(this.eWrapper, displayId);

        const clickHandler = () => {
            if (this.skipClick) {
                this.skipClick = false;
                return;
            }

            if (this.isDisabled()) { return; }

            this.pickerComponent = this.showPicker();
        };

        const eGui = this.getGui();

        this.addManagedListener(eGui, 'mousedown', (e: MouseEvent) => {
            if (
                !this.skipClick &&
                this.pickerComponent &&
                this.pickerComponent.isAlive() &&
                isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target as HTMLElement)
            ) {
                this.skipClick = true;
            }
        });

        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            switch (e.key) {
                case KeyCode.UP:
                case KeyCode.DOWN:
                case KeyCode.ENTER:
                case KeyCode.SPACE:
                    clickHandler();
                case KeyCode.ESCAPE:
                    if (this.isPickerDisplayed) {
                        e.preventDefault();
                    }
                    break;
            }
        });

        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);

        if (this.pickerIcon) {
            const icon = createIconNoSpan(this.pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }

    protected refreshLabel() {
        if (exists(this.getLabel())) {
            setAriaLabelledBy(this.eWrapper, this.getLabelId());
        } else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }

        super.refreshLabel();
    }

    public setAriaLabel(label: string): this {
        setAriaLabel(this.eWrapper, label);

        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        setElementWidth(this.eWrapper, width);
        return this;
    }

    public getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }
}
