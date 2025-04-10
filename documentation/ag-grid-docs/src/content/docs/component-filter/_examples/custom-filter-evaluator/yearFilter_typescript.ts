import type { FilterDisplay, FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

export class YearFilter implements FilterDisplay<any, any, true> {
    eGui!: HTMLDivElement;
    rbAllYears!: HTMLInputElement;
    rbSince2010!: HTMLInputElement;

    init(params: FilterDisplayParams<any, any, true>) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<div class="year-filter">
                <div>Select Year Range</div>
                <label>  
                    <input type="radio" name="yearFilter" checked="true" id="rbAllYears" filter-checkbox="true"/> All
                </label>
                <label>  
                    <input type="radio" name="yearFilter" id="rbSince2010" filter-checkbox="true"/> Since 2010
                </label>
            </div>`;
        this.rbAllYears = this.eGui.querySelector('#rbAllYears')!;
        this.rbSince2010 = this.eGui.querySelector('#rbSince2010')!;

        this.refresh(params);

        const onRbChanged = () => {
            const value = this.rbSince2010.checked || null;
            params.onStateChange({
                model: value,
            });
        };
        this.rbAllYears.addEventListener('change', onRbChanged);
        this.rbSince2010.addEventListener('change', onRbChanged);
    }

    refresh(newParams: FilterDisplayParams<any, any, true, any>): boolean {
        const currentValue = this.rbSince2010.checked || null;
        const newValue = newParams.state.model;
        if (currentValue !== newValue) {
            (newValue ? this.rbSince2010 : this.rbAllYears).checked = true;
        }
        return true;
    }

    getGui() {
        return this.eGui;
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.rbAllYears.focus();
        }
    }
}
