// import type {
//     AgColumn,
//     ContainerType,
//     IAfterGuiAttachedParams,
//     IDoesFilterPassParams,
//     IFilterComp,
//     IMultiFilter,
//     IMultiFilterDef,
//     IMultiFilterModel,
//     IMultiFilterParams,
//     MultiFilterParams,
//     ProvidedFilterModel,
// } from 'ag-grid-community';
// import {
//     AgPromise,
//     KeyCode,
//     ProvidedFilter,
//     TabGuardComp,
//     _focusInto,
//     _getActiveDomElement,
//     _getFilterUiFromWrapper,
//     _isNothingFocused,
//     _loadTemplate,
//     _removeFromArray,
// } from 'ag-grid-community';

// import { AgGroupComponent } from '../widgets/agGroupComponent';
// import type { MenuItemActivatedEvent } from '../widgets/agMenuItemComponent';
// import { AgMenuItemComponent } from '../widgets/agMenuItemComponent';
// import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
// import type { MultiFilterHelper } from './multiFilterHelper';
// import type { MultiFilterService } from './multiFilterService';

// export function getMultiFilterDefs(params: IMultiFilterParams): IMultiFilterDef[] {
//     const { filters } = params;

//     return filters && filters.length > 0
//         ? filters
//         : [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
// }

// function _forEachReverse<T>(list: T[] | null | undefined, action: (value: T, index: number) => void): void {
//     if (list == null) {
//         return;
//     }

//     for (let i = list.length - 1; i >= 0; i--) {
//         action(list[i], i);
//     }
// }

// function getFilterTitle(filter: IFilterComp, filterDef: IMultiFilterDef): string {
//     if (filterDef.title != null) {
//         return filterDef.title;
//     }

//     return filter instanceof ProvidedFilter ? filter.getFilterTitle() : 'Filter';
// }

// export class MultiFilter extends TabGuardComp implements IFilterComp, IMultiFilter {
//     private filterType = 'multi' as const;

//     private params: MultiFilterParams;
//     private filters: IFilterComp[];
//     private guiDestroyFuncs: (() => void)[] = [];
//     // this could be the accordion/sub menu element depending on the display type
//     private filterGuis: HTMLElement[] = [];
//     private lastOpenedInContainer?: ContainerType;
//     private activeFilterIndices: number[] = [];
//     private lastActivatedMenuItem: AgMenuItemComponent | null = null;
//     private hidePopup?: () => void;
//     private helper: MultiFilterHelper;

//     constructor() {
//         super(/* html */ `<div class="ag-multi-filter ag-menu-list-compact"></div>`);
//     }

//     public postConstruct() {
//         this.initialiseTabGuard({
//             onFocusIn: (e) => this.onFocusIn(e),
//         });
//     }

//     public init(params: MultiFilterParams): AgPromise<void> {
//         this.params = params;

//         return new AgPromise((resolve) => {
//             (this.beans.multiFilter as MultiFilterService).getHelper(params).then((helper) => {
//                 this.helper = helper!;

//                 const filterPromises: AgPromise<IFilterComp>[] = [];
//                 helper!.filters.forEach((filterWrapper) => {
//                     const filterUiPromise = _getFilterUiFromWrapper(filterWrapper);
//                     if (filterUiPromise) {
//                         filterPromises.push(filterUiPromise);
//                     }
//                 });

//                 AgPromise.all(filterPromises).then((filters) => {
//                     this.filters = filters as IFilterComp[];
//                     this.refreshGui('columnMenu').then(() => {
//                         resolve();
//                     });
//                 });
//             });
//         });

//         // this.filterDefs = getMultiFilterDefs(params);

//         // const { column, filterChangedCallback } = params;

//         // this.column = column as AgColumn;
//         // this.filterChangedCallback = filterChangedCallback;

//         // const filterPromises: AgPromise<IFilterComp>[] = [];

