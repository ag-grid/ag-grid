import {
    Autowired,
    Component,
    Events,
    FieldPickerValueSelectedEvent,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "../advancedFilterExpressionService";
import { AddDropdownComp } from "./addDropdownComp";
import { AdvancedFilterBuilderItemNavigationFeature } from "./advancedFilterBuilderItemNavigationFeature";
import { getAdvancedFilterBuilderAddButtonParams } from "./advancedFilterBuilderUtils";
import { AdvancedFilterBuilderAddEvent, AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";

export class AdvancedFilterBuilderItemAddComp extends Component {
    @Autowired('advancedFilterExpressionService') private readonly advancedFilterExpressionService: AdvancedFilterExpressionService;

    constructor(private readonly item: AdvancedFilterBuilderItem, private readonly focusWrapper: HTMLElement) {
        super(/* html */ `
            <div class="ag-advanced-filter-builder-item ag-advanced-filter-builder-indent-1" role="presentation"></div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        const addButtonParams = getAdvancedFilterBuilderAddButtonParams(key => this.advancedFilterExpressionService.translate(key));
        const eAddButton = this.createManagedBean(new AddDropdownComp(addButtonParams));
        this.addManagedListener(eAddButton, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, ({ value }: FieldPickerValueSelectedEvent) => {
            this.dispatchEvent<AdvancedFilterBuilderAddEvent>({
                type: AdvancedFilterBuilderEvents.EVENT_ADDED,
                item: this.item,
                isJoin: value.key === 'join'
            });
        });
        this.getGui().appendChild(eAddButton.getGui());

        this.createManagedBean(new AdvancedFilterBuilderItemNavigationFeature(
            this.getGui(),
            this.focusWrapper,
            eAddButton
        ));
    }
}