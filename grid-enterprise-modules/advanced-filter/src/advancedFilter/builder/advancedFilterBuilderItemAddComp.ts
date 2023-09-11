import {
    Autowired,
    Beans,
    Component,
    Events,
    FieldPickerValueSelectedEvent,
    PostConstruct,
    TooltipFeature,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "../advancedFilterExpressionService";
import { AddDropdownComp } from "./addDropdownComp";
import { AdvancedFilterBuilderItemNavigationFeature } from "./advancedFilterBuilderItemNavigationFeature";
import { getAdvancedFilterBuilderAddButtonParams } from "./advancedFilterBuilderUtils";
import { AdvancedFilterBuilderAddEvent, AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";

export class AdvancedFilterBuilderItemAddComp extends Component {
    @Autowired('beans') private readonly beans: Beans;
    @Autowired('advancedFilterExpressionService') private readonly advancedFilterExpressionService: AdvancedFilterExpressionService;

    constructor(private readonly item: AdvancedFilterBuilderItem, private readonly focusWrapper: HTMLElement) {
        super(/* html */ `
            <div class="ag-advanced-filter-builder-item ag-advanced-filter-builder-indent-1" role="presentation"></div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        _.setAriaLevel(this.focusWrapper, 2);

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

        const tooltipFeature = this.createManagedBean(new TooltipFeature({
            getGui: () => eAddButton.getGui(),
            getLocation: () => 'advancedFilter',
            getTooltipValue: () => this.advancedFilterExpressionService.translate('advancedFilterBuilderAddButtonTooltip')
        }, this.beans));
        tooltipFeature.setComp(eAddButton.getGui());

        this.createManagedBean(new AdvancedFilterBuilderItemNavigationFeature(
            this.getGui(),
            this.focusWrapper,
            eAddButton
        ));
    }

    public afterAdd(): void {
        // do nothing
    }
}