//         // this.filterDefs.forEach((filterDef, index) => {
//         //     const filterPromise = this.createFilter(filterDef, index);

//         //     if (filterPromise != null) {
//         //         filterPromises.push(filterPromise);
//         //     }
//         // });

//         // // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
//         // return new AgPromise<void>((resolve) => {
//         //     AgPromise.all(filterPromises).then((filters) => {
//         //         this.filters = filters as IFilterComp[];
//         //         this.refreshGui('columnMenu').then(() => {
//         //             resolve();
//         //         });
//         //     });
//         // }).then(() => {
//         //     this.afterFiltersReadyFuncs.forEach((f) => f());
//         //     this.afterFiltersReadyFuncs.length = 0;
//         // });
//     }

//     private refreshGui(container: ContainerType): AgPromise<void> {
//         if (container === this.lastOpenedInContainer) {
//             return AgPromise.resolve();
//         }

//         this.tabGuardFeature.removeAllChildrenExceptTabGuards();
//         this.destroyChildren();

//         return AgPromise.all(
//             this.filters.map((filter, index) => {
//                 const filterDef = this.helper.filterDefs[index];
//                 const filterTitle = getFilterTitle(filter, filterDef);
//                 let filterGuiPromise: AgPromise<HTMLElement>;

//                 if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
//                     // prevent sub-menu being used in tool panel
//                     filterGuiPromise = this.insertFilterMenu(filter, filterTitle).then((menuItem) =>
//                         menuItem!.getGui()
//                     );
//                 } else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
//                     // sub-menus should appear as groups in the tool panel
//                     const group = this.insertFilterGroup(filter, filterTitle);

//                     filterGuiPromise = AgPromise.resolve(group.getGui());
//                 } else {
//                     // display inline
//                     filterGuiPromise = AgPromise.resolve(filter.getGui());
//                 }

//                 return filterGuiPromise;
//             })
//         ).then((filterGuis) => {
//             filterGuis!.forEach((filterGui, index) => {
//                 if (index > 0) {
//                     this.appendChild(_loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
//                 }
//                 this.appendChild(filterGui!);
//             });
//             this.filterGuis = filterGuis as HTMLElement[];
//             this.lastOpenedInContainer = container;
//         });
//     }

//     private destroyChildren() {
//         this.guiDestroyFuncs.forEach((func) => func());
//         this.guiDestroyFuncs.length = 0;
//         this.filterGuis.length = 0;
//     }

//     private insertFilterMenu(filter: IFilterComp, name: string): AgPromise<AgMenuItemComponent> {
//         const menuItem = this.createBean(new AgMenuItemComponent());
//         return menuItem
//             .init({
//                 menuItemDef: {
//                     name,
//                     subMenu: [],
//                     cssClasses: ['ag-multi-filter-menu-item'],
//                     menuItem: AgMenuItemRenderer,
//                     menuItemParams: {
//                         cssClassPrefix: 'ag-compact-menu-option',
//                         isCompact: true,
//                     },
//                 },
//                 level: 0,
//                 isAnotherSubMenuOpen: () => false,
//                 childComponent: filter,
//                 contextParams: {
//                     column: null,
//                     node: null,
//                     value: null,
//                 },
//             })
//             .then(() => {
//                 menuItem.setParentComponent(this);

//                 this.guiDestroyFuncs.push(() => this.destroyBean(menuItem));

//                 this.addManagedListeners(menuItem, {
//                     menuItemActivated: (event: MenuItemActivatedEvent) => {
//                         if (this.lastActivatedMenuItem && this.lastActivatedMenuItem !== event.menuItem) {
//                             this.lastActivatedMenuItem.deactivate();
//                         }

//                         this.lastActivatedMenuItem = event.menuItem;
//                     },
//                 });

