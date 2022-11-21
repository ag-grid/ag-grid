import { ProvidedFilter, IProvidedFilterParams } from './providedFilter';
import { ProvidedFilterModel, IDoesFilterPassParams } from '../../interfaces/iFilter';
import { Constants } from '../../constants/constants';
import { IRowModel, RowModelType } from '../../interfaces/iRowModel';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { mock } from '../../test-utils/mock';
import { AgPromise } from '../../utils';

class TestFilter extends ProvidedFilter<ProvidedFilterModel, string> {
    private uiModel: ProvidedFilterModel;
    private modelHasChanged = false;

    constructor(params: IProvidedFilterParams, rowModelType: RowModelType = Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
        super('textFilter');

        const eGui = mock<HTMLElement>('appendChild');
        this.setGui(eGui);

        const gridOptionsWrapper = mock<GridOptionsWrapper>('getLocaleTextFunc');
        gridOptionsWrapper.getLocaleTextFunc.mockReturnValue((_: string, defaultValue: string) => defaultValue);
        (this as any).gridOptionsWrapper = gridOptionsWrapper;

        const rowModel = mock<IRowModel>('getType');
        rowModel.getType.mockReturnValue(rowModelType);
        (this as any).rowModel = rowModel;

        this.setParams(params);
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        throw new Error('Method not implemented.');
    }

    protected updateUiVisibility(): void {
        throw new Error('Method not implemented.');
    }

    protected createBodyTemplate(): string {
        throw new Error('Method not implemented.');
    }

    protected getCssIdentifier(): string {
        throw new Error('Method not implemented.');
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        throw new Error('Method not implemented.');
    }

    protected setModelIntoUi(model: ProvidedFilterModel): AgPromise<void> {
        throw new Error('Method not implemented.');
    }

    protected areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean {
        return !this.modelHasChanged;
    }

    protected getFilterType(): string {
        return 'test';
    }

    public getModelFromUi(): ProvidedFilterModel {
        return this.uiModel;
    }

    public setModelHasChanged(hasChanged: boolean): void {
        this.modelHasChanged = hasChanged;
    }

    public apply(afterFloatingFilter = false, afterDataChange = false): void {
        this.onBtApply(afterFloatingFilter, afterDataChange);
    }
}

describe('filterChangedCallback', () => {
    it('calls filterChangedCallback when filter has changed', () => {
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        const filter = new TestFilter(params);

        filter.setModelHasChanged(true);
        filter.apply();

        expect(params.filterChangedCallback).toHaveBeenCalledTimes(1);
    });

    it('does not call filterChangedCallback when filter has not changed', () => {
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        const filter = new TestFilter(params);

        filter.apply();

        expect(params.filterChangedCallback).not.toHaveBeenCalled();
    });
});

describe('closeOnApply', () => {
    it('closes popup if closeOnApply is true and apply button is present', () => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        params.buttons = ['apply'];
        params.closeOnApply = true;
        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.setModelHasChanged(true);
        filter.apply();

        expect(hidePopup).toHaveBeenCalledTimes(1);
    });

    it('closes popup if closeOnApply is true even if model did not change', () => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        params.buttons = ['apply'];
        params.closeOnApply = true;

        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.apply();

        expect(hidePopup).toHaveBeenCalledTimes(1);
    });

    it('does not close popup if apply button is not present', () => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        params.closeOnApply = true;
        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.setModelHasChanged(true);
        filter.apply();

        expect(hidePopup).toHaveBeenCalledTimes(0);
    });

    it('does not close popup if from change came from floating filter', () => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        params.buttons = ['apply'];
        params.closeOnApply = true;
        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.setModelHasChanged(true);
        filter.apply(true);

        expect(hidePopup).toHaveBeenCalledTimes(0);
    });

    it('does not close popup if from change came from data', () => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');
        params.buttons = ['apply'];
        params.closeOnApply = true;
        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.setModelHasChanged(true);
        filter.apply(false, true);

        expect(hidePopup).toHaveBeenCalledTimes(0);
    });

    it.each([undefined, false])('does not close popup if closeOnApply is %s', value => {
        const hidePopup = jest.fn();
        // @ts-ignore
        const params = mock<IProvidedFilterParams>('filterChangedCallback');

        // mocking library does not set property correctly for falsy values, so we have to do this instead
        Object.defineProperty(params, 'closeOnApply', { get: () => value, set: () => { } });

        const filter = new TestFilter(params);

        filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
        filter.setModelHasChanged(true);
        filter.apply();

        expect(hidePopup).not.toHaveBeenCalled();
    });
});
