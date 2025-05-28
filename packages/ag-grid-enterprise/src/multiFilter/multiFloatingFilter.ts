import type {
    AgColumn,
    ElementParams,
    FilterChangedEvent,
    FloatingFilterDisplayParams,
    IFilter,
    IFilterDef,
    IFloatingFilterComp,
    IFloatingFilterParams,
    IMultiFilterModel,
    MultiFilterParams,
    UserCompDetails,
} from 'ag-grid-community';
import {
    AgPromise,
    Component,
    _clearElement,
    _error,
    _getDefaultFloatingFilterType,
    _getFloatingFilterCompDetails,
    _mergeDeep,
    _setDisplayed,
} from 'ag-grid-community';

import { MultiFilter } from './multiFilter';
import type { MultiFilterHandler } from './multiFilterHandler';
import { MultiFilterUi } from './multiFilterUi';
import { getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

const MultiFloatingFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-multi-floating-filter ag-floating-filter-input',
};

export class MultiFloatingFilterComp extends Component implements IFloatingFilterComp<MultiFilter | MultiFilterUi> {
    private floatingFilters: IFloatingFilterComp[] = [];
    private compDetailsList: UserCompDetails[] = [];
    private params: IFloatingFilterParams<MultiFilter | MultiFilterUi>;

    constructor() {
        super(MultiFloatingFilterElement);
    }

    public init(params: IFloatingFilterParams<MultiFilter | MultiFilterUi>): AgPromise<void> {
        this.params = params;

        const { compDetailsList } = this.getCompDetailsList(params);
        return this.setParams(compDetailsList);
    }

    private setParams(compDetailsList: UserCompDetails[]): AgPromise<void> {
        const floatingFilterPromises: AgPromise<IFloatingFilterComp>[] = [];

        compDetailsList.forEach((compDetails) => {
            const floatingFilterPromise = compDetails?.newAgStackInstance();

            if (floatingFilterPromise != null) {
                this.compDetailsList.push(compDetails!);
                floatingFilterPromises.push(floatingFilterPromise);
            }
        });

        return AgPromise.all(floatingFilterPromises).then((floatingFilters) => {
            floatingFilters!.forEach((floatingFilter, index) => {
                this.floatingFilters.push(floatingFilter!);

                const gui = floatingFilter!.getGui();

                this.appendChild(gui);

                if (index > 0) {
                    _setDisplayed(gui, false);
                }
            });
        });
    }

    public refresh(params: IFloatingFilterParams<MultiFilter | MultiFilterUi>): void {
        this.params = params;
        const { compDetailsList: newCompDetailsList, floatingFilterParamsList } = this.getCompDetailsList(params);
        const allFloatingFilterCompsUnchanged =
            newCompDetailsList.length === this.compDetailsList.length &&
            newCompDetailsList.every(
                (newCompDetails, index) =>
                    !this.beans.colFilter?.areFilterCompsDifferent(this.compDetailsList[index], newCompDetails)
            );

        if (allFloatingFilterCompsUnchanged) {
            floatingFilterParamsList.forEach((floatingFilterParams, index) => {
                const floatingFilter = this.floatingFilters[index] as IFloatingFilterComp<IFilter>;
                floatingFilter.refresh?.(floatingFilterParams);
            });
            if (this.gos.get('enableFilterHandlers')) {
                const reactiveParams = params as unknown as FloatingFilterDisplayParams;
                if (reactiveParams.model == null) {
                    this.floatingFilters.forEach((filter, i) => {
                        _setDisplayed(filter.getGui(), i === 0);
                    });
                } else {
                    const lastActiveFloatingFilterIndex = (
                        reactiveParams.getHandler() as MultiFilterHandler
                    )?.getLastActiveFilterIndex?.();
                    this.floatingFilters.forEach((filter, i) => {
                        const shouldShow =
                            lastActiveFloatingFilterIndex == null ? i === 0 : i === lastActiveFloatingFilterIndex;
                        _setDisplayed(filter.getGui(), shouldShow);
                    });
                }
            }
        } else {
            _clearElement(this.getGui());
            this.destroyBeans(this.floatingFilters);
            this.floatingFilters = [];
            this.compDetailsList = [];
            this.setParams(newCompDetailsList);
        }
    }

    private getCompDetailsList(params: IFloatingFilterParams<MultiFilter | MultiFilterUi>): {
        compDetailsList: UserCompDetails[];
        floatingFilterParamsList: IFloatingFilterParams<IFilter>[];
    } {
        const compDetailsList: UserCompDetails[] = [];
        const floatingFilterParamsList: IFloatingFilterParams<IFilter>[] = [];
        const filterParams = params.filterParams as MultiFilterParams;
        const currentParentModel = params.currentParentModel;

        const filterDefs = getMultiFilterDefs(filterParams);
        filterDefs.forEach((filterDef, index) => {
            const floatingFilterParams: IFloatingFilterParams<IFilter> = {
                ...params,
                // set the parent filter instance for each floating filter to the relevant child filter instance
                parentFilterInstance: (callback) => {
                    this.parentMultiFilterInstance((parent) => {
                        const child = parent.getChildFilterInstance(index);
                        if (child == null) {
                            return;
                        }

                        callback(child as IFilter);
                    });
                },
                // return the parent model for the specific filter
                currentParentModel: () => currentParentModel()?.filterModels?.[index] ?? null,
            };
            if (this.gos.get('enableFilterHandlers')) {
                const reactiveParams = floatingFilterParams as unknown as FloatingFilterDisplayParams;
                reactiveParams.model = reactiveParams.model?.filterModels?.[index] ?? null;
                const { onModelChange, getHandler } = reactiveParams;
                reactiveParams.onModelChange = (newModel, additionalEventAttributes) =>
                    onModelChange(
                        getUpdatedMultiFilterModel(
                            (this.params as unknown as FloatingFilterDisplayParams).model,
                            filterDefs.length,
                            newModel,
                            index
                        ),
                        additionalEventAttributes
                    );
                reactiveParams.getHandler = () => {
                    const multiFilterHandler = getHandler() as MultiFilterHandler;
                    return multiFilterHandler.getHandler(index)!;
                };
            }
            _mergeDeep(floatingFilterParams.filterParams, filterDef.filterParams);

            const compDetails = this.getCompDetails(filterDef, floatingFilterParams);
            if (compDetails) {
                compDetailsList.push(compDetails);
                floatingFilterParamsList.push(floatingFilterParams);
            }
        });
        return { compDetailsList, floatingFilterParamsList };
    }

    public onParentModelChanged(model: IMultiFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) {
            return;
        }

        this.parentMultiFilterInstance((parent) => {
            if (model == null) {
                this.floatingFilters.forEach((filter, i) => {
                    filter.onParentModelChanged(null, event);
                    _setDisplayed(filter.getGui(), i === 0);
                });
            } else {
                const lastActiveFloatingFilterIndex = parent.getLastActiveFilterIndex();

                this.floatingFilters.forEach((filter, i) => {
                    const filterModel = model.filterModels!.length > i ? model.filterModels![i] : null;

                    filter.onParentModelChanged(filterModel, event);

                    const shouldShow =
                        lastActiveFloatingFilterIndex == null ? i === 0 : i === lastActiveFloatingFilterIndex;

                    _setDisplayed(filter.getGui(), shouldShow);
                });
            }
        });
    }

    public override destroy(): void {
        this.destroyBeans(this.floatingFilters);
        this.floatingFilters.length = 0;

        super.destroy();
    }

    private getCompDetails(filterDef: IFilterDef, params: IFloatingFilterParams<IFilter>): UserCompDetails | undefined {
        const { colFilter, frameworkOverrides, userCompFactory } = this.beans;
        const defaultComponentName =
            _getDefaultFloatingFilterType(frameworkOverrides, filterDef, () =>
                colFilter!.getDefaultFloatingFilter(this.params.column as AgColumn)
            ) ?? 'agReadOnlyFloatingFilter';

        return _getFloatingFilterCompDetails(userCompFactory, filterDef, params, defaultComponentName);
    }

    private parentMultiFilterInstance(cb: (instance: MultiFilter | MultiFilterUi) => void): void {
        this.params.parentFilterInstance((parent) => {
            if (!(parent instanceof MultiFilter || parent instanceof MultiFilterUi)) {
                _error(120);
            }

            cb(parent);
        });
    }
}
