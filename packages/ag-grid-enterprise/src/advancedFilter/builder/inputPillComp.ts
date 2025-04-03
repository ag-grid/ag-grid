import type { BeanCollection, ElementParams, FieldValueEvent, WithoutGridCommon } from 'ag-grid-community';
import {
    AgInputDateField,
    AgInputNumberField,
    AgInputTextField,
    Component,
    KeyCode,
    RefPlaceholder,
    _exists,
    _setAriaDescribedBy,
    _setAriaLabel,
    _setDisplayed,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';

export type InputPillCompEvent = 'fieldValueChanged';

const InputPillElement: ElementParams = {
    tag: 'div',
    cls: 'ag-advanced-filter-builder-pill-wrapper',
    role: 'presentation',
    children: [
        {
            tag: 'div',
            ref: 'ePill',
            cls: 'ag-advanced-filter-builder-pill',
            role: 'button',
            children: [
                {
                    tag: 'span',
                    ref: 'eLabel',
                    cls: 'ag-advanced-filter-builder-pill-display',
                },
            ],
        },
    ],
};
export class InputPillComp extends Component<InputPillCompEvent> {
    private advFilterExpSvc: AdvancedFilterExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
    }

    private readonly ePill: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    private eEditor: AgInputTextField | undefined;
    private value: string;
    private displayValue: string;

    constructor(
        private readonly params: {
            value: string;
            valueFormatter: (value: string) => string;
            cssClass: string;
            type: 'text' | 'number' | 'date';
            ariaLabel: string;
        }
    ) {
        super(InputPillElement);
        const { value, valueFormatter } = params;
        this.value = value;
        this.displayValue = valueFormatter(value);
    }

    public postConstruct(): void {
        const { cssClass, ariaLabel } = this.params;

        this.ePill.classList.add(cssClass);
        this.activateTabIndex([this.ePill]);

        this.eLabel.id = `${this.getCompId()}`;
        _setAriaDescribedBy(this.ePill, this.eLabel.id);
        _setAriaLabel(this.ePill, ariaLabel);

        this.renderValue();

        this.addManagedListeners(this.ePill, {
            click: (event: MouseEvent) => {
                event.preventDefault();
                this.showEditor();
            },
            keydown: (event: KeyboardEvent) => {
                switch (event.key) {
                    case KeyCode.ENTER:
                        event.preventDefault();
                        _stopPropagationForAgGrid(event);
                        this.showEditor();
                        break;
                }
            },
        });
        this.addDestroyFunc(() => this.destroyBean(this.eEditor));
    }

    public override getFocusableElement(): HTMLElement {
        return this.ePill;
    }

    private showEditor(): void {
        if (this.eEditor) {
            return;
        }
        _setDisplayed(this.ePill, false);
        this.eEditor = this.createEditorComp(this.params.type);
        this.eEditor.setValue(this.value);
        const eEditorGui = this.eEditor.getGui();
        this.eEditor.addManagedElementListeners(eEditorGui, {
            keydown: (event: KeyboardEvent) => {
                switch (event.key) {
                    case KeyCode.ENTER:
                        event.preventDefault();
                        _stopPropagationForAgGrid(event);
                        this.updateValue(true);
                        break;
                    case KeyCode.ESCAPE:
                        event.preventDefault();
                        _stopPropagationForAgGrid(event);
                        this.hideEditor(true);
                        break;
                }
            },
            focusout: () => this.updateValue(false),
        });
        this.getGui().appendChild(eEditorGui);
        this.eEditor.getFocusableElement().focus();
    }

    private createEditorComp(
        type: 'text' | 'number' | 'date'
    ): AgInputTextField | AgInputNumberField | AgInputDateField {
        let comp;
        switch (type) {
            case 'text':
                comp = new AgInputTextField();
                break;
            case 'number':
                comp = new AgInputNumberField();
                break;
            case 'date':
                comp = new AgInputDateField();
                break;
        }
        return this.createBean(comp);
    }

    private hideEditor(keepFocus: boolean): void {
        const { eEditor } = this;
        if (!eEditor) {
            return;
        }
        this.eEditor = undefined;
        this.getGui().removeChild(eEditor.getGui());
        this.destroyBean(eEditor);
        _setDisplayed(this.ePill, true);
        if (keepFocus) {
            this.ePill.focus();
        }
    }

    private renderValue(): void {
        let value: string;
        const { displayValue, eLabel } = this;
        const { classList } = eLabel;
        classList.remove(
            'ag-advanced-filter-builder-value-empty',
            'ag-advanced-filter-builder-value-number',
            'ag-advanced-filter-builder-value-text'
        );
        if (!_exists(displayValue)) {
            value = this.advFilterExpSvc.translate('advancedFilterBuilderEnterValue');
            classList.add('ag-advanced-filter-builder-value-empty');
        } else if (this.params.type === 'number') {
            value = displayValue;
            classList.add('ag-advanced-filter-builder-value-number');
        } else {
            value = `"${displayValue}"`;
            classList.add('ag-advanced-filter-builder-value-text');
        }
        eLabel.textContent = value;
    }

    private updateValue(keepFocus: boolean): void {
        if (!this.eEditor) {
            return;
        }
        const value = this.eEditor!.getValue() ?? '';
        this.dispatchLocalEvent<WithoutGridCommon<FieldValueEvent>>({
            type: 'fieldValueChanged',
            value,
        });
        this.value = value;
        this.displayValue = this.params.valueFormatter(value);
        this.renderValue();
        this.hideEditor(keepFocus);
    }
}
