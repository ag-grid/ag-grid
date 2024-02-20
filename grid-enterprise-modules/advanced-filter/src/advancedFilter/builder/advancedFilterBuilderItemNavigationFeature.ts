import { BeanStub, Component, KeyCode, PostConstruct, _ } from "@ag-grid-community/core";

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
                        _.stopPropagationForAgGrid(event);
                    }
                    break;
                case KeyCode.UP:
                case KeyCode.DOWN:
                    // if this hasn't been handled by an editor, prevent virtual list navigation
                    _.stopPropagationForAgGrid(event);
                    break;
                case KeyCode.ESCAPE:
                    if (_.isStopPropagationForAgGrid(event)) { return; }
                    const eDocument = this.gridOptionsService.getDocument();
                    if (this.eGui.contains(eDocument.activeElement)) {
                        event.preventDefault();
                        _.stopPropagationForAgGrid(event);
                        this.focusWrapper.focus();
                    }
                    break;
            }
        });
        this.addManagedListener(this.focusWrapper, 'keydown', (event: KeyboardEvent) => {
            switch (event.key) {
                case KeyCode.ENTER:
                    if (_.isStopPropagationForAgGrid(event)) { return; }
                    const eDocument = this.gridOptionsService.getDocument();
                    if (eDocument.activeElement === this.focusWrapper) {
                        event.preventDefault();
                        _.stopPropagationForAgGrid(event);
                        this.eFocusableComp.getFocusableElement().focus();
                    }
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
