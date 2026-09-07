import { _exists, _setDisplayed } from 'ag-stack';

import type {
    BaseCellDataType,
    FieldValueEvent,
    GridInputDateField,
    GridInputTextField,
    WithoutGridCommon,
} from 'ag-grid-community';
import {
    AgInputDateField,
    AgInputNumberField,
    AgInputTextField,
    KeyCode,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import { PillComp } from './pillComp';

type InputPillCompEvent = 'fieldValueChanged';

type SupportedComponent =
    | typeof AgInputTextField<any, any, any, any, any, any>
    | typeof AgInputNumberField<any, any, any, any, any, any>
    | typeof AgInputDateField<any, any, any, any, any, any>;
type SupportedInstances = InstanceType<SupportedComponent>;
const inputComponentDescriptors: {
    [S in BaseCellDataType]: [SupportedComponent] | [SupportedComponent, (instance: SupportedInstances) => void];
} = {
    number: [AgInputNumberField],
    bigint: [AgInputTextField],
    boolean: [AgInputTextField],
    object: [AgInputTextField],
    text: [AgInputTextField],
    date: [AgInputDateField],
    dateString: [AgInputDateField],
    dateTime: [AgInputDateField, (i: GridInputDateField) => i.setIncludeTime(true)],
    dateTimeString: [AgInputDateField, (i: GridInputDateField) => i.setIncludeTime(true)],
};

export class InputPillComp extends PillComp<InputPillCompEvent> {
    private eEditor: GridInputTextField | undefined;
    /** What the editor opened with, so closing it untouched is not read back as an edit. */
    private editorOpenedWith: string | undefined;
    private value: string;
    private displayValue: string;

    constructor(
        private readonly params: {
            value: string;
            valueFormatter: (value: string) => string;
            editValueFormatter?: (value: string) => string;
            cssClass: string;
            type: BaseCellDataType;
            ariaLabel: string;
        }
    ) {
        super(params);
        const { value, valueFormatter } = params;
        this.value = value;
        this.displayValue = valueFormatter(value);
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.addDestroyFunc(() => this.destroyBean(this.eEditor));
    }

    protected override open(): void {
        if (this.eEditor) {
            return;
        }
        _setDisplayed(this.ePill, false);
        this.eEditor = this.createEditorComp();
        const { editValueFormatter } = this.params;
        // Edit the value as it is displayed, so a formatted operand does not flip back to the raw
        // model value when the editor opens.
        this.editorOpenedWith = editValueFormatter?.(this.value) ?? this.value;
        this.eEditor.setValue(this.editorOpenedWith);
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

    /**
     * Responsible for instantiating an InputField and calling some of the setup methods
     */
    private createEditorComp(): GridInputTextField {
        // An operand edited as displayed is text no typed input would keep, so it is edited as text.
        const type = this.params.editValueFormatter ? 'text' : this.params.type;
        const [Comp, postConstruct] = inputComponentDescriptors[type];
        // eslint-disable-next-line sonarjs/new-operator-misuse -- false positive: Comp is a class constructor from inputComponentDescriptors
        const instance = this.createBean(new Comp());
        postConstruct?.(instance);
        return instance;
    }

    private hideEditor(keepFocus: boolean): void {
        const { eEditor } = this;
        if (!eEditor) {
            return;
        }
        this.eEditor = undefined;
        eEditor.getGui().remove();
        this.destroyBean(eEditor);
        _setDisplayed(this.ePill, true);
        if (keepFocus) {
            this.ePill.focus();
        }
    }

    protected override renderValue(): void {
        const displayValue = this.displayValue;
        if (!_exists(displayValue)) {
            this.writeLabel(null);
            return;
        }
        const type = this.params.type;
        if (type === 'number' || type === 'bigint') {
            this.writeLabel(displayValue, 'ag-advanced-filter-builder-value-number');
            return;
        }
        this.writeLabel(`"${displayValue}"`, 'ag-advanced-filter-builder-value-text');
    }

    private updateValue(keepFocus: boolean): void {
        if (!this.eEditor) {
            return;
        }
        const value = this.eEditor.getValue() ?? '';
        // Blurring an untouched editor is not an edit: re-reading its text would put the operand back
        // through the column's parser, which need not return the value the text was rendered from.
        if (value === this.editorOpenedWith) {
            this.hideEditor(keepFocus);
            return;
        }
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
