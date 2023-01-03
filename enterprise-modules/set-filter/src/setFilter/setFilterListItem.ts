import {
    _,
    AgCheckbox,
    AgEvent,
    Autowired,
    ColDef,
    Column,
    Component,
    ISetFilterCellRendererParams,
    SetFilterParams,
    ITooltipParams,
    PostConstruct,
    RefSelector,
    UserComponentFactory,
    ValueFormatterService,
    WithoutGridCommon,
    ValueFormatterParams,
    ICellRendererComp
} from '@ag-grid-community/core';
import { SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { ISetFilterLocaleText } from './localeText';

export interface SetFilterListItemSelectionChangedEvent<
    I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null
> extends AgEvent {
    isSelected: boolean;
    item: I;
}

export interface SetFilterListItemExpandedChangedEvent<
    I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null
> extends AgEvent {
    isExpanded: boolean;
    item: I;
}

export interface SetFilterListItemParams<V> {
    focusWrapper: HTMLElement,
    value: V | null | (() => string),
    params: SetFilterParams<any, V>,
    translate: (key: keyof ISetFilterLocaleText) => string,
    valueFormatter: (params: ValueFormatterParams) => string,
    item: SetFilterModelTreeItem | string | null,
    isSelected: boolean | undefined,
    isTree?: boolean,
    depth?: number,
    groupsExist?: boolean,
    isGroup?: boolean,
    isExpanded?: boolean,
    hasIndeterminateExpandState?: boolean,
}

/** @param V type of value in the Set Filter */
export class SetFilterListItem<V> extends Component {
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';
    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';

    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private static GROUP_TEMPLATE = /* html */`
        <div class="ag-set-filter-item" aria-hidden="true">
            <span class="ag-set-filter-group-icons">
                <span class="ag-set-filter-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-set-filter-group-opened-icon" ref="eGroupOpenedIcon"></span>
                <span class="ag-set-filter-group-indeterminate-icon" ref="eGroupIndeterminateIcon"></span>
            </span>
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;

    private static TEMPLATE = /* html */`
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private readonly eCheckbox: AgCheckbox;

    @RefSelector('eGroupOpenedIcon') private eGroupOpenedIcon: HTMLElement;
    @RefSelector('eGroupClosedIcon') private eGroupClosedIcon: HTMLElement;
    @RefSelector('eGroupIndeterminateIcon') private eGroupIndeterminateIcon: HTMLElement;

    private readonly focusWrapper: HTMLElement;
    private readonly value: V | null | (() => string);
    private readonly params: SetFilterParams<any, V>;
    private readonly translate: (key: keyof ISetFilterLocaleText) => string;
    private readonly valueFormatter: (params: ValueFormatterParams) => string;
    private readonly isTree?: boolean;
    private readonly depth: number;
    private readonly isGroup?: boolean;
    private readonly groupsExist?: boolean
    private readonly hasIndeterminateExpandState?: boolean;

    private item: SetFilterModelTreeItem | string | null;
    private isSelected: boolean | undefined;
    private isExpanded: boolean | undefined;

    private cellRendererParams: ISetFilterCellRendererParams;
    private cellRendererComponent?: ICellRendererComp;

    constructor(params: SetFilterListItemParams<V>) {
        super(params.isGroup ? SetFilterListItem.GROUP_TEMPLATE : SetFilterListItem.TEMPLATE);
        this.focusWrapper = params.focusWrapper;
        this.value = params.value;
        this.params = params.params;
        this.translate = params.translate;
        this.valueFormatter = params.valueFormatter;
        this.item = params.item;
        this.isSelected = params.isSelected;
        this.isTree = params.isTree;
        this.depth = params.depth ?? 0;
        this.isGroup = params.isGroup;
        this.groupsExist = params.groupsExist;
        this.isExpanded = params.isExpanded;
        this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.setLabelEllipsis(true);
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');

        this.refreshVariableAriaLabels();

        if (this.isTree) {
            if (this.depth > 0) {
                this.addCssClass('ag-set-filter-indent-' + this.depth);
            }
            if (this.isGroup) {
                this.setupExpansion();
            } else {
                if (this.groupsExist) {
                    this.addCssClass('ag-set-filter-add-group-indent');
                }
            }

            _.setAriaLevel(this.focusWrapper, this.depth + 1)
        }

        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }

        this.eCheckbox.onValueChange((value) => this.onCheckboxChanged(!!value));
    }

    private setupExpansion(): void {
        this.eGroupClosedIcon.appendChild(_.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));

        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(_.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
            this.addManagedListener(this.eGroupIndeterminateIcon, 'click', this.onExpandOrContractClicked.bind(this));
        }

        this.setExpandedIcons();
        this.refreshAriaExpanded();
    }

    private onExpandOrContractClicked(): void {
        this.setExpanded(!this.isExpanded);
    }

    public setExpanded(isExpanded: boolean | undefined, silent?: boolean): void {
        if (this.isGroup && isExpanded !== this.isExpanded) {
            this.isExpanded = isExpanded;

            const event: SetFilterListItemExpandedChangedEvent = {
                type: SetFilterListItem.EVENT_EXPANDED_CHANGED,
                isExpanded: !!isExpanded,
                item: this.item
            };

            if (!silent) {
                this.dispatchEvent(event);
            }

            this.setExpandedIcons();
            this.refreshAriaExpanded();
        }
    }

    private refreshAriaExpanded(): void {
        _.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    }

    private setExpandedIcons(): void {
        _.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        _.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            _.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
        }
    }

    private onCheckboxChanged(isSelected: boolean): void {
        this.isSelected = isSelected;

        const event: SetFilterListItemSelectionChangedEvent = {
            type: SetFilterListItem.EVENT_SELECTION_CHANGED,
            isSelected,
            item: this.item
        };

        this.dispatchEvent(event);

        this.refreshVariableAriaLabels();
    }

    public toggleSelected(): void {
        if (!!this.params.readOnly) { return; }

        this.setSelected(!this.isSelected);
    }
    
    private setSelected(isSelected: boolean | undefined, silent?: boolean) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(this.isSelected, silent);
    }

    private refreshVariableAriaLabels(): void {
        if (!this.isTree) { return; }
        const translate = this.localeService.getLocaleTextFunc();
        const checkboxValue = this.eCheckbox.getValue();
        const state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') : 
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined as any);
        this.eCheckbox.setInputAriaLabel(`${visibilityLabel} (${state})`);
    }
    
    private setupFixedAriaLabels(value: any): void {
        if (!this.isTree) { return; }
        const translate = this.localeService.getLocaleTextFunc();
        const itemLabel = translate('ariaFilterValue', 'Filter Value');
        _.setAriaLabel(this.focusWrapper, `${value} ${itemLabel}`);
        _.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
    }

    public refresh(item: SetFilterModelTreeItem | string | null, isSelected: boolean | undefined, isExpanded: boolean | undefined): void {
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        this.cellRendererComponent?.refresh?.(this.cellRendererParams as any);
    }

    public render(): void {
        const { params: { column } } = this;

        let { value } = this;
        let formattedValue: string | null = null;

        if (typeof value === 'function') {
            formattedValue = (value as () => string)();
            // backwards compatibility for select all in value
            value = formattedValue as any;
        } else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = _.toStringOrNull(value);
        } else {
            formattedValue = this.getFormattedValue(column, value);
        }

        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : _.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }

        this.cellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context'),
            colDef: this.params.colDef,
            column: this.params.column,
        };

        this.renderCell();
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        return res;
    }

    private getFormattedValue(column: Column, value: any) {
        return this.valueFormatterService.formatValue(column, null, value, this.valueFormatter, false);
    }

    private renderCell(): void {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;

        if (cellRendererPromise == null) {
            let valueToRender = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted) ?? this.translate('blanks');
            if (typeof valueToRender !== 'string') {
                _.doOnce(() => console.warn(
                        'AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'
                    ), 'setFilterComplexObjectsValueFormatter'
                );
                valueToRender = '';
            }

            this.eCheckbox.setLabel(valueToRender);
            this.setupFixedAriaLabels(valueToRender)

            return;
        }

        cellRendererPromise.then(component => {
            if (component) {
                this.cellRendererComponent = component;
                this.eCheckbox.setLabel(component.getGui());
                this.addDestroyFunc(() => this.destroyBean(component));
            }
        });
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }
}
