import { BeanStub, Component, KeyCode, PostConstruct } from "@ag-grid-community/core";

export class AdvancedFilterBuilderItemNavigationFeature extends BeanStub {
    constructor(
        private readonly eGui: HTMLElement,
        private readonly focusWrapper: HTMLElement,
        private readonly eFocusableComp: Component
    ) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eGui, 'keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.TAB:
                    if (!event.defaultPrevented) {
                        // tab guard handled the navigation. stop from reaching virtual list
                        event.stopPropagation();
                    }
                    break;
                case KeyCode.UP:
                case KeyCode.DOWN:
                    // if this hasn't been handled by an editor, prevent virtual list navigation
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case KeyCode.ESCAPE:
                    const eDocument = this.gridOptionsService.getDocument();
                    if (this.eGui.contains(eDocument.activeElement)) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.focusWrapper.focus();
                    }
                    break;
            }
        });
        this.addManagedListener(this.focusWrapper, 'keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.ENTER:
                    this.eFocusableComp.getFocusableElement().focus();
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        });
        this.addManagedListener(this.focusWrapper, 'focusin', () => {
            this.focusWrapper.classList.add('ag-advanced-filter-builder-virtual-list-item-highlight');
        });
        this.addManagedListener(this.focusWrapper, 'focusout', (event: FocusEvent) => {
            if (!this.focusWrapper.contains(event.relatedTarget as HTMLElement)) {
                this.focusWrapper.classList.remove('ag-advanced-filter-builder-virtual-list-item-highlight');
            }
        });
    }
}
