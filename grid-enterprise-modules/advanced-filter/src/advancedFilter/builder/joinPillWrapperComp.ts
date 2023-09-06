import { Autowired, Component, JoinAdvancedFilterModel, _ } from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "../advancedFilterExpressionService";
import { AdvancedFilterBuilderItem, CreatePillParams } from "./iAdvancedFilterBuilder";
import { InputPillComp } from "./inputPillComp";
import { SelectPillComp } from "./selectPillComp";

export class JoinPillWrapperComp extends Component {
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private filterModel: JoinAdvancedFilterModel;
    private ePill: SelectPillComp | InputPillComp;

    constructor() {
        super(/* html */`
            <div class="ag-advanced-filter-builder-item-condition"></div>
        `);
    }

    public init(params: {
        item: AdvancedFilterBuilderItem,
        createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp
    }): void {
        const { item, createPill } = params;
        const filterModel = item.filterModel as JoinAdvancedFilterModel;
        this.filterModel = filterModel;

        this.ePill = createPill({
            key: filterModel.type,
            displayValue: this.advancedFilterExpressionService.parseJoinOperator(filterModel),
            cssClass: 'ag-advanced-filter-builder-join-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries() }),
            update: (key) => filterModel.type = key as any
        });
        this.getGui().appendChild(this.ePill.getGui());
        this.addDestroyFunc(() => this.destroyBean(this.ePill));
    }

    public getDragName(): string {
        return this.advancedFilterExpressionService.parseJoinOperator(this.filterModel);
    }

    public getValidationMessage(): string | null {
        return null;
    }

    public getFocusableElement(): HTMLElement {
        return this.ePill.getFocusableElement();
    }
}
