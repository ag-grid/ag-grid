import {
    AutocompleteEntry,
    Component,
    Events,
    FieldPickerValueSelectedEvent,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { AddDropdownComp } from "./addDropdownComp";
import { AdvancedFilterBuilderAddEvent, AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";

export class AdvancedFilterBuilderItemAddComp extends Component {
    constructor(private readonly item: AdvancedFilterBuilderItem) {
        super(/* html */ `
            <div class="ag-advanced-filter-builder-item ag-advanced-filter-builder-indent-1" role="presentation"></div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        const eAddButton = this.createManagedBean(new AddDropdownComp({
            pickerAriaLabelKey: 'TODO aria',
            pickerAriaLabelValue: 'TODO aria',
            pickerType: 'ag-list',
            valueList: [{
                key: 'join',
                displayValue: 'Add Join'
            }, {
                key: 'condition',
                displayValue: 'Add Condition'
            }],
            valueFormatter: (value: AutocompleteEntry) =>
                    value == null ? null : value.displayValue ?? value.key,
            pickerIcon: 'advancedFilterBuilderAdd',
            maxPickerWidth: '120px'
        }));
        this.addManagedListener(eAddButton, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, ({ value }: FieldPickerValueSelectedEvent) => {
            this.dispatchEvent<AdvancedFilterBuilderAddEvent>({
                type: AdvancedFilterBuilderEvents.ADD_EVENT,
                item: this.item,
                isJoin: value.key === 'join'
            });
        });
        this.getGui().appendChild(eAddButton.getGui());
    }
}