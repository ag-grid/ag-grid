import { Autowired, Component, JoinAdvancedFilterModel, _ } from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "../advancedFilterExpressionService";
import { AdvancedFilterBuilderItem, CreatePillParams } from "./iAdvancedFilterBuilder";
import { InputPillComp } from "./inputPillComp";
import { SelectPillComp } from "./selectPillComp";

export class JoinPillWrapperComp extends Component {
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private createPill: (params: CreatePillParams) => SelectPillComp | InputPillComp;
    private filterModel: JoinAdvancedFilterModel;

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
        this.createPill = createPill;
        this.filterModel = item.filterModel as JoinAdvancedFilterModel;
        this.setupJoinCondition(this.filterModel);
    }

    public getDragName(): string {
        return this.advancedFilterExpressionService.parseJoinOperator(this.filterModel);
    }

    private setupJoinCondition(filterModel: JoinAdvancedFilterModel): void {
        const ePill = this.createPill({
            key: filterModel.type,
            displayValue: this.advancedFilterExpressionService.parseJoinOperator(filterModel),
            cssClass: 'ag-advanced-filter-builder-join-pill',
            isSelect: true,
            getEditorParams: () => ({ values: this.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries() }),
            update: (key) => filterModel.type = key as any
        });
        this.getGui().appendChild(ePill.getGui());
    }
}
