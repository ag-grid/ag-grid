import type { Column, IFilterComp, IMenuItemComp, IMenuItemParams } from 'ag-grid-community';

export interface CustomMenuItemParams extends IMenuItemParams {
    column: Column;
}

export class MenuItem implements IMenuItemComp {
    eGui!: HTMLDivElement;
    eOption!: HTMLDivElement;
    eFilterWrapper!: HTMLDivElement;
    eIcon!: HTMLSpanElement;
    filterDisplayed: boolean = false;
    clickListener!: () => void;
    mouseEnterListener!: () => void;
    mouseLeaveListener!: () => void;
    optionKeyDownListener!: (e: KeyboardEvent) => void;
    filterWrapperKeyDownListener!: (e: KeyboardEvent) => void;

    init(params: CustomMenuItemParams): void {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
            <div tabindex="-1" class="ag-menu-option">
                <span class="ag-menu-option-part ag-menu-option-icon" role="presentation">
                    <span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>
                </span>
                <span class="ag-menu-option-part ag-menu-option-text">Filter</span>
                <span class="ag-menu-option-part ag-menu-option-popup-pointer">
                    <span class="ag-icon ag-icon-tree-closed" unselectable="on" role="presentation"></span>
                </span>
            </div>
            <div class="filter-wrapper"></div>
        `;
        this.eOption = this.eGui.querySelector('.ag-menu-option')!;
        this.eFilterWrapper = this.eGui.querySelector('.filter-wrapper')!;
        this.eIcon = this.eGui.querySelector('.ag-icon-tree-closed')!;
        this.eFilterWrapper.style.display = 'none';
        params.api.getColumnFilterInstance<IFilterComp>(params.column).then((filter) => {
            this.eFilterWrapper.appendChild(filter!.getGui());
        });

        this.clickListener = () => {
            // expand/collapse the filter
            this.eFilterWrapper.style.display = this.filterDisplayed ? 'none' : 'block';
            this.eIcon.classList.toggle('ag-icon-tree-closed', this.filterDisplayed);
            this.eIcon.classList.toggle('ag-icon-tree-open', !this.filterDisplayed);
            this.filterDisplayed = !this.filterDisplayed;
        };
        this.eOption.addEventListener('click', this.clickListener);
        this.mouseEnterListener = () => {
            this.setActive(true);
            params.onItemActivated();
        };
        this.eOption.addEventListener('mouseenter', this.mouseEnterListener);
        this.mouseLeaveListener = () => this.setActive(false);
        this.eOption.addEventListener('mouseleave', this.mouseLeaveListener);
        this.optionKeyDownListener = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.clickListener();
            }
        };
        this.eOption.addEventListener('keydown', this.optionKeyDownListener);
        this.filterWrapperKeyDownListener = (e: KeyboardEvent) => {
            // stop the menu from handling keyboard navigation inside the filter
            e.stopPropagation();
        };
        this.eFilterWrapper.addEventListener('keydown', this.filterWrapperKeyDownListener);
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    setActive(active: boolean): void {
        if (active) {
            this.eOption.classList.add('ag-menu-option-active');
            this.eOption.focus();
        } else {
            this.eOption.classList.remove('ag-menu-option-active');
        }
    }

    destroy(): void {
        // remove the listeners
        this.eOption.removeEventListener('click', this.clickListener);
        this.eOption.removeEventListener('mouseenter', this.mouseEnterListener);
        this.eOption.removeEventListener('mouseleave', this.mouseLeaveListener);
        this.eOption.removeEventListener('keydown', this.optionKeyDownListener);
        this.eFilterWrapper.removeEventListener('keydown', this.filterWrapperKeyDownListener);
    }
}
