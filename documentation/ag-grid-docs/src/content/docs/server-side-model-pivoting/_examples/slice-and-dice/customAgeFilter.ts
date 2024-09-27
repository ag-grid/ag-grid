import type { IDoesFilterPassParams, IFilterComp, IFilterParams } from 'ag-grid-community';

export class CustomAgeFilter implements IFilterComp {
    eGui!: HTMLElement;
    filterValue: number | null = null;
    params: IFilterParams;

    init(params: IFilterParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<div>  
            <label>    
                <input type="radio" name="ageFilterValue" data-ref="btAll" checked/> All  
            </label>  
            <label>    
                <input type="radio" name="ageFilterValue" data-ref="bt20"/> 20  
            </label>  
            <label>    
                <input type="radio" name="ageFilterValue" data-ref="bt22"/> 22  
            </label>
          </div>`;

        this.filterValue = null;
        this.params = params;

        // var that = this;

        this.eGui.querySelector('[data-ref="btAll"]')!.addEventListener('change', this.onSelection.bind(this, null));
        this.eGui.querySelector('[data-ref="bt20"]')!.addEventListener('change', this.onSelection.bind(this, 20));
        this.eGui.querySelector('[data-ref="bt22"]')!.addEventListener('change', this.onSelection.bind(this, 22));
    }

    onSelection(value: number | null) {
        this.filterValue = value;
        this.params.filterChangedCallback();
    }

    getGui() {
        return this.eGui;
    }

    isFilterActive() {
        return this.filterValue !== null;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        // not needed for server side filtering
        const { node } = params;
        const value = this.params.getValue(node);
        return value == this.filterValue;
    }

    getModel() {
        if (this.filterValue === null) {
            return null;
        } else {
            // the format of what you return depends on your server side, just
            // return something that your server side can work with.
            return {
                filter: this.filterValue,
                type: 'equals',
            };
        }
    }

    setModel(model: any) {
        if (model && model.filter === 20) {
            this.eGui.querySelector<HTMLInputElement>('[data-ref="bt20"]')!.checked = true;
            this.filterValue = 20;
        } else if (model && model.filter === 22) {
            this.eGui.querySelector<HTMLInputElement>('[data-ref="bt22"]')!.checked = true;
            this.filterValue = 22;
        } else {
            this.eGui.querySelector<HTMLInputElement>('[data-ref="btAll"]')!.checked = true;
            this.filterValue = null;
        }
    }
}
