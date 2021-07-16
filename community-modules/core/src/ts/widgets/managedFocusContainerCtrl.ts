import { BeanStub } from "../context/beanStub";
import { Autowired } from "../context/context";
import { FocusService } from "../focusService";
import { ManagedFocusFeature } from "./managedFocusFeature";

export interface IManagedFocusContainer {
    getFocusableElement(): HTMLElement;
    tabGuardsAreActive(): boolean;
    shouldStopEventPropagation(): boolean;
    onTabKeyDown(e: KeyboardEvent): void;
    handleKeyDown(e: KeyboardEvent): void;
    onFocusIn(e: FocusEvent): void;
    onFocusOut(e: FocusEvent): void;
}

export class ManagedFocusContainerCtrl extends BeanStub {
    @Autowired('focusService') private readonly focusService: FocusService;

    private comp: IManagedFocusContainer;

    public setComp(comp: IManagedFocusContainer) {
        this.comp = comp;
        this.createManagedBean(new ManagedFocusFeature(
            comp.getFocusableElement(),
            comp.shouldStopEventPropagation,
            comp.onTabKeyDown,
            comp.handleKeyDown,
            comp.onFocusIn,
            comp.onFocusOut
        ));
    }

    public getGridTabIndex(): string {
        return this.gridOptionsWrapper.getGridTabIndex();
    }

    public focusInnerElement(fromBottom = false): void {
        const focusable = this.focusService.findFocusableElements(this.comp.getFocusableElement());
    
        if (this.comp.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }

        if (!focusable.length) { return; }

        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    }

    public getNextFocusableElement(backwards?: boolean): HTMLElement | null {
        return this.focusService.findNextFocusableElement(this.comp.getFocusableElement(), false, backwards);
    }
}