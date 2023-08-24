import {
    AdvancedFilterModel,
    AgInputNumberField,
    AgInputTextField,
    AgRichSelect,
    AutocompleteEntry,
    Autowired,
    BaseCellDataType,
    Column,
    ColumnAdvancedFilterModel,
    Component,
    Events,
    JoinAdvancedFilterModel,
    KeyCode,
    PostConstruct,
    RefSelector,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterExpressionService } from "./advancedFilterExpressionService";

export interface AdvancedFilterBuilderRowParams {
    filterModel: AdvancedFilterModel | null;
    level: number;
    parent?: AdvancedFilterModel;
    valid: boolean;
}

class ColumnParser {
    private baseCellDataType: BaseCellDataType;
    private column: Column | undefined;
    private numOperands: number;
    private eColumnPill: HTMLElement;
    private eOperatorPill: HTMLElement | undefined;
    private eOperandPill: HTMLElement | undefined;
    private valid: boolean = true;

    constructor(
        private advancedFilterExpressionService: AdvancedFilterExpressionService,
        private filterModel: ColumnAdvancedFilterModel,
        private eParent: HTMLElement,
        private createPill: (
            getKey: () => string,
            getDisplayValue: () => string,
            baseCellDataType: BaseCellDataType | undefined,
            backgroundColor: string,
            getEditorParams: () => { values?: any[] },
            update: (key: string) => void
        ) => HTMLElement,
        private updateValidity: (valid: boolean) => void
    ) {
        const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
        this.baseCellDataType = columnDetails?.baseCellDataType ?? 'text';
        this.column = columnDetails?.column;
        this.numOperands = this.getNumOperands(this.getOperatorKey());
    }

    public render(): void {
        _.clearElement(this.eParent);
        this.eColumnPill = this.createPill(
            () => this.getColumnKey(),
            () => this.getColumnDisplayValue() ?? 'Select a column',
            this.baseCellDataType,
            'lightcyan',
            () => ({ values: this.advancedFilterExpressionService.getColumnAutocompleteEntries() }),
            (key) => this.setColumnKey(key)
        );
        this.eParent.appendChild(this.eColumnPill);

        if (_.exists(this.getColumnKey())) {
            this.createOperatorPill();
            if (this.hasOperand()) {
                this.createOperandPill();
            }
        }
    }

    private createOperatorPill(): void {
        this.eOperatorPill = this.createPill(
            () => this.getOperatorKey(),
            () => this.getOperatorDisplayValue() ?? 'Select an option',
            this.baseCellDataType,
            'lightgreen',
            () => ({ values: this.getOperatorAutocompleteEntries() }),
            (key) => this.setOperatorKey(key),
        );
        this.eParent.appendChild(this.eOperatorPill);
    }

    private createOperandPill(): void {
        const getKey = () => this.getOperandDisplayValue() ?? '';
        this.eOperandPill = this.createPill(getKey, getKey, this.baseCellDataType, 'lightgrey', () => ({}), (key) => this.setOperand(key));
        this.eParent.appendChild(this.eOperandPill);
    }

    private getColumnKey(): string {
        return this.filterModel.colId;
    }

    private getColumnDisplayValue(): string {
        return this.advancedFilterExpressionService.parseColumnName(this.filterModel);
    }

    private getOperatorKey(): string {
        return this.filterModel.type;
    }

    private getOperatorDisplayValue(): string {
        return this.advancedFilterExpressionService.parseOperator(this.filterModel);
    }

    private getOperandDisplayValue(): string {
        return this.advancedFilterExpressionService.parseOperand(this.filterModel, true);
    }

    private hasOperand(): boolean {
        return this.numOperands > 0;
    }

    private getOperatorAutocompleteEntries(): AutocompleteEntry[] {
        return this.column
            ? this.advancedFilterExpressionService.getOperatorAutocompleteEntries(
                this.column,
                this.baseCellDataType
            )
            : [];
    }

    private setColumnKey(colId: string): void {
        if (!this.eOperatorPill) {
            this.createOperatorPill();
        }

        const newColumnDetails = this.advancedFilterExpressionService.getColumnDetails(colId);
        this.column = newColumnDetails?.column;
        const newBaseCellDataType = newColumnDetails?.baseCellDataType ?? 'text';
        if (this.baseCellDataType !== newBaseCellDataType) {
            this.baseCellDataType = newBaseCellDataType;

            this.setOperatorKey(undefined as any);
            this.setPillValue(this.eOperatorPill, 'Select an option');
            this.validate();
        }
        this.filterModel.colId = colId;
        this.filterModel.filterType = this.baseCellDataType;
    }

