import { IFloatingFilterParams } from "../floatingFilter";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { ProvidedFilterModel } from "../../../interfaces/iFilter";
import { _ } from "../../../utils";
import { Constants } from "../../../constants";
import { ProvidedFilter } from "../../provided/providedFilter";
import { PostConstruct } from "../../../context/context";
import { SimpleFloatingFilter } from "./simpleFloatingFilter";
import { ISimpleFilterModel, SimpleFilter } from "../../provided/simpleFilter";
import { FilterChangedEvent } from "../../../events";

export abstract class TextInputFloatingFilter extends SimpleFloatingFilter {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    protected params: IFloatingFilterParams;

    private applyActive: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(
            `<div class="ag-input-wrapper">
                <input ref="eFloatingFilterText" class="ag-floating-filter-input">
            </div>`);
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sycn. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) { return; }

        this.setLastTypeFromModel(model);
        const modelString = this.getTextFromModel(model);
        this.eFloatingFilterText.value = modelString;
        const editable = this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(editable);
    }

    public init(params: IFloatingFilterParams): void {
        super.init(params);
        this.params = params;

        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());

        const toDebounce: () => void = _.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);

        this.addDestroyableEventListener(this.eFloatingFilterText, 'input', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keydown', toDebounce);

        const columnDef = (params.column.getDefinition() as any);
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eFloatingFilterText.disabled = true;
        }
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const value = this.eFloatingFilterText.value;

        const enterKeyPressed = _.isKeyPressed(e, Constants.KEY_ENTER);
        if (this.applyActive && !enterKeyPressed) { return; }

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const simpleFilter = filterInstance as SimpleFilter<ISimpleFilterModel>;
                simpleFilter.onFloatingFilterChanged(this.getLastType(), value);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.eFloatingFilterText.disabled = !editable;
    }
}
