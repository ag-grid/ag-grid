import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { TooltipComponent } from "../rendering/tooltipComponent";
import { PopupService } from "./popupService";
import {ComponentResolver, DynamicComponentParams} from "../components/framework/componentResolver";
import {ColDef} from "../entities/colDef";

@Bean('tooltipManager')
export class TooltipManager {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;

    // map if compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: {comp: Component | undefined, destroyFunc: () => void | undefined} } = {};

    public registerTooltip(cmp: Component, el: HTMLElement): void {
        cmp.addDestroyableEventListener(el, 'mouseover', (e) => this.showTooltip(e, cmp));
        cmp.addDestroyableEventListener(el, 'mouseout', (e) => this.hideTooltip(e, cmp));
        this.registeredComponents[cmp.getCompId()] = {comp: undefined, destroyFunc: undefined};
    }

    public unregisterTooltip(cmp: Component): void {
        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        const tooltipComp = registeredComp.comp;

        if (tooltipComp) {
            if (registeredComp.destroyFunc) {
                registeredComp.destroyFunc();
            }
            tooltipComp.destroy();
            delete this.registeredComponents[id];
        }
    }

    private showTooltip(e: MouseEvent, cmp: Component): void {

        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        if (!registeredComp.comp) {
            let params: DynamicComponentParams = null;
            let colDef: ColDef = null;

            // const tooltipComp = this.componentResolver.getComponentToUse(colDef, 'tooltipComp', params);

            registeredComp.comp = new TooltipComponent();
        }

        registeredComp.destroyFunc = this.popupService.addPopup(false, registeredComp.comp.getGui(), false);

        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: e,
            ePopup: registeredComp.comp.getGui()
        });
    }

    private hideTooltip(e: MouseEvent, cmp: Component): void {
        const id = cmp.getCompId();
        const rec = this.registeredComponents[id];
        if (!rec || !rec.destroyFunc) { return; }

        rec.destroyFunc();
    }
}