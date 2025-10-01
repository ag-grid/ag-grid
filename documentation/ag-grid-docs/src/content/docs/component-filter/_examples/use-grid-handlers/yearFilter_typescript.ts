import type {
    FilterDisplay,
    FilterDisplayParams,
    FilterWrapperParams,
    IAfterGuiAttachedParams,
    ISimpleFilterModelType,
    NumberFilterModel,
} from 'ag-grid-community';

let id = 1;

export class YearFilter implements FilterDisplay<any, any, NumberFilterModel> {
    eGui!: HTMLDivElement;
    rbAllYears!: HTMLInputElement;
    rbBefore2010!: HTMLInputElement;
    rbSince2010!: HTMLInputElement;

    init(params: FilterDisplayParams<any, any, NumberFilterModel> & FilterWrapperParams) {
        this.eGui = document.createElement('div');
        // name needs to be unique within the DOM.
        // e.g. if filter is on multiple columns and open simultaneously in filter tool panel
        let compId = id++;
        this.eGui.innerHTML = `<div class="year-filter">
                <div>Select Year Range</div>
                <label>
                    <input type="radio" name="year${compId}" checked="true" id="rbAllYears${compId}" filter-checkbox="true"/> All
                </label>
                <label>
                    <input type="radio" name="year${compId}" id="rbBefore2010${compId}" filter-checkbox="true"/> Before 2010
                </label>
                <label>
                    <input type="radio" name="year${compId}" id="rbSince2010${compId}" filter-checkbox="true"/> Since 2010
                </label>
            </div>`;
        this.rbAllYears = this.eGui.querySelector(`#rbAllYears${compId}`)!;
        this.rbBefore2010 = this.eGui.querySelector(`#rbBefore2010${compId}`)!;
        this.rbSince2010 = this.eGui.querySelector(`#rbSince2010${compId}`)!;

        this.refresh(params);

        const onRbChanged = () => {
            let type: ISimpleFilterModelType | undefined;
            if (this.rbSince2010.checked) {
                type = 'greaterThan';
            } else if (this.rbBefore2010.checked) {
                type = 'lessThan';
            }
            const model: NumberFilterModel | null = type
                ? {
                      type,
                      filterType: 'number',
                      filter: 2010,
                  }
                : null;
            params.onStateChange({
                model,
            });
            if (!params.buttons?.includes('apply')) {
                params.onAction('apply');
            }
        };
        this.rbAllYears.addEventListener('change', onRbChanged);
        this.rbBefore2010.addEventListener('change', onRbChanged);
        this.rbSince2010.addEventListener('change', onRbChanged);
    }

    refresh(newParams: FilterDisplayParams<any, any, NumberFilterModel>): boolean {
        let currentValue: ISimpleFilterModelType | undefined;
        if (this.rbSince2010.checked) {
            currentValue = 'greaterThan';
        } else if (this.rbBefore2010.checked) {
            currentValue = 'lessThan';
        }
        const newValue = newParams.state.model?.type;
        if (currentValue !== newValue) {
            if (newValue === 'greaterThan') {
                this.rbSince2010.checked = true;
            } else if (newValue === 'lessThan') {
                this.rbBefore2010.checked = true;
            } else {
                this.rbAllYears.checked = true;
            }
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