    private setOperatorKey(operator: string): void {
        const newNumOperands = this.getNumOperands(operator);
        if (newNumOperands !== this.numOperands) {
            this.numOperands = newNumOperands;
            if (newNumOperands === 0) {
                this.destroyOperandPill();
            } else {
                this.createOperandPill();
                if (this.baseCellDataType !== 'number') {
                    this.setOperand('');
                }
            }

        }
        this.filterModel.type = operator as any;
        this.validate();
    }

    private setOperand(operand: string): void {
        let parsedOperand: string | number = operand;
        if (this.baseCellDataType === 'number') {
            parsedOperand = parseFloat(operand);
        }
        (this.filterModel as any).filter = parsedOperand;
        this.validate();
    }

    private getNumOperands(operator: string): number {
        return this.advancedFilterExpressionService.getExpressionOperator(this.baseCellDataType, operator)?.numOperands ?? 0;
    }

    private setPillValue(ePill: HTMLElement | undefined, value: string): void {
        const innerElement = ePill?.firstChild as HTMLElement | undefined;
        if (innerElement) {
            innerElement.innerText = value;
        }
    }

    private destroyOperandPill(): void {
        delete (this.filterModel as any).filter;
        this.eParent.removeChild(this.eOperandPill!);
        this.eOperandPill = undefined;
    }

    private validate(): void {
        const valid = _.exists(this.getColumnKey()) &&
            _.exists(this.getOperatorKey()) &&
            (
                this.numOperands === 0 ||
                !(this.baseCellDataType === 'number' && !_.exists(this.getOperandDisplayValue()))
            );

        if (valid !== this.valid) {
            this.valid = valid;
            this.updateValidity(valid);
        }
    }
}

export class AdvancedFilterBuilderRowComp extends Component {
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;
    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    private params: AdvancedFilterBuilderRowParams;

