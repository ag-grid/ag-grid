import { AgCheckbox, Component, ExpressionComponentParams, PostConstruct, RefSelector, SetOperationExpression, StateManager, VirtualList } from "@ag-grid-community/core";
import { GridColumnValuesModel } from "../grid-model/gridColumnValuesModel";
import { ExpressionComponent } from "./interfaces";

const SPECIAL_VALUE_SELECT_ALL = "__AG_GRID_SELECT_ALL__";
const INBUILT_LIST_ITEMS: {label: string, value: string | null}[] = [
    { label: "(Select All)", value: SPECIAL_VALUE_SELECT_ALL },
    { label: "(Blanks)", value: null },
];

export class SetOperandsComponent extends Component implements ExpressionComponent<SetOperationExpression> {
    private readonly gridValuesModel: GridColumnValuesModel;
    private readonly operandAdaptor: SetOperandValuesAdaptor;

    @RefSelector('eWrapper')
    private readonly eWrapper: HTMLElement;

    private stateManager: StateManager<SetOperationExpression>;
    private virtualList: VirtualList;

    public constructor(opts: {
        gridValuesModel: GridColumnValuesModel,
    }) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation" ref="eWrapper" style="height: 144px">
            </div>
        `);

        this.gridValuesModel = opts.gridValuesModel;
        this.operandAdaptor = new SetOperandValuesAdaptor(
            this.gridValuesModel,
            () => this.stateManager?.getTransientExpression()?.operands || null,
            (m) => this.stateManager?.mutateTransientExpression(this, { operands: m }),
        );
    }

    @PostConstruct
    private postConstruct() {
        this.virtualList = this.createBean(new VirtualList('filter', 'listbox', 'Filter List'));
        this.addDestroyFunc(() => this.destroyBean(this.virtualList));

        this.eWrapper.appendChild(this.virtualList.getGui());

        const inbuiltOffset = INBUILT_LIST_ITEMS.length;
        this.virtualList.setComponentCreator(value => this.createListItem(value));
        this.virtualList.setModel({
            getRow: (i) => i < inbuiltOffset ?
                INBUILT_LIST_ITEMS[i] :
                this.gridValuesModel.filterValuesVisible[i - inbuiltOffset],
            getRowCount: () => inbuiltOffset + this.gridValuesModel.filterValuesVisible.length,
            isRowSelected: (i) => this.isListItemSelected(i),
        });

        this.gridValuesModel.addFilterValueListener(this, () => this.refresh());
    }

    public setParameters(params: ExpressionComponentParams<SetOperationExpression>): void {
        this.stateManager = params.stateManager;

        this.stateManager.addTransientUpdateListener(this, () => this.refresh());
        this.stateManager.addUpdateListener(this, () => this.refresh());

        this.refresh();
    }

    private refresh(): void {
        this.virtualList.refresh();
    }

    private isListItemSelected(index: number): boolean {
        const offset = INBUILT_LIST_ITEMS.length;
        return index < offset ? 
            this.isInbuiltListItemSelected(index) :
            this.isFilterValueListItemSelected(index - offset)
    }

    private isFilterValueListItemSelected(index: number): boolean {
        const filterValue = this.gridValuesModel.filterValuesVisible[index];
        return this.isFilterValueSelected(filterValue);
    }

    private isInbuiltListItemSelected(index: number): boolean {
        const inbuiltValue = INBUILT_LIST_ITEMS[index].value;
        return this.isFilterValueSelected(inbuiltValue);
    }

    private isFilterValueSelected(input: string | null): boolean {
        const selectedValues = this.operandAdaptor.operands;
        if (selectedValues == null) { return true; }
        if (selectedValues.length === 0) { return false; }

        return selectedValues.findIndex((v) => v === input) >= 0;
    }

    private createListItem(input: typeof INBUILT_LIST_ITEMS[number] | string | null): Component {
        const listItem = this.createBean(new AgCheckbox());
        this.addDestroyFunc(() => this.destroyBean(listItem));

        const value = typeof input === 'object' ? input?.value : input;
        if (value === SPECIAL_VALUE_SELECT_ALL) {
            listItem.onValueChange((checked) => this.selectAllToggled(!!checked));
        } else if (value == null) {
            listItem.onValueChange((checked) => this.operandAdaptor.toggleValue(null, !!checked));
        } else {
            listItem.onValueChange((checked) => this.operandAdaptor.toggleValue(value, !!checked));
        }

        const label = typeof input === 'object' ? input?.label : input;
        const checked = this.isFilterValueSelected(value != null ? value : null);
        listItem.setLabel(label || '');
        listItem.setValue(checked, true);

        return listItem;
    }

    private selectAllToggled(selected: boolean): void {
        this.operandAdaptor.selectAll(selected);
        this.refresh();
    }
}

export class SetOperandValuesAdaptor {
    public constructor(
        private readonly valuesModel: GridColumnValuesModel,
        private readonly readOperands: () => SetOperationExpression['operands'],
        private readonly updateOperands: (newOperands: SetOperationExpression['operands']) => void,
    ) {
    }

    public get operands(): SetOperationExpression['operands'] {
        return this.readOperands();
    }

    public selectAll(selected: boolean): void {
        if (selected) {
            // Universal set.
            this.updateOperands(null);
        } else {
            // Empty set.
            this.updateOperands([]);
        }
    }

    public isSelectAll(): boolean {
        return this.readOperands() === null;
    }

    public toggleValue(value: string | null, selected: boolean): void {
        const { filterValues } = this.valuesModel;
        const selectedValues = this.readOperands() || filterValues;

        const matchingIndex = selectedValues ? selectedValues.findIndex((v: any) => v === value) : -1;

        let updatedValues;
        if (selected && matchingIndex < 0) {
            updatedValues = selectedValues.concat([value]);
        } else if (!selected && matchingIndex >= 0) {
            updatedValues = [...selectedValues];
            updatedValues.splice(matchingIndex, 1);
        }

        if (updatedValues && updatedValues.length === filterValues.length) {
            updatedValues = null;
        }

        if (updatedValues !== undefined && updatedValues !== selectedValues) {
            this.updateOperands(updatedValues);
        }
    }
}