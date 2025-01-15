// import type {
//     AgColumn,
//     Column,
//     FilterDisplayParams,
//     FilterWrapper,
//     IDoesFilterPassParams,
//     IFilterComp,
//     IFilterDef,
//     IMultiFilterDef,
//     IMultiFilterModel,
//     IMultiFilterParams,
//     RowNode,
// } from 'ag-grid-community';
// import { AgPromise, _createFilterWrapper } from 'ag-grid-community';
// import { BeanStub } from 'ag-grid-community';

// import { getMultiFilterDefs } from './multiFilter';

// export interface MultiFilterHelperParams extends IMultiFilterParams {
//     column: Column;
//     model: IMultiFilterModel | null;
// }

// export class MultiFilterHelper extends BeanStub {
//     public filters: FilterWrapper[];
//     public filterDefs: IMultiFilterDef[];

//     private params: MultiFilterHelperParams;
//     private afterFiltersReadyFuncs: (() => void)[] = [];
//     private activeFilterIndices: number[] = [];

//     public init(params: MultiFilterHelperParams): AgPromise<void> {
//         this.params = params;
//         const filterDefs = getMultiFilterDefs(params);

//         const filterPromises: AgPromise<FilterWrapper>[] = [];

//         filterDefs.forEach((filterDef, index) => {
//             const filterPromise = this.createFilter(filterDef, index);

//             if (filterPromise != null) {
//                 filterPromises.push(filterPromise);
//                 filterDefs.push(filterDef);
//             }
//         });

//         return AgPromise.all(filterPromises).then((filters) => {
//             this.filters = filters as FilterWrapper[];
//             this.filterDefs = filterDefs;
//             this.afterFiltersReadyFuncs.forEach((f) => f());
//             this.afterFiltersReadyFuncs.length = 0;
//         });
//     }

//     public refresh(params: MultiFilterHelperParams): AgPromise<void> {
//         this.params = params;
//         // TODO - need to refresh everything
//         return AgPromise.resolve();
//     }

//     private createFilter(filterDef: IFilterDef, index: number): AgPromise<FilterWrapper> | null {
//         const column = this.params.column as AgColumn;

//         const { compDetails, evaluator, evaluatorParams, createFilterUi } = this.beans.colFilter!.createFilterInstance(
//             column,
//             filterDef,
//             'agTextColumnFilter',
//             (defaultParams, isEvaluator, getFilterInstance) => {
//                 const updatedParams = {
//                     ...defaultParams,
//                     filterChangedCallback: isEvaluator
//                         ? () => {}
//                         : (additionalEventAttributes?: any) => {
//                               this.executeWhenAllFiltersReady(() =>
//                                   this.filterChanged(index, additionalEventAttributes)
//                               );
//                           },
//                     doesRowPassOtherFilter: (node: RowNode) =>
//                         defaultParams.doesRowPassOtherFilter(node) &&
//                         this.doesFilterPass({ node, data: node.data }, getFilterInstance()),
//                 };
//                 if (isEvaluator) {
//                     const displayParams = updatedParams as FilterDisplayParams;
//                     displayParams.model = this.getModel(index);
//                     const onModelChange = displayParams.onModelChange;
//                     displayParams.onModelChange = (model, additionalEventAttributes?: any) =>
//                         onModelChange(this.updateModel(index, model), additionalEventAttributes);
//                 }
//                 return updatedParams;
//             }
//         );

//         const updatedEvaluatorParams = evaluatorParams
//             ? {
//                   ...evaluatorParams,
//                   model: this.getModel(index),
//               }
//             : undefined;

//         const filterWrapper = _createFilterWrapper(
//             column,
//             compDetails,
//             evaluator,
//             updatedEvaluatorParams,
//             createFilterUi
//         );

//         return filterWrapper.initPromise.then(() => {
//             return filterWrapper;
//         });
//     }

//     private getModel(index: number): any {
//         const models = this.params.model?.filterModels;
//         return models == null ? null : models[index];
//     }

//     private updateModel(index: number, model: any): IMultiFilterModel | null {
//         const existingModel = this.params.model;
//         if (model == null) {
//             if (
//                 !existingModel?.filterModels ||
//                 existingModel.filterModels.every((childModel, childIndex) => childModel == null || childIndex === index)
//             ) {
//                 return null;
//             }
//         }
//         const filterModels = [...(existingModel?.filterModels ?? [])];
//         filterModels[index] = model;
//         return {
//             filterType: 'multi',
//             filterModels,
//         };
//     }

//     public isFilterActive(): boolean {
//         return this.params.model != null;
//     }

//     private doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean {
//         // TODO - doesRowPassOtherFilter
//         return true;
//     }

//     private executeWhenAllFiltersReady(action: () => void): void {
//         if ((this.filters?.length ?? 0) > 0) {
//             action();
//         } else {
//             this.afterFiltersReadyFuncs.push(action);
//         }
//     }

//     private updateActiveList(index: number): void {
//         // const { filters, activeFilterIndices } = this;
//         // const changedFilter = filters![index];
//         // _removeFromArray(activeFilterIndices, index);
//         // if (changedFilter.isFilterActive()) {
//         //     activeFilterIndices.push(index);
//         // }
//     }

//     private filterChanged(index: number, additionalEventAttributes: any): void {
//         // this.updateActiveList(index);
//         // this.filterChangedCallback!(additionalEventAttributes);
//         // const changedFilter = this.filters![index];
//         // this.filters!.forEach((filter) => {
//         //     if (filter === changedFilter) {
//         //         return;
//         //     }
//         //     if (typeof filter.onAnyFilterChanged === 'function') {
//         //         filter.onAnyFilterChanged();
//         //     }
//         // });
//     }
// }
