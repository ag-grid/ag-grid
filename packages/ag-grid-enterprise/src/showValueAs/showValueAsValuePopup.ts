import { RefPlaceholder } from 'ag-stack';

import type { ElementParams, GridInputNumberField } from 'ag-grid-community';
import { AgInputNumberFieldSelector, Component, KeyCode, _toFiniteNumber } from 'ag-grid-community';

/** Config for the built-in constant-value dialog body (the default editor for a base mode's `Custom value…`).
 *  The dialog title/chrome is provided by the wrapping {@link Dialog}; this is just the body. */
interface ShowValueAsValuePopupParams {
    description: string;
    applyLabel: string;
    cancelLabel: string;
    value: number | bigint | undefined;
    onApply: (value: number) => void;
    onCancel: () => void;
}

const TEMPLATE: ElementParams = {
    tag: 'div',
    cls: 'ag-show-value-as-value-popup',
    children: [
        { tag: 'div', ref: 'eDesc', cls: 'ag-show-value-as-value-popup-desc' },
        { tag: 'ag-input-number-field', ref: 'eValue' },
        {
            tag: 'div',
            cls: 'ag-show-value-as-value-popup-buttons',
            children: [
                { tag: 'button', ref: 'eCancel', cls: 'ag-button ag-standard-button' },
                { tag: 'button', ref: 'eApply', cls: 'ag-button ag-standard-button' },
            ],
        },
    ],
};

/** The default "Custom value" editor body (shown inside a {@link Dialog}): a description, a labelled number
 *  field and Apply/Cancel — built from the widget framework so theming, focus and a11y come for free. */
export class ShowValueAsValuePopup extends Component {
    private readonly eDesc: HTMLElement = RefPlaceholder;
    private readonly eValue: GridInputNumberField = RefPlaceholder;
    private readonly eApply: HTMLButtonElement = RefPlaceholder;
    private readonly eCancel: HTMLButtonElement = RefPlaceholder;

    constructor(private readonly cfg: ShowValueAsValuePopupParams) {
        super(TEMPLATE, [AgInputNumberFieldSelector]);
    }

    public postConstruct(): void {
        const cfg = this.cfg;
        this.eDesc.textContent = cfg.description;
        if (cfg.value != null) {
            this.eValue.setValue(String(cfg.value));
        }
        this.eApply.textContent = cfg.applyLabel;
        this.eApply.type = 'button';
        this.eCancel.textContent = cfg.cancelLabel;
        this.eCancel.type = 'button';
        this.addManagedElementListeners(this.eApply, { click: () => this.apply() });
        this.addManagedElementListeners(this.eCancel, { click: () => cfg.onCancel() });
        this.addManagedElementListeners(this.eValue.getInputElement(), {
            keydown: (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER) {
                    e.preventDefault();
                    this.apply();
                } else if (e.key === KeyCode.ESCAPE) {
                    e.preventDefault();
                    cfg.onCancel();
                }
            },
        });
    }

    public focusInput(): void {
        this.eValue.getFocusableElement().focus();
    }

    private apply(): void {
        const raw = this.eValue.getInputElement().value;
        // `Number('')` is `0`, so blank must short-circuit to null before the finite-number coercion.
        const value = raw === '' ? null : _toFiniteNumber(raw);
        const cfg = this.cfg;
        if (value != null) {
            cfg.onApply(value);
        } else {
            cfg.onCancel();
        }
    }
}
