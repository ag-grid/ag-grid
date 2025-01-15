// import type { NamedBean } from 'ag-grid-community';
// import { AgPromise, BeanStub } from 'ag-grid-community';

// import type { MultiFilterHelperParams } from './multiFilterHelper';
// import { MultiFilterHelper } from './multiFilterHelper';

// export class MultiFilterService extends BeanStub implements NamedBean {
//     readonly beanName = 'multiFilter';

//     private readonly helpers: Map<string, MultiFilterHelper> = new Map();

//     public getHelper(params: MultiFilterHelperParams): AgPromise<MultiFilterHelper> {
//         const helpers = this.helpers;
//         const colId = params.column.getColId();
//         const helper = helpers.get(colId);
//         if (helper) {
//             return AgPromise.resolve(helper);
//         }
//         const newHelper = this.createBean(new MultiFilterHelper());
//         return newHelper.init(params).then(() => {
//             helpers.set(colId, newHelper);
//             return newHelper;
//         });
//     }

//     public removeHelper(colId: string): void {
//         const helpers = this.helpers;
//         const helper = helpers.get(colId);
//         this.destroyBean(helper);
//         if (helper) {
//             helpers.delete(colId);
//         }
//     }

//     public override destroy(): void {
//         const helpers = this.helpers;
//         helpers.forEach((helper) => this.destroyBean(helper));
//         helpers.clear();
//     }
// }