//                 const menuItemGui = menuItem.getGui();
//                 menuItem.addManagedElementListeners(menuItemGui, {
//                     // `AgMenuList` normally handles keyboard navigation, so need to do here
//                     keydown: (e: KeyboardEvent) => {
//                         const { key } = e;
//                         switch (key) {
//                             case KeyCode.UP:
//                             case KeyCode.RIGHT:
//                             case KeyCode.DOWN:
//                             case KeyCode.LEFT:
//                                 e.preventDefault();
//                                 if (key === KeyCode.RIGHT) {
//                                     menuItem.openSubMenu(true);
//                                 }
//                                 break;
//                         }
//                     },
//                     focusin: () => menuItem.activate(),
//                     focusout: () => {
//                         if (!menuItem.isSubMenuOpen() && !menuItem.isSubMenuOpening()) {
//                             menuItem.deactivate();
//                         }
//                     },
//                 });

//                 return menuItem;
//             });
//     }

//     private insertFilterGroup(filter: IFilterComp, title: string): AgGroupComponent {
//         const group = this.createBean(
//             new AgGroupComponent({
//                 title,
//                 cssIdentifier: 'multi-filter',
//             })
//         );

//         this.guiDestroyFuncs.push(() => this.destroyBean(group));

//         group.addItem(filter.getGui());
//         group.toggleGroupExpand(false);

//         if (filter.afterGuiAttached) {
//             group.addManagedListeners(group, {
//                 expanded: () =>
//                     filter.afterGuiAttached!({
//                         container: this.lastOpenedInContainer!,
//                         suppressFocus: true,
//                         hidePopup: this.hidePopup,
//                     }),
//             });
//         }

//         return group;
//     }

//     public isFilterActive(): boolean {
//         return this.helper.isFilterActive();
//     }

//     public getLastActiveFilterIndex(): number | null {
//         const activeFilterIndices = this.activeFilterIndices;
//         return activeFilterIndices.length > 0 ? activeFilterIndices[activeFilterIndices.length - 1] : null;
//     }

//     public doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean {
//         return true;
//     }

//     /**
//      * @deprecated v33.1 Reading the Multi Filter model from the UI is no longer supported.
//      */
//     public getModelFromUi(): IMultiFilterModel | null {
//         const model: IMultiFilterModel = {
//             filterType: this.filterType,
//             filterModels: this.filters.map((filter) => {
//                 const providedFilter = filter as ProvidedFilter<IMultiFilterModel, unknown, MultiFilterParams>;

//                 if (typeof providedFilter.getModelFromUi === 'function') {
//                     return providedFilter.getModelFromUi();
//                 }

//                 return null;
//             }),
//         };

//         return model;
//     }

//     public getModel(): ProvidedFilterModel | null {
//         return this.params.model;
//     }

//     public setModel(model: IMultiFilterModel | null): AgPromise<void> {
//         const { beans, params } = this;
//         return beans.colFilter!.setModelForColumnLegacy(params.column as AgColumn, model);
//     }

//     /**
//      * @deprecated v33.1 Applying the un-applied Multi Filter model is no longer supported.
//      */
//     public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
//         let result = false;

//         this.filters.forEach((filter) => {
//             if (filter instanceof ProvidedFilter) {
//                 result = filter.applyModel(source) || result;
//             }
//         });

//         return result;
//     }

//     public getChildFilterInstance(index: number): IFilterComp | undefined {
//         return this.filters![index];
//     }

//     public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
//         let refreshPromise: AgPromise<void>;
//         if (params) {
//             this.hidePopup = params.hidePopup;
//             refreshPromise = this.refreshGui(params.container!);
//         } else {
//             this.hidePopup = undefined;
//             refreshPromise = AgPromise.resolve();
//         }

//         const suppressFocus = params?.suppressFocus;

