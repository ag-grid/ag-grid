import {RefSelector} from "../../widgets/componentAnnotations";
import {Component} from "../../widgets/component";
import {Constants} from "../../constants";
import {CombinedFilter} from "../provided/abstractFilter";
import {_} from "../../utils";
import {BaseFloatingFilterChange, IFloatingFilter, IFloatingFilterParams} from "./floatingFilter";

/** Floating Filter that renders into a single text field. Used by Text, Number, ReadModelAsString and Set floating filters. */
export abstract class AbstractTextfieldFloatingFilterComp<M, P extends IFloatingFilterParams<M, BaseFloatingFilterChange<M>>> extends Component implements IFloatingFilter <M, BaseFloatingFilterChange<M>, P> {

    @RefSelector('eColumnFloatingFilter')
    protected eColumnFloatingFilter: HTMLInputElement;

    onFloatingFilterChanged: (change: BaseFloatingFilterChange<M>) => boolean;
    currentParentModel: () => M;
    lastKnownModel: M = null;

    constructor() {
        super(`<div class="ag-input-text-wrapper"><input ref="eColumnFloatingFilter" class="ag-floating-filter-input"></div>`);
    }

    protected abstract asParentModel(): M;

    protected abstract asFloatingFilterText(parentModel: M): string;
    protected abstract parseAsText(model: M): string;

    public init(params: P): void {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        const debounceMs: number = params.debounceMs != null ? params.debounceMs : 500;
        const toDebounce: () => void = _.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'input', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keydown', toDebounce);
        const columnDef = (params.column.getDefinition() as any);
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eColumnFloatingFilter.disabled = true;
        }

    }

    onParentModelChanged(parentModel: M, combinedFilter?: CombinedFilter<M>): void {
        if (combinedFilter != null) {
            this.eColumnFloatingFilter.value = `${this.parseAsText(combinedFilter.condition1)} ${combinedFilter.operator} ${this.parseAsText(combinedFilter.condition2)}`;
            this.eColumnFloatingFilter.disabled = true;
            this.lastKnownModel = null;
            this.eColumnFloatingFilter.title = this.eColumnFloatingFilter.value;
            this.eColumnFloatingFilter.style.cursor = 'default';
            return;
        } else {
            this.eColumnFloatingFilter.disabled = false;
        }

        if (this.equalModels(this.lastKnownModel, parentModel)) {
            // ensure column floating filter text is blanked out when both ranges are empty
            if (!this.lastKnownModel && !parentModel) {
                this.eColumnFloatingFilter.value = '';
            }
            return;
        }
        this.lastKnownModel = parentModel;
        const incomingTextValue = this.asFloatingFilterText(parentModel);
        if (incomingTextValue === this.eColumnFloatingFilter.value) { return; }

        this.eColumnFloatingFilter.value = incomingTextValue;
        this.eColumnFloatingFilter.title = '';
    }

    syncUpWithParentFilter(e: KeyboardEvent): void {
        const model = this.asParentModel();
        if (this.equalModels(this.lastKnownModel, model)) { return; }

        let modelUpdated: boolean = null;
        if (_.isKeyPressed(e, Constants.KEY_ENTER)) {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: true
            });
        } else {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: false
            });
        }

        if (modelUpdated) {
            this.lastKnownModel = model;
        }
    }

    equalModels(left: any, right: any): boolean {
        if (_.referenceCompare(left, right)) { return true; }
        if (!left || !right) { return false; }

        if (Array.isArray(left) || Array.isArray(right)) { return false; }

        return (
            _.referenceCompare(left.type, right.type) &&
            _.referenceCompare(left.filter, right.filter) &&
            _.referenceCompare(left.filterTo, right.filterTo) &&
            _.referenceCompare(left.filterType, right.filterType)
        );
    }
}