    constructor() {
        super(/* html */ `
            <div class="ag-autocomplete-row" style="justify-content: space-between; margin-top: 4px; margin-bottom: 4px" role="presentation">
                <div style="display: flex; align-items: center; height: 100%">
                    <span ref="eDragHandle" class="ag-drag-handle" role="presentation"></span>
                    <div style="display: flex; align-items: center; height: 100%" ref="eLabel"></div>
                </div>
                <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
            </div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsService)!);
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsService)!);

        this.addManagedListener(this.eButton, 'click', (event: MouseEvent) => {
            event.stopPropagation();
            this.removeFromModel();
            this.dispatchEvent({
                type: 'remove',
                row: this.params
            });
        })
    }

    public setState(params: AdvancedFilterBuilderRowParams): void {
        this.params = params;
        const { filterModel, level } = params;
        this.setupCondition(filterModel!);
        if (level === 0) {
            _.setDisplayed(this.eDragHandle, false);
            _.setDisplayed(this.eButton, false);
            this.getGui().style.marginLeft = '16px';
        } else {
            this.getGui().style.marginLeft = `${level * 20}px`;
        }
    }

    private setupCondition(filterModel: AdvancedFilterModel): void {
        if (filterModel.filterType === 'join') {
            this.setupJoinCondition(filterModel);
        } else {
            this.setupColumnCondition(filterModel);
        }
    }

    private setupJoinCondition(filterModel: JoinAdvancedFilterModel): void {
        _.clearElement(this.eLabel);
        this.eLabel.appendChild(
            this.createPill(
                () => filterModel.type,
                () => this.advancedFilterExpressionService.parseJoinOperator(filterModel),
                undefined,
                'lightpink',
                () => ({ values: this.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries() }),
                (key) => filterModel.type = key as any
            )
        );
    }

    private setupColumnCondition(filterModel: ColumnAdvancedFilterModel): void {
        const columnParser = new ColumnParser(this.advancedFilterExpressionService, filterModel, this.eLabel, this.createPill.bind(this), valid => {
            this.params.valid = valid;
            this.dispatchEvent({
                type: 'validChanged'
            });
        });
        columnParser.render();
    }

    private createPill(
        getKey: () => string,
        getDisplayValue: () => string,
        baseCellDataType: BaseCellDataType | undefined,
        backgroundColor: string,
        getEditorParams: () => { values?: any[] },
        update: (key: string) => void
    ): HTMLElement {
        const ePillWrapper = document.createElement('div');
        ePillWrapper.style.margin = '0px 4px';
        ePillWrapper.style.height = '100%';
        ePillWrapper.style.display = 'flex';
        ePillWrapper.style.alignItems = 'center';
        const ePill = document.createElement('span');
        ePill.style.borderRadius = 'var(--ag-border-radius)';
        ePill.style.padding = '4px 8px';
        ePill.style.backgroundColor = backgroundColor;
        ePill.style.minHeight = 'calc(100% - 16px)';
        ePill.style.minWidth = '8px';
        ePill.innerText = getDisplayValue();
        ePill.addEventListener('click', () =>
            this.showEditor(
                ePillWrapper,
                ePill,
                getKey,
                getDisplayValue,
                baseCellDataType,
                getEditorParams,
                update
            )
        );
        ePillWrapper.appendChild(ePill);
        return ePillWrapper;
    }

    private showEditor(
        ePillWrapper: HTMLElement,
        ePill: HTMLElement,
        getKey: () => string,
        getDisplayValue: () => string,
        baseCellDataType: BaseCellDataType | undefined,
        getEditorParams: () => { values?: AutocompleteEntry[] },
        update: (key: string) => void
    ): void {
        _.setDisplayed(ePill, false);
        const { values } = getEditorParams();
        let eEditor: Component;
        const removeEditor = () => {
            ePill.innerText = getDisplayValue();
            ePillWrapper.removeChild(eEditor.getGui());
            this.destroyBean(eEditor);
            _.setDisplayed(ePill, true);
            this.dispatchEvent({
                type: 'editEnd'
            });
        };
        const onUpdated = (key: string) => {
            update(key)
            removeEditor();
        };
        this.dispatchEvent({
            type: 'editStart',
            removeEditor
        });
        if (values) {
            eEditor = this.setupRichSelectEditor(ePillWrapper, getKey, getDisplayValue, values, onUpdated);
        } else {
            eEditor = this.setupTextEditor(ePillWrapper, getDisplayValue, baseCellDataType, onUpdated);
        }
    }

    private setupRichSelectEditor(
        ePillWrapper: HTMLElement,
        getKey: () => string,
        getDisplayValue: () => string,
        valueList: AutocompleteEntry[],
        onUpdated: (key: string) => void
    ): AgRichSelect {
        const key = getKey();
        const value = valueList.find(value => value.key === key) ?? {
            key,
            displayValue: getDisplayValue()
        };
        const eEditor = this.createBean(
            new AgRichSelect({
                pickerAriaLabelKey: 'TODO aria',
                pickerAriaLabelValue: 'TODO aria',
                pickerType: 'ag-list',
                valueList,
                value,
                valueFormatter: (value: AutocompleteEntry) =>
                    value == null ? null : value.displayValue ?? value.key,
            })
        );
        this.addManagedListener(eEditor, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, ({ value }) =>
            onUpdated(value.key)
        );
        const eEditorGui = eEditor.getGui();
        eEditorGui.style.minWidth = '160px';
        ePillWrapper.appendChild(eEditorGui);
        eEditor.showPicker();
        eEditor.getFocusableElement().focus();
        return eEditor;
    }

    private setupTextEditor(
        ePillWrapper: HTMLElement,
        getDisplayValue: () => string,
        baseCellDataType: BaseCellDataType | undefined,
        onUpdated: (key: string) => void,
    ): AgInputTextField {
        const eEditor = this.createBean(baseCellDataType === 'number' ? new AgInputNumberField() : new AgInputTextField());
        eEditor.setValue(getDisplayValue());
        const eEditorGui = eEditor.getGui();
        eEditorGui.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === KeyCode.ENTER) {
                event.preventDefault();
                onUpdated(eEditor.getValue() ?? '');
            }
        });
        ePillWrapper.appendChild(eEditorGui);
        eEditor.getFocusableElement().focus();
        return eEditor;
    }

    private removeFromModel(): void {
        const parent = this.params.parent as JoinAdvancedFilterModel;
        const { filterModel } = this.params;
        const index = parent.conditions.indexOf(filterModel!);
        parent.conditions.splice(index, 1);
    }
}


export class AdvancedFilterBuilderRowAddComp extends Component {
    @RefSelector('eButton') private eButton: HTMLElement;

    private params: AdvancedFilterBuilderRowParams;

    constructor() {
        super(/* html */ `
        <div class="ag-autocomplete-row" role="presentation">
            <span ref="eButton" role="presentation">&nbsp;+</span>
        </div>
        `);
    }

    @PostConstruct
    private postConstruct(): void {
        // this.eButton.appendChild(_.createIconNoSpan('plus', this.gridOptionsService)!);
        this.addGuiEventListener('click', () => {
            this.dispatchEvent({
                type: 'add',
                row: this.params
            });
        });
    }

    public setState(params: AdvancedFilterBuilderRowParams): void {
        this.params = params;
        const { level } = params;
        this.getGui().style.marginLeft = `${ level * 20 }px`;
    }
}