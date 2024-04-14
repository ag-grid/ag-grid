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
    WithoutGridCommon,
    ValueFormatterParams,
    ValueService,
    ICellRendererComp,
    ISetFilterTreeListTooltipParams
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
    valueFormatter?: (params: ValueFormatterParams) => string,
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

    @Autowired('valueService') private readonly valueService: ValueService;
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
    private readonly valueFormatter?: (params: ValueFormatterParams) => string;
    private readonly isTree?: boolean;
    private readonly depth: number;
    private readonly isGroup?: boolean;
    private readonly groupsExist?: boolean
    private readonly hasIndeterminateExpandState?: boolean;

    private item: SetFilterModelTreeItem | string | null;
    private isSelected: boolean | undefined;
    private isExpanded: boolean | undefined;
    // only used for select all
    private valueFunction?: () => string;

    private cellRendererParams: ISetFilterCellRendererParams;
    private cellRendererComponent?: ICellRendererComp;
    private destroyCellRendererComponent?: () => void;

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
        this.addDestroyFunc(() => this.destroyCellRendererComponent?.());

        this.render();

        this.eCheckbox
            .setLabelEllipsis(true)
            .setValue(this.isSelected, true)
            .setDisabled(!!this.params.readOnly)
            .getInputElement().setAttribute('tabindex', '-1');

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

            _.setAriaLevel(this.getAriaElement(), this.depth + 1)
        }

        this.refreshAriaChecked();

        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }

        this.eCheckbox.onValueChange((value) => this.onCheckboxChanged(!!value));
    }

    public getFocusableElement(): HTMLElement {
        return this.focusWrapper;
    }

    private setupExpansion(): void {
        this.eGroupClosedIcon.appendChild(_.createIcon('setFilterGroupClosed', this.gos, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('setFilterGroupOpen', this.gos, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));

        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(_.createIcon('setFilterGroupIndeterminate', this.gos, null));
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
        this.refreshAriaChecked();
    }

    public toggleSelected(): void {
        if (!!this.params.readOnly) { return; }

        this.setSelected(!this.isSelected);
    }
    
    private setSelected(isSelected: boolean | undefined, silent?: boolean) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(isSelected, silent);
        this.refreshAriaChecked();
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
        const ariaEl = this.getAriaElement();
        _.setAriaLabel(ariaEl, `${value} ${itemLabel}`);
        _.setAriaDescribedBy(ariaEl, this.eCheckbox.getInputElement().id);
    }

    private refreshAriaChecked(): void {
        const ariaEl = this.getAriaElement();

        _.setAriaChecked(ariaEl, this.eCheckbox.getValue());
    }

    private refreshAriaExpanded(): void {
        _.setAriaExpanded(this.getAriaElement(), !!this.isExpanded);
    }

    public refresh(item: SetFilterModelTreeItem | string | null, isSelected: boolean | undefined, isExpanded: boolean | undefined): void {
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        if (this.valueFunction) {
            // underlying value might have changed, so call again and re-render
            const value = this.valueFunction();
            this.setTooltipAndCellRendererParams(value as any, value);
            if (!this.cellRendererComponent) {
                this.renderCellWithoutCellRenderer();
            }
        }
        if (this.cellRendererComponent) {
            const success = this.cellRendererComponent.refresh?.(this.cellRendererParams as any);
            if (!success) {
                const oldComponent = this.cellRendererComponent;
                this.renderCell();
                this.destroyBean(oldComponent);
            }
        }
    }

    public render(): void {
        const { params: { column } } = this;

        let { value } = this;
        let formattedValue: string | null = null;

        if (typeof value === 'function') {
            this.valueFunction = value as () => string;
            formattedValue = this.valueFunction();
            // backwards compatibility for select all in value
            value = formattedValue as any;
        } else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = _.toStringOrNull(value);
        } else {
            formattedValue = this.getFormattedValue(column, value);
        }

        this.setTooltipAndCellRendererParams(value, formattedValue);

        this.renderCell();
    }

    private setTooltipAndCellRendererParams(value: V | null | (() => string), formattedValue: string | null): void {
        const isTooltipWhenTruncated = this.gos.get('tooltipShowMode') === 'whenTruncated';

        if (this.params.showTooltips && (!isTooltipWhenTruncated || !this.params.cellRenderer)) {
            const newTooltipText = formattedValue != null ? formattedValue : _.toStringOrNull(value);
            let shouldDisplayTooltip: (() => boolean) | undefined;

            if (isTooltipWhenTruncated) {
                shouldDisplayTooltip = () => {
                    const el = this.eCheckbox.getGui().querySelector('.ag-label');
                    if (!el) { return true; } // show label by default
                    return el.scrollWidth > el.clientWidth;
                }
            }
            this.setTooltip({ newTooltipText, location: 'setFilterValue', shouldDisplayTooltip });
        }

        this.cellRendererParams = this.gos.addGridCommonParams({
            value,
            valueFormatted: formattedValue,
            colDef: this.params.colDef,
            column: this.params.column,
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                this.setTooltip({ newTooltipText: value, location:'setFilterValue', shouldDisplayTooltip });
            }
        });
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        if (this.isTree) {
            (res as ISetFilterTreeListTooltipParams).level = this.depth;
        }
        return res;
    }

    private getFormattedValue(column: Column, value: any) {
        return this.valueService.formatValue(column, null, value, this.valueFormatter, false);
    }

    private renderCell(): void {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;

        if (cellRendererPromise == null) {
            this.renderCellWithoutCellRenderer();
            return;
        }

        cellRendererPromise.then(component => {
            if (component) {
                this.cellRendererComponent = component;
                this.eCheckbox.setLabel(component.getGui());
                this.destroyCellRendererComponent = () => this.destroyBean(component);
            }
        });
    }

    private renderCellWithoutCellRenderer(): void {
        let valueToRender = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted) ?? this.translate('blanks');
        if (typeof valueToRender !== 'string') {
            _.warnOnce(`Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See ${this.getFrameworkOverrides().getDocLink('filter-set-filter-list/#filter-value-types')}`);
            valueToRender = '';
        }

        this.eCheckbox.setLabel(valueToRender);
        this.setupFixedAriaLabels(valueToRender)
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }
}
