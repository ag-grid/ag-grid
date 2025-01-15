// import type {
//     FilterEvaluator,
//     FilterEvaluatorFuncParams,
//     FilterEvaluatorParams,
//     FilterModelValidation,
//     IFilterComp,
//     IMultiFilterModel,
//     IMultiFilterParams,
// } from 'ag-grid-community';
// import { BeanStub } from 'ag-grid-community';

// import type { MultiFilterHelper } from './multiFilterHelper';
// import type { MultiFilterService } from './multiFilterService';

// export class MultiFilterEvaluator
//     extends BeanStub
//     implements FilterEvaluator<any, any, any, IMultiFilterModel, IMultiFilterParams>
// {
//     private helper: MultiFilterHelper;
//     private params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams;
//     private activeFilters: { filter: IFilterComp | FilterEvaluator; index: number }[];

//     public init(
//         params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams
//     ): Promise<FilterModelValidation<IMultiFilterModel>> {
//         this.params = params;

//         return new Promise((resolve) =>
//             (this.beans.multiFilter as MultiFilterService).getHelper(params).then((helper) => {
//                 this.helper = helper!;

//                 this.updateActiveFilters();

//                 resolve({ valid: true });
//             })
//         );
//     }

//     public refresh(
//         params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams
//     ): Promise<FilterModelValidation<IMultiFilterModel>> {
//         this.params = params;

//         return new Promise((resolve) =>
//             this.helper.refresh(params).then(() => {
//                 this.updateActiveFilters();

//                 resolve({ valid: true });
//             })
//         );
//     }

//     public doesFilterPass(params: FilterEvaluatorFuncParams<any, IMultiFilterModel>): boolean {
//         const filterModels = params.model?.filterModels;
//         return this.activeFilters.every(({ filter, index }) =>
//             filter.doesFilterPass({ ...params, model: filterModels ? filterModels[index] : null })
//         );
//     }

//     private updateActiveFilters(): void {
//         this.activeFilters = [];
//         const filterModels = this.params.model?.filterModels;
//         if (filterModels == null) {
//             return;
//         }
//         this.helper.filters.forEach((filter, index) => {
//             const isActive = filterModels[index] != null;
//             if (isActive) {
//                 this.activeFilters.push({
//                     filter: filter.isEvaluator ? filter.evaluator : filter.filter!,
//                     index,
//                 });
//             }
//         });
//     }

//     public override destroy(): void {
//         (this.beans.multiFilter as MultiFilterService).removeHelper(this.params.column.getColId());
//         this.activeFilters = [];
//         super.destroy();
//     }
// }
