import { _getInnerHeaderCompDetails } from '../../../components/framework/userCompUtils';
import type { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import type { AgColumn } from '../../../entities/agColumn';
import { _isLegacyMenuEnabled } from '../../../gridOptionsUtils';
import type { IHeaderComp, IHeaderParams, IInnerHeaderComponent } from '../../../interfaces/iHeader';
import type { SortIndicatorComp } from '../../../sort/sortIndicatorComp';
import type { ElementParams } from '../../../utils/dom';
import { _removeFromParent, _setDisplayed } from '../../../utils/dom';
import type { IconName } from '../../../utils/icon';
import { _createIconNoSpan } from '../../../utils/icon';
import { _mergeDeep } from '../../../utils/object';
import { _toString } from '../../../utils/string';
import { Component, RefPlaceholder } from '../../../widgets/component';

function getHeaderCompElementParams(includeSortIndicator: boolean): ElementParams {
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
                    { tag: 'span', ref: 'eText', cls: 'ag-header-cell-text' },
                    {
                        tag: 'span',
                        ref: 'eFilter',
                        cls: 'ag-header-icon ag-header-label-icon ag-filter-icon',
                        attrs: hiddenAttrs,
                    },
                    includeSortIndicator ? { tag: 'ag-sort-indicator', ref: 'eSortIndicator' } : null,
                ],
            },
        ],
    };
}
const HeaderCompElement = getHeaderCompElementParams(true);
const HeaderCompElementNoSort = getHeaderCompElementParams(false);

export class HeaderComp extends Component implements IHeaderComp {
    // All the elements are optional, as they are not guaranteed to be present if the user provides a custom template
    private eFilter?: HTMLElement = RefPlaceholder;
    public eFilterButton?: HTMLElement = RefPlaceholder;
    private eSortIndicator?: SortIndicatorComp = RefPlaceholder;
    public eMenu?: HTMLElement = RefPlaceholder;
    private eLabel?: HTMLElement = RefPlaceholder;
    private eText?: HTMLElement = RefPlaceholder;

    /**
     * Selectors for custom headers templates, i.e when the ag-sort-indicator is not present.
     */
    private readonly eSortOrder?: HTMLElement = RefPlaceholder;
    private readonly eSortAsc?: HTMLElement = RefPlaceholder;
    private readonly eSortDesc?: HTMLElement = RefPlaceholder;
    private readonly eSortMixed?: HTMLElement = RefPlaceholder;
    private readonly eSortNone?: HTMLElement = RefPlaceholder;

    public params: IHeaderParams;

    private currentDisplayName: string;
    private currentTemplate: ElementParams | string | null | undefined;
    private currentShowMenu: boolean;
    private currentSuppressMenuHide: boolean;
    private currentSort: boolean | undefined;

    private innerHeaderComponent: IInnerHeaderComponent | undefined;
    private isLoadingInnerComponent: boolean = false;

    public refresh(params: IHeaderParams): boolean {
        const oldParams = this.params;
        this.params = params;

        // if template changed, then recreate the whole comp, the code required to manage
        // a changing template is to difficult for what it's worth.
        if (
            this.workOutTemplate(params, !!this.beans?.sortSvc) != this.currentTemplate ||
            this.workOutShowMenu() != this.currentShowMenu ||
            params.enableSorting != this.currentSort ||
            (this.currentSuppressMenuHide != null && this.shouldSuppressMenuHide() != this.currentSuppressMenuHide) ||
            oldParams.enableFilterButton != params.enableFilterButton ||
            oldParams.enableFilterIcon != params.enableFilterIcon
        ) {
            return false;
        }

        if (this.innerHeaderComponent) {
            // Mimic the merging of params that happens during init of _getInnerHeaderCompDetails(userCompFactory, params, params);
            const mergedParams = { ...params };
            _mergeDeep(mergedParams, params.innerHeaderComponentParams);
            this.innerHeaderComponent.refresh?.(mergedParams);
        } else {
            this.setDisplayName(params);
        }

        return true;
    }

    private workOutTemplate(params: IHeaderParams, isSorting: boolean): string | ElementParams {
        const paramsTemplate = params.template;
        if (paramsTemplate) {
            // take account of any newlines & whitespace before/after the actual template
            return paramsTemplate?.trim ? paramsTemplate.trim() : paramsTemplate;
        } else {
            return isSorting ? HeaderCompElement : HeaderCompElementNoSort;
        }
    }

    public init(params: IHeaderParams): void {
        this.params = params;

        const { sortSvc, touchSvc, rowNumbersSvc, userCompFactory } = this.beans;
        const sortComp = sortSvc?.getSortIndicatorSelector();
        this.currentTemplate = this.workOutTemplate(params, !!sortComp);
        this.setTemplate(this.currentTemplate, sortComp ? [sortComp] : undefined);

        touchSvc?.setupForHeader(this);

        this.setMenu();
        this.setupSort();
        rowNumbersSvc?.setupForHeader(this);
        this.setupFilterIcon();
        this.setupFilterButton();
        this.workOutInnerHeaderComponent(userCompFactory, params);
        this.setDisplayName(params);
    }

    private workOutInnerHeaderComponent(userCompFactory: UserComponentFactory, params: IHeaderParams): void {
        const userCompDetails = _getInnerHeaderCompDetails(userCompFactory, params, params);

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
        this.addManagedElementListeners(eMenu, { click: () => this.showColumnMenu(this.eMenu!) });
        this.toggleMenuAlwaysShow(currentSuppressMenuHide);
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
            this.eSortIndicator = this.createBean(sortSvc.createSortIndicator(true));
            const { eSortIndicator, eSortOrder, eSortAsc, eSortDesc, eSortMixed, eSortNone } = this;
            eSortIndicator.attachCustomElements(eSortOrder, eSortAsc, eSortDesc, eSortMixed, eSortNone);
        }
        this.eSortIndicator.setupSort(column as AgColumn);

        // we set up the indicator prior to the check for whether this column is sortable, as it allows the indicator to
        // set up the multi sort indicator which can appear irrelevant of whether this column can itself be sorted.
        // this can occur in the case of a non-sortable group display column.
        if (!this.currentSort) {
            return;
        }

        sortSvc.setupHeader(this, column as AgColumn, this.eLabel);
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
            this.addManagedElementListeners(eFilterButton, {
                click: () => params.showFilter(eFilterButton!),
            });
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

        if (this.innerHeaderComponent) {
            this.destroyBean(this.innerHeaderComponent);
            this.innerHeaderComponent = undefined;
        }
    }
}
