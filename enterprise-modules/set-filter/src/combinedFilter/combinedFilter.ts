import { ProvidedFilter, Promise, ProvidedFilterModel, IDoesFilterPassParams } from '@ag-grid-community/core';

export class CombinedFilter extends ProvidedFilter {
    doesFilterPass(params: IDoesFilterPassParams): boolean {
        return true;
    }
    protected updateUiVisibility(): void {
    }
    protected createBodyTemplate(): string {
        return `<div>Combined filter</div>`;
    }
    protected getCssIdentifier(): string {
        return 'ag-grid-combined-filter';
    }
    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return Promise.resolve();
    }
    protected setModelIntoUi(model: ProvidedFilterModel): Promise<void> {
        return Promise.resolve();
    }
    protected areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean {
        return false;
    }
    getModelFromUi(): ProvidedFilterModel {
        return null;
    }
}