//         refreshPromise.then(() => {
//             const {
//                 helper: { filterDefs },
//                 filters,
//                 filterGuis,
//                 beans,
//             } = this;
//             // don't want to focus later if focus suppressed
//             let hasFocused = !!suppressFocus;
//             if (filterDefs) {
//                 _forEachReverse(filterDefs, (filterDef, index) => {
//                     const isFirst = index === 0;
//                     const notInlineDisplayType = filterDef.display && filterDef.display !== 'inline';
//                     const suppressFocusForFilter = suppressFocus || !isFirst || notInlineDisplayType;
//                     const afterGuiAttachedParams = { ...(params ?? {}), suppressFocus: suppressFocusForFilter };
//                     const filter = filters[index];
//                     if (filter) {
//                         this.executeFunctionIfExistsOnFilter(filter, 'afterGuiAttached', afterGuiAttachedParams);
//                         if (isFirst && !suppressFocusForFilter) {
//                             hasFocused = true;
//                         }
//                     }
//                     if (!suppressFocus && isFirst && notInlineDisplayType) {
//                         // focus the first filter container instead (accordion/sub menu)
//                         const filterGui = filterGuis[index];
//                         if (filterGui) {
//                             if (!_focusInto(filterGui)) {
//                                 // menu item contains no focusable elements but is focusable itself
//                                 filterGui.focus({ preventScroll: true });
//                             }
//                             hasFocused = true;
//                         }
//                     }
//                 });
//             }

//             const activeEl = _getActiveDomElement(beans);

//             // if we haven't focused the first item in the filter, we might run into two scenarios:
//             // 1 - we are loading the filter for the first time and the component isn't ready,
//             //     which means the document will have focus.
//             // 2 - The focus will be somewhere inside the component due to auto focus
//             // In both cases we need to force the focus somewhere valid but outside the filter.
//             if (!hasFocused && (_isNothingFocused(beans) || this.getGui().contains(activeEl))) {
//                 // reset focus to the top of the container, and blur
//                 this.forceFocusOutOfContainer(true);
//             }
//         });
//     }

//     public afterGuiDetached(): void {
//         this.executeFunctionIfExists('afterGuiDetached');
//     }

//     public onAnyFilterChanged(): void {
//         this.executeFunctionIfExists('onAnyFilterChanged');
//     }

//     public onNewRowsLoaded(): void {
//         this.executeFunctionIfExists('onNewRowsLoaded');
//     }

//     public override destroy(): void {
//         this.filters.forEach((filter) => this.destroyBean(filter));

//         this.filters.length = 0;
//         this.destroyChildren();
//         this.hidePopup = undefined;

//         super.destroy();
//     }

//     private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]): void {
//         // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
//         // always gets the last say
//         _forEachReverse(this.filters, (filter) => {
//             this.executeFunctionIfExistsOnFilter(filter as T, name, params);
//         });
//     }

//     private executeFunctionIfExistsOnFilter<T extends IFilterComp>(filter: T, name: keyof T, ...params: any[]): void {
//         const func = filter[name];

//         if (typeof func === 'function') {
//             func.apply(filter, params);
//         }
//     }

//     private updateActiveList(index: number): void {
//         const { filters, activeFilterIndices } = this;
//         const changedFilter = filters[index];

//         _removeFromArray(activeFilterIndices, index);

//         if (changedFilter.isFilterActive()) {
//             activeFilterIndices.push(index);
//         }
//     }

//     protected onFocusIn(e: FocusEvent): void {
//         const lastActivatedMenuItem = this.lastActivatedMenuItem;
//         if (lastActivatedMenuItem != null && !lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
//             lastActivatedMenuItem.deactivate();
//             this.lastActivatedMenuItem = null;
//         }
//     }

//     getModelAsString(model: IMultiFilterModel): string {
//         if (!this.filters || !model?.filterModels?.length) {
//             return '';
//         }
//         const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
//         const activeFilter = this.filters[lastActiveIndex];
//         return activeFilter.getModelAsString?.(model.filterModels[lastActiveIndex]) ?? '';
//     }
// }
