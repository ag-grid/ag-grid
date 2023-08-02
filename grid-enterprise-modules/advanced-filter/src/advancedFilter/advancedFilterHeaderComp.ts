import {
    Autowired,
    ColumnModel,
    Component,
    FilterManager,
    PostConstruct,
    RefSelector,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterComp } from "./advancedFilterComp";

export class AdvancedFilterHeaderComp extends Component {
    @RefSelector('eAdvancedFilterHeader') private eAdvancedFilterHeader: HTMLElement;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private eAdvancedFilter: AdvancedFilterComp | undefined;
    private enabled = false;

    constructor() {
        super(/* html */ `
            <div class="ag-advanced-filter-header" role="presentation" ref="eAdvancedFilterHeader">
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        _.setDisplayed(this.eAdvancedFilterHeader, false);
        this.setupAdvancedFilter(this.filterManager.isAdvancedFilterEnabled());

        this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));
    }

    private setupAdvancedFilter(enabled: boolean): void {
        if (enabled === this.enabled) { return; }
        if (enabled) {
            // unmanaged as can be recreated
            this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
            const eGui = this.eAdvancedFilter.getGui();
            
            const height = `${this.columnModel.getFloatingFiltersHeight() + 1}px`;
            this.eAdvancedFilter.getGui().style.height = height;
            this.eAdvancedFilter.getGui().style.minHeight = height;

            this.eAdvancedFilterHeader.appendChild(eGui);
        } else {
            _.clearElement(this.eAdvancedFilterHeader);
            this.destroyBean(this.eAdvancedFilter)
        }
        _.setDisplayed(this.eAdvancedFilterHeader, enabled);
        this.enabled = enabled;
    }
}
