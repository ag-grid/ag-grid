import type {
    FilterDisplay,
    FilterDisplayParams,
    FilterWrapperParams,
    IAfterGuiAttachedParams,
} from 'ag-grid-community';

let id = 1;

export class YearFilter implements FilterDisplay<any, any, true> {
    eGui!: HTMLDivElement;
    rbAllYears!: HTMLInputElement;
    rbSince2010!: HTMLInputElement;

    init(params: FilterDisplayParams<any, any, true> & FilterWrapperParams) {
        this.eGui = document.createElement('div');
        let compId = id++;
        this.eGui.innerHTML = `<div class="year-filter">
                <div>Select Year Range</div>
                <label>  
                    <input type="radio" name="year${compId}" checked="true" id="rbAllYears${compId}" filter-checkbox="true"/> All
                </label>
                <label>  
                    <input type="radio" name="year${compId}" id="rbSince2010${compId}" filter-checkbox="true"/> Since 2010
                </label>
            </div>`;
        this.rbAllYears = this.eGui.querySelector(`#rbAllYears${compId}`)!;
        this.rbSince2010 = this.eGui.querySelector(`#rbSince2010${compId}`)!;

        this.refresh(params);

        const onRbChanged = () => {
            const value = this.rbSince2010.checked || null;
            params.onModelChange(value);
        };
        this.rbAllYears.addEventListener('change', onRbChanged);
        this.rbSince2010.addEventListener('change', onRbChanged);
    }

    refresh(newParams: FilterDisplayParams<any, any, true, any>): boolean {
        const currentValue = this.rbSince2010.checked || null;
        const newValue = newParams.model;
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
