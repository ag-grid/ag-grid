import type { FilterDisplay, FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

export class PersonFilter implements FilterDisplay<any, any, string> {
    gui!: HTMLDivElement;
    eFilterText!: HTMLInputElement;

    init(params: FilterDisplayParams<any, any, string>) {
        this.gui = document.createElement('div');
        this.gui.innerHTML = `<div class="person-filter">
                <div>Custom Athlete Filter</div>
                <div>
                    <input type="text" id="filterText" placeholder="Full name search..."/>
                </div>
                <div>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
            </div>
        `;
        this.eFilterText = this.gui.querySelector('#filterText')!;

        this.refresh(params);

        const listener = (event: any) => {
            const value = event.target.value;
            params.onModelChange(value == null || value === '' ? null : value);
        };

        this.eFilterText.addEventListener('changed', listener);
        this.eFilterText.addEventListener('paste', listener);
        this.eFilterText.addEventListener('input', listener);
    }

    refresh(newParams: FilterDisplayParams<any, any, string, any>): boolean {
        const currentValue = this.eFilterText.value;
        const newValue = newParams.model ?? '';
        if (newValue !== currentValue) {
            this.eFilterText.value = newValue;
        }
        return true;
    }

    getGui() {
        return this.gui;
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.eFilterText.focus();
        }
    }
}
