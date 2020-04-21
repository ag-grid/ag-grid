// import { mock } from 'jest-mock-extended';
// import { ProvidedFilter, IProvidedFilterParams } from './providedFilter';
// import { ProvidedFilterModel, IDoesFilterPassParams } from '../../interfaces/iFilter';
// import { Constants } from '../../constants';
// import { IRowModel } from '../../interfaces/iRowModel';

test.todo('Fix typing and restore tests');

// class TestFilter extends ProvidedFilter {
//     private uiModel: ProvidedFilterModel;
//     private modelHasChanged = false;

//     constructor(params: IProvidedFilterParams, rowModelType: string = Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
//         super();

//         const rowModel = mock<IRowModel>();

//         rowModel.getType.mockReturnValue(rowModelType);

//         this.rowModel = rowModel;
//         this.setParams(params);
//     }

//     public doesFilterPass(params: IDoesFilterPassParams): boolean {
//         throw new Error('Method not implemented.');
//     }

//     protected updateUiVisibility(): void {
//         throw new Error('Method not implemented.');
//     }

//     protected createBodyTemplate(): string {
//         throw new Error('Method not implemented.');
//     }

//     protected getCssIdentifier(): string {
//         throw new Error('Method not implemented.');
//     }

//     protected resetUiToDefaults(silent?: boolean): void {
//         throw new Error('Method not implemented.');
//     }

//     protected setModelIntoUi(model: ProvidedFilterModel): void {
//         throw new Error('Method not implemented.');
//     }

//     protected areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean {
//         return !this.modelHasChanged;
//     }

//     public getModelFromUi(): ProvidedFilterModel {
//         return this.uiModel;
//     }

//     public setUiModel(model: ProvidedFilterModel): void {
//         this.uiModel = model;
//     }

//     public setModelHasChanged(hasChanged: boolean): void {
//         this.modelHasChanged = hasChanged;
//     }

//     public apply(): void {
//         this.onBtApply();
//     }
// }

//     it('calls filterChangedCallback when filter has changed', () => {
//         const params = mock<IProvidedFilterParams>();
//         const filter = new TestFilter(params);

//         filter.setModelHasChanged(true);
//         filter.apply();

//         expect(params.filterChangedCallback).toHaveBeenCalledTimes(1);
//     });

//     it('does not call filterChangedCallback when filter has not changed', () => {
//         const params = mock<IProvidedFilterParams>();
//         const filter = new TestFilter(params);

//         filter.apply();

//         expect(params.filterChangedCallback).not.toHaveBeenCalled();
//     });

//     it('closes popup if closeOnApply is true', () => {
//         const hidePopup = jest.fn();
//         const params = mock<IProvidedFilterParams>({ closeOnApply: true });
//         const filter = new TestFilter(params);

//         filter.afterGuiAttached({ hidePopup });
//         filter.setModelHasChanged(true);
//         filter.apply();

//         expect(hidePopup).toHaveBeenCalledTimes(1);
//     });

//     it('closes popup if closeOnApply is true even if model did not change', () => {
//         const hidePopup = jest.fn();
//         const params = mock<IProvidedFilterParams>({ closeOnApply: true });
//         const filter = new TestFilter(params);

//         filter.afterGuiAttached({ hidePopup });
//         filter.apply();

//         expect(hidePopup).toHaveBeenCalledTimes(1);
//     });

//     it.each([undefined, false])('does not close popup if closeOnApply is %s', value => {
//         const hidePopup = jest.fn();
//         const params = mock<IProvidedFilterParams>();

//         // mocking library does not set property correctly for falsy values, so we have to do this instead
//         Object.defineProperty(params, 'closeOnApply', { get: () => value, set: () => { } });

//         const filter = new TestFilter(params);

//         filter.afterGuiAttached({ hidePopup });
//         filter.setModelHasChanged(true);
//         filter.apply();

//         expect(hidePopup).not.toHaveBeenCalled();
//     });
// });
