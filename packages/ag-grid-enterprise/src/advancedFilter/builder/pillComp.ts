import { RefPlaceholder, _setAriaDescribedBy, _setAriaLabel } from 'ag-stack';

import type { BeanCollection, ComponentEvent, ElementParams, IconName } from 'ag-grid-community';
import { Component, KeyCode, _stopPropagationForAgGrid } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';

const VALUE_EMPTY_CLASS = 'ag-advanced-filter-builder-value-empty';
const VALUE_NUMBER_CLASS = 'ag-advanced-filter-builder-value-number';
const VALUE_TEXT_CLASS = 'ag-advanced-filter-builder-value-text';

interface PillParams {
    cssClass: string;
    ariaLabel: string;
    wrapperClassName?: string;
    displayClassName?: string;
    pickerIcon?: IconName;
}

const getPillElement = ({ cssClass, wrapperClassName, displayClassName, pickerIcon }: PillParams): ElementParams => {
    const pillChildren: ElementParams[] = [
        {
            tag: 'span',
            cls: `ag-advanced-filter-builder-pill-display ${displayClassName ?? ''}`,
            ref: 'eLabel',
        },
    ];
    if (pickerIcon) {
        pillChildren.push({
            tag: 'span',
            ref: 'eIcon',
            cls: 'ag-picker-field-icon',
            attrs: { 'aria-hidden': 'true' },
        });
    }

    return {
        tag: 'div',
        cls: `ag-advanced-filter-builder-pill-wrapper ${wrapperClassName ?? ''}`,
        role: 'presentation',
        children: [
            {
                tag: 'div',
                ref: 'ePill',
                cls: `ag-advanced-filter-builder-pill ${cssClass}`,
                role: 'button',
                children: pillChildren,
            },
        ],
    };
};

/** A labelled button holding one part of a Builder condition, which activating opens an editor for. */
export abstract class PillComp<TLocalEvent extends string = ComponentEvent> extends Component<TLocalEvent> {
    protected readonly ePill: HTMLElement = RefPlaceholder;
    protected readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eIcon: HTMLElement = RefPlaceholder;
    protected advFilterExpSvc: AdvancedFilterExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
    }

    constructor(private readonly pillParams: PillParams) {
        super(getPillElement(pillParams));
    }

    /** The label and its state class. A `null` text is "nothing chosen yet", which the base words. */
    protected writeLabel(text: string | null, cls?: string): void {
        const eLabel = this.eLabel;
        const classList = eLabel.classList;
        classList.remove(VALUE_EMPTY_CLASS, VALUE_NUMBER_CLASS, VALUE_TEXT_CLASS);
        if (text === null) {
            eLabel.textContent = this.advFilterExpSvc.translate('advancedFilterBuilderEnterValue');
            classList.add(VALUE_EMPTY_CLASS);
            return;
        }
        eLabel.textContent = text;
        if (cls) {
            classList.add(cls);
        }
    }

    public postConstruct(): void {
        const { ariaLabel, pickerIcon } = this.pillParams;
        const ePill = this.ePill;
        const eLabel = this.eLabel;

        this.activateTabIndex([ePill]);

        if (pickerIcon) {
            const icon = this.beans.iconSvc.createIconNoSpan(pickerIcon);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }

        eLabel.id = `${this.getCompId()}`;
        _setAriaDescribedBy(ePill, eLabel.id);
        _setAriaLabel(ePill, ariaLabel);

        this.renderValue();

        this.addManagedListeners(ePill, {
            click: (event: MouseEvent) => {
                event.preventDefault();
                this.open();
            },
            keydown: (event: KeyboardEvent) => {
                if (event.key === KeyCode.ENTER) {
                    event.preventDefault();
                    _stopPropagationForAgGrid(event);
                    this.open();
                }
            },
        });
    }

    public override getFocusableElement(): HTMLElement {
        return this.ePill;
    }

    /** Writes the label from the value the pill currently holds. */
    protected abstract renderValue(): void;

    /** Opens whatever edits that value: an inline editor, a picker popup. */
    protected abstract open(): void;
}
