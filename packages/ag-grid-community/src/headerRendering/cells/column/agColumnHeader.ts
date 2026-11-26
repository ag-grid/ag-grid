import { RefPlaceholder, _removeFromParent, _setDisplayed, _toString } from 'ag-stack';

import { _getInnerHeaderCompDetails } from '../../../components/framework/userCompUtils';
import type { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import type { AgColumn } from '../../../entities/agColumn';
import { _isLegacyMenuEnabled } from '../../../gridOptionsUtils';
import type { IHeaderComp, IHeaderParams, IInnerHeaderComponent } from '../../../interfaces/iHeader';
import type { PopupToggleResult } from '../../../misc/menu/menuService';
import type { SortIndicatorComp } from '../../../sort/sortIndicatorComp';
import type { ElementParams } from '../../../utils/element';
import type { IconName } from '../../../utils/icon';
import { _createIconNoSpan } from '../../../utils/icon';
import { Component } from '../../../widgets/component';
import { getColumnHeaderMenuAnchor } from '../../headerUtils';
import { _addPopupToggleButtonListeners } from '../popupToggleButton';
import { HeaderCellMouseListenerFeature } from './headerCellMouseListenerFeature';

/** The default template's indicators as bits, so two headers needing the same template compare equal. */
const COLUMN_REF_INDICATOR = 1;
const CALCULATED_COLUMN_INDICATOR = 2;
const SORT_INDICATOR = 4;
const SHOW_VALUES_AS_INDICATOR = 8;

function getHeaderCompElementParams(indicators: number): ElementParams {
    const includeColumnRefIndicator = (indicators & COLUMN_REF_INDICATOR) !== 0;
    const includeCalculatedColumnIndicator = (indicators & CALCULATED_COLUMN_INDICATOR) !== 0;
    const includeSortIndicator = (indicators & SORT_INDICATOR) !== 0;
    const includeShowValuesAsIndicator = (indicators & SHOW_VALUES_AS_INDICATOR) !== 0;
    const hiddenAttrs = { 'aria-hidden': 'true' };
    return {
        tag: 'div',
        cls: 'ag-cell-label-container',
        role: 'presentation',
        children: [
            {
                tag: 'span',
                ref: 'eMenu',
                cls: 'ag-header-icon ag-header-cell-menu-button',
                attrs: hiddenAttrs,
            },
            {
                tag: 'span',
                ref: 'eFilterButton',
                cls: 'ag-header-icon ag-header-cell-filter-button',
                attrs: hiddenAttrs,
            },
            {
                tag: 'div',
                ref: 'eLabel',
                cls: 'ag-header-cell-label',
                role: 'presentation',
                children: [
                    includeColumnRefIndicator ? { tag: 'span', ref: 'eColRef', cls: 'ag-header-col-ref' } : null,
                    includeCalculatedColumnIndicator
                        ? {
                              tag: 'span',
                              ref: 'eCalculatedColumn',
                              cls: 'ag-header-icon ag-calculated-column-icon',
                              attrs: hiddenAttrs,
                          }
                        : null,
                    { tag: 'span', ref: 'eText', cls: 'ag-header-cell-text' },
                    {
                        tag: 'span',
                        ref: 'eFilter',
                        cls: 'ag-header-icon ag-header-label-icon ag-filter-icon',
                        attrs: hiddenAttrs,
                    },
                    includeShowValuesAsIndicator
                        ? {
                              tag: 'span',
                              ref: 'eShowValuesAs',
                              cls: 'ag-header-icon ag-header-label-icon ag-show-values-as-icon',
                              attrs: hiddenAttrs,
                          }
                        : null,
                    includeSortIndicator ? { tag: 'ag-sort-indicator', ref: 'eSortIndicator' } : null,
                ],
            },
        ],
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgColumnHeader extends Component implements IHeaderComp {
    // All the elements are optional, as they are not guaranteed to be present if the user provides a custom template
    private readonly eFilter?: HTMLElement = RefPlaceholder;
    private readonly eShowValuesAs?: HTMLElement = RefPlaceholder;
    public eFilterButton?: HTMLElement = RefPlaceholder;
    private eSortIndicator?: SortIndicatorComp = RefPlaceholder;
    public eMenu?: HTMLElement = RefPlaceholder;
    private readonly eLabel?: HTMLElement = RefPlaceholder;
    private readonly eText?: HTMLElement = RefPlaceholder;
    private readonly eColRef?: HTMLElement = RefPlaceholder;
    private readonly eCalculatedColumn?: HTMLElement = RefPlaceholder;

    /**
     * Selectors for custom headers templates, i.e when the ag-sort-indicator is not present.
     */
    private readonly eSortOrder?: HTMLElement = RefPlaceholder;
    private readonly eSortAsc?: HTMLElement = RefPlaceholder;
    private readonly eSortDesc?: HTMLElement = RefPlaceholder;
    private readonly eSortMixed?: HTMLElement = RefPlaceholder;
    private readonly eSortNone?: HTMLElement = RefPlaceholder;
    private readonly eSortAbsoluteAsc?: HTMLElement = RefPlaceholder;
    private readonly eSortAbsoluteDesc?: HTMLElement = RefPlaceholder;

    public params: IHeaderParams;

    private currentDisplayName: string;
    /** A custom template, or the default template's indicators. */
    private currentTemplate: string | number | null | undefined;
    private currentShowMenu: boolean;
    private currentSuppressMenuHide: boolean;
    private currentSort: boolean | undefined;
    private currentRef: string | null;

    private innerHeaderComponent: IInnerHeaderComponent | undefined;
    private isLoadingInnerComponent: boolean = false;

    private mouseListener?: HeaderCellMouseListenerFeature;
    /** The inner header component class the colDef named when this header was built. */
    private innerHeaderComponentClass: unknown;

    public getTooltipTextElement(): HTMLElement | undefined {
        return this.innerHeaderComponent || this.isLoadingInnerComponent ? undefined : this.eText;
    }

    public refresh(params: IHeaderParams): boolean {
        const oldParams = this.params;
        this.params = params;

        // if template changed, then recreate the whole comp, the code required to manage
        // a changing template is to difficult for what it's worth.
        if (
            this.workOutTemplate(params, !!this.beans?.sortSvc) != this.currentTemplate ||
            this.workOutShowMenu() != this.currentShowMenu ||
            params.enableSorting != this.currentSort ||
            (params.column as AgColumn).formulaRef != this.currentRef ||
            (this.currentSuppressMenuHide != null && this.shouldSuppressMenuHide() != this.currentSuppressMenuHide) ||
            oldParams.enableFilterButton != params.enableFilterButton ||
            oldParams.enableFilterIcon != params.enableFilterIcon ||
            // a still loading inner header would miss this refresh; a new one is the colDef's to build
            this.isLoadingInnerComponent
        ) {
            return false;
        }

        // resolved as init resolves it, so a registered name and its class count as one component
        const innerCompDetails = _getInnerHeaderCompDetails(this.beans.userCompFactory, params, params);
        const innerHeaderComponent = this.innerHeaderComponent;
        if (innerCompDetails?.componentClass !== this.innerHeaderComponentClass) {
            return false;
        }
        if (!innerHeaderComponent) {
            this.setDisplayName(params);
        } else if (!innerHeaderComponent.refresh?.(innerCompDetails!.params)) {
            // one without refresh, or whose refresh fails, is recreated
            return false;
        }
        this.refreshShowValuesAs();
        // a redefined group column may show another column's sort
        this.refreshSortStyles();
        this.eSortIndicator?.refresh();

        return true;
    }

    private workOutTemplate(params: IHeaderParams, isSorting: boolean): string | number {
        const { formula, showValuesAsSvc } = this.beans;
        const paramsTemplate = params.template;
        if (paramsTemplate) {
            // take account of any newlines & whitespace before/after the actual template
            return paramsTemplate?.trim ? paramsTemplate.trim() : paramsTemplate;
        }
        return (
            (formula?.active ? COLUMN_REF_INDICATOR : 0) |
            ((params.column as AgColumn).isCalculatedCol ? CALCULATED_COLUMN_INDICATOR : 0) |
            (isSorting ? SORT_INDICATOR : 0) |
            (showValuesAsSvc ? SHOW_VALUES_AS_INDICATOR : 0)
        );
    }

    public init(params: IHeaderParams): void {
        this.params = params;

        const { sortSvc, touchSvc, rowNumbersSvc, userCompFactory } = this.beans;
        const sortComp = sortSvc?.SortIndicatorSelector;
        const template = this.workOutTemplate(params, !!sortComp);
        this.currentTemplate = template;
        this.setTemplate(
            typeof template === 'string' ? template : getHeaderCompElementParams(template),
            sortComp ? [sortComp] : undefined
        );

        if (this.eLabel) {
            this.mouseListener ??= this.createManagedBean(
                new HeaderCellMouseListenerFeature(params.column as AgColumn, this.eLabel)
            );
        }

        touchSvc?.setupForHeader(this);

        this.setMenu();
        this.setupSort();
        this.setupColumnRefIndicator();
        this.setupCalculatedColumnIcon();
        rowNumbersSvc?.setupForHeader(this);
        this.setupFilterIcon();
        this.setupFilterButton();
        this.setupShowValuesAsIcon();
        this.workOutInnerHeaderComponent(userCompFactory, params);
        this.setDisplayName(params);
    }

    private workOutInnerHeaderComponent(userCompFactory: UserComponentFactory, params: IHeaderParams): void {
        const userCompDetails = _getInnerHeaderCompDetails(userCompFactory, params, params);
        this.innerHeaderComponentClass = userCompDetails?.componentClass;
        if (!userCompDetails) {
            return;
        }

        this.isLoadingInnerComponent = true;

        userCompDetails.newAgStackInstance().then((comp) => {
            this.isLoadingInnerComponent = false;

            if (!comp) {
                return;
            }

            if (this.isAlive()) {
                this.innerHeaderComponent = comp;
                if (this.eText) {
                    this.eText.appendChild(comp.getGui());
                }
            } else {
                this.destroyBean(comp);
            }
        });
    }

    private setDisplayName(params: IHeaderParams) {
        const { displayName } = params;
        const oldDisplayName = this.currentDisplayName;
        this.currentDisplayName = displayName;

        if (
            !this.eText ||
            oldDisplayName === displayName ||
            this.innerHeaderComponent ||
            this.isLoadingInnerComponent
        ) {
            return;
        }
        this.eText.textContent = _toString(displayName);
    }

    private addInIcon(iconName: IconName, eParent: HTMLElement, column: AgColumn): void {
        const eIcon = _createIconNoSpan(iconName, this.beans, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }

    private workOutShowMenu(): boolean {
        return this.params.enableMenu && !!this.beans.menuSvc?.isHeaderMenuButtonEnabled();
    }

    public shouldSuppressMenuHide(): boolean {
        return !!this.beans.menuSvc?.isHeaderMenuButtonAlwaysShowEnabled();
    }

    private setMenu(): void {
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }

        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            _removeFromParent(this.eMenu);
            this.eMenu = undefined;
            return;
        }

        const { gos, eMenu, params } = this;

        const isLegacyMenu = _isLegacyMenuEnabled(gos);
        this.addInIcon(isLegacyMenu ? 'menu' : 'menuAlt', eMenu, params.column as AgColumn);
        eMenu.classList.toggle('ag-header-menu-icon', !isLegacyMenu);

        const currentSuppressMenuHide = this.shouldSuppressMenuHide();
        this.currentSuppressMenuHide = currentSuppressMenuHide;
        _addPopupToggleButtonListeners(this, eMenu, () => this.toggleColumnMenu(eMenu));
        this.toggleMenuAlwaysShow(currentSuppressMenuHide);
        this.addTooltip({
            control: 'columnMenu',
            getGui: () => eMenu,
            getLocation: () => 'header',
            getTooltip: () => ({
                value: this.getLocaleTextFunc()('tooltipColumnMenu', 'Open column menu'),
                params: { column: this.params.column },
            }),
        });
    }

    private toggleMenuAlwaysShow(alwaysShow: boolean): void {
        this.eMenu?.classList.toggle('ag-header-menu-always-show', alwaysShow);
    }

    private showColumnMenu(element: HTMLElement): void {
        const { currentSuppressMenuHide, params } = this;
        if (!currentSuppressMenuHide) {
            this.toggleMenuAlwaysShow(true);
        }
        params.showColumnMenu(element, () => {
            if (!currentSuppressMenuHide) {
                this.toggleMenuAlwaysShow(false);
            }
        });
    }

    private toggleColumnMenu(element: HTMLElement): PopupToggleResult {
        const { currentSuppressMenuHide, params } = this;
        const result =
            this.beans.menuSvc?.toggleColumnMenu({
                column: params.column,
                buttonElement: element,
                getButtonElement: () => getColumnHeaderMenuAnchor(this.beans, params.column as AgColumn),
                positionBy: 'button',
                onClosedCallback: () => {
                    if (!currentSuppressMenuHide) {
                        this.toggleMenuAlwaysShow(false);
                    }
                },
            }) ?? 'declined';

        if (result === 'opened' && !currentSuppressMenuHide) {
            this.toggleMenuAlwaysShow(true);
        }
        return result;
    }

    public onMenuKeyboardShortcut(isFilterShortcut: boolean): boolean {
        const { params, gos, beans, eMenu, eFilterButton } = this;
        const column = params.column as AgColumn;
        const isLegacyMenuEnabled = _isLegacyMenuEnabled(gos);
        if (isFilterShortcut && !isLegacyMenuEnabled) {
            if (beans.menuSvc?.isFilterMenuInHeaderEnabled(column)) {
                params.showFilter(eFilterButton ?? eMenu ?? this.getGui());
                return true;
            }
        } else if (params.enableMenu) {
            this.showColumnMenu(eMenu ?? eFilterButton ?? this.getGui());
            return true;
        }
        return false;
    }

    private setupSort(): void {
        const { sortSvc } = this.beans;
        if (!sortSvc) {
            return;
        }
        const { enableSorting, column } = this.params;
        this.currentSort = enableSorting;

        // eSortIndicator will not be present when customers provided custom header
        // templates, in that case, we need to look for provided sort elements and
        // manually create eSortIndicator.
        if (!this.eSortIndicator) {
            this.eSortIndicator = this.createManagedBean(new sortSvc.SortIndicatorComp(true));
            const {
                eSortIndicator,
                eSortOrder,
                eSortAsc,
                eSortDesc,
                eSortMixed,
                eSortNone,
                eSortAbsoluteAsc,
                eSortAbsoluteDesc,
            } = this;
            eSortIndicator.attachCustomElements(
                eSortOrder,
                eSortAsc,
                eSortDesc,
                eSortMixed,
                eSortNone,
                eSortAbsoluteAsc,
                eSortAbsoluteDesc
            );
        }
        this.eSortIndicator.setupSort(column as AgColumn);

        // we set up the indicator prior to the check for whether this column is sortable, as it allows the indicator to
        // set up the multi sort indicator which can appear irrelevant of whether this column can itself be sorted.
        // this can occur in the case of a non-sortable group display column.
        this.refreshSortStyles();
    }

    /** Called by the header cell as a sort, or the row grouping a group column's sort reflects, changes. */
    public refreshSortStyles(): void {
        if (!this.currentSort) {
            return;
        }
        this.beans.sortSvc?.refreshHeaderStyles(this, this.params.column as AgColumn);
    }

    private setupColumnRefIndicator(): void {
        const { eColRef, params } = this;
        if (!eColRef) {
            return;
        }
        this.currentRef = (params.column as AgColumn).formulaRef;
        eColRef.textContent = this.currentRef;
        // a cell drawn while a formula cell is edited shows it at once
        const shown = !!this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.formulaRefsShown;
        _setDisplayed(eColRef, shown && !!this.currentRef);
    }

    /** The column's formula reference shows while a cell taking formulas is edited. */
    public setFormulaRefShown(shown: boolean): void {
        const eColRef = this.eColRef;
        if (eColRef) {
            _setDisplayed(eColRef, shown && !!this.currentRef);
        }
    }

    private setupCalculatedColumnIcon(): void {
        const { eCalculatedColumn, params } = this;

        if (!eCalculatedColumn) {
            return;
        }

        this.addInIcon('calculatedColumnsHeader', eCalculatedColumn, params.column as AgColumn);
    }

    private setupFilterIcon(): void {
        const { eFilter, params } = this;
        if (!eFilter) {
            return;
        }
        const onFilterChangedIcon = () => {
            const filterPresent = params.column.isFilterActive();
            _setDisplayed(eFilter, filterPresent, { skipAriaHidden: true });
        };
        this.configureFilter(params.enableFilterIcon, eFilter, onFilterChangedIcon, 'filterActive');
    }

    private setupShowValuesAsIcon(): void {
        const eShowValuesAs = this.eShowValuesAs;
        if (!eShowValuesAs || !this.beans.showValuesAsSvc) {
            return;
        }
        this.addInIcon('showValuesAs', eShowValuesAs, this.params.column as AgColumn);
        this.refreshShowValuesAs();
    }

    /** Called by the header cell as the column's show-values mode, or the grouping it applies to, changes. */
    public refreshShowValuesAs(): void {
        const eShowValuesAs = this.eShowValuesAs;
        const showValuesAsSvc = this.beans.showValuesAsSvc;
        if (!eShowValuesAs || !showValuesAsSvc) {
            return;
        }
        const column = this.params.column as AgColumn;
        // Three states: hidden (no active mode), active (applying), dormant (active but not meaningful in the
        // current view: ShowValuesAsService.isApplying).
        const show = column.showValuesAs != null && !column.showValuesAsDef?.suppressHeaderIndicator;
        _setDisplayed(eShowValuesAs, show, { skipAriaHidden: true });
        if (show) {
            eShowValuesAs.classList.toggle('ag-show-values-as-dormant', !showValuesAsSvc.isApplying(column));
            eShowValuesAs.title = showValuesAsSvc.getActiveModeTooltip(column) ?? '';
        }
    }

    private setupFilterButton(): void {
        const { eFilterButton, params } = this;
        if (!eFilterButton) {
            return;
        }
        const configured = this.configureFilter(
            params.enableFilterButton,
            eFilterButton,
            this.onFilterChangedButton.bind(this),
            'filter'
        );
        if (configured) {
            _addPopupToggleButtonListeners(
                this,
                eFilterButton,
                () =>
                    this.beans.menuSvc?.toggleFilterMenu({
                        column: params.column,
                        buttonElement: eFilterButton,
                        getButtonElement: () => getColumnHeaderMenuAnchor(this.beans, params.column as AgColumn, true),
                        containerType: 'columnFilter',
                        positionBy: 'button',
                    }) ?? 'declined'
            );
        } else {
            this.eFilterButton = undefined;
        }
    }

    private configureFilter(
        enabled: boolean,
        element: HTMLElement,
        filterChangedCallback: () => void,
        icon: IconName
    ): boolean {
        if (!enabled) {
            _removeFromParent(element);
            return false;
        }

        const column = this.params.column as AgColumn;
        this.addInIcon(icon, element, column);
        this.addTooltip({
            control: 'filter',
            getGui: () => element,
            getLocation: () => 'header',
            getTooltip: () => ({
                value: this.getLocaleTextFunc()('tooltipFilter', 'Open filter'),
                params: { column: this.params.column },
            }),
        });

        this.addManagedListeners(column, { filterChanged: filterChangedCallback });
        filterChangedCallback();
        return true;
    }

    private onFilterChangedButton(): void {
        const filterPresent = this.params.column.isFilterActive();
        this.eFilterButton!.classList.toggle('ag-filter-active', filterPresent);
    }

    public getAnchorElementForMenu(isFilter?: boolean): HTMLElement {
        const { eFilterButton, eMenu } = this;
        if (isFilter) {
            return eFilterButton ?? eMenu ?? this.getGui();
        }
        return eMenu ?? eFilterButton ?? this.getGui();
    }

    public override destroy(): void {
        super.destroy();

        this.innerHeaderComponent = this.destroyBean(this.innerHeaderComponent);
        this.mouseListener = this.destroyBean(this.mouseListener);
    }
}
