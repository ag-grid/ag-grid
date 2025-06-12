import type { ElementParams, RichSelectParams } from 'ag-grid-community';
import { Component, _clearElement, _createElement, _createIconNoSpan } from 'ag-grid-community';

import { AgRichSelect } from '../../widgets/agRichSelect';
import { translateForFilterPanel } from './filterPanelUtils';

const AddFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card ag-filter-card-add',
};

export class AddFilterComp extends Component<'filterSelected'> {
    private eSelect?: AgRichSelect;
    private removeButton?: () => undefined;

    private options: Map<string, string> = new Map();

    constructor(options: { id: string; name: string }[]) {
        super(AddFilterElement);
        this.setOptions(options);
    }

    public postConstruct(): void {
        this.showButton();
    }

    public refresh(newOptions: { id: string; name: string }[]): void {
        this.setOptions(newOptions);
        const { eSelect, options } = this;
        if (eSelect) {
            eSelect.setValueList({ valueList: Array.from(options.keys()), refresh: true });
        }
    }

    private showButton(): void {
        _clearElement(this.getGui());
        this.destroySelect();
        const eButton = _createElement({
            tag: 'button',
            cls: 'ag-button ag-filter-add-button',
            children: [
                { tag: 'span', children: [() => _createIconNoSpan('filterAdd', this.beans)!] },
                {
                    tag: 'span',
                    cls: 'ag-filter-add-button-label',
                    children: translateForFilterPanel(this, 'addFilterCard'),
                },
            ],
        });
        this.activateTabIndex([eButton]);
        const clickListener = this.showSelect.bind(this);
        eButton.addEventListener('click', clickListener);
        this.removeButton = () => {
            eButton.removeEventListener('click', clickListener);
        };
        this.appendChild(eButton);
        eButton.focus();
    }

    private showSelect(): void {
        _clearElement(this.getGui());
        this.destroyButton();

        const pickerAriaLabelKey = 'ariaLabelAddFilterField';
        const selectParams: RichSelectParams = {
            className: 'ag-filter-add-select',
            pickerType: 'virtual-list',
            pickerAriaLabelKey,
            pickerAriaLabelValue: translateForFilterPanel(this, pickerAriaLabelKey),
            placeholder: translateForFilterPanel(this, 'addFilterPlaceholder'),
            value: '',
            valueList: Array.from(this.options.keys()),
            searchType: 'matchAny',
            allowTyping: true,
            filterList: true,
            highlightMatch: true,
            valueFormatter: (value) => this.options.get(value)!,
        };
        const eSelect = this.createManagedBean(new AgRichSelect(selectParams));
        this.eSelect = eSelect;
        this.appendChild(eSelect.getGui());
        eSelect.showPicker();
        eSelect.getFocusableElement().focus();
        eSelect.addManagedListeners(eSelect, {
            fieldPickerValueSelected: ({ value: id }) =>
                this.dispatchLocalEvent({
                    type: 'filterSelected',
                    id,
                }),
            pickerHidden: () => {
                this.showButton();
            },
        });
    }

    private setOptions(newOptions: { id: string; name: string }[]): void {
        const options = this.options;
        options.clear();
        for (const { id, name } of newOptions) {
            options.set(id, name);
        }
    }

    private destroySelect(): void {
        this.eSelect = this.destroyBean(this.eSelect);
    }

    private destroyButton(): void {
        this.removeButton = this.removeButton?.();
    }

    public override destroy(): void {
        this.destroySelect();
        this.destroyButton();
        super.destroy();
    }
}
