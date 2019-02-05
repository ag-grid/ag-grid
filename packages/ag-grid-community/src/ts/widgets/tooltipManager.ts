import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { TooltipComponent } from "../rendering/tooltipComponent";
import { PopupService } from "./popupService";
import { _ } from "../utils";

@Bean('tooltipManager')
export class TooltipManager {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('popupService') private popupService: PopupService;

    private registeredComponents: { [key: string]: [Component | undefined, () => void | undefined] } = {};

    public registerTooltip(cmp: Component, el: HTMLElement): void {
        cmp.addDestroyableEventListener(el, 'mouseover', (e) => this.showTooltip(e, el));
        cmp.addDestroyableEventListener(el, 'mouseout', (e) => this.hideTooltip(e, el));
        this.registeredComponents[el.id] = [undefined, undefined];
    }

    public unregisterTooltip(el: HTMLElement): void {
        const id = el.id;
        const rec = this.registeredComponents[id];
        const tooltip = rec[0];

        if (tooltip) {
            if (rec[1]) {
                rec[1]();
            }
            tooltip.destroy();
            delete this.registeredComponents[el.id];
        }
    }

    private showTooltip(e: MouseEvent, el: HTMLElement): void {

        const id = el.id;
        const rec = this.registeredComponents[id];
        if (!rec[0]) {
            rec[0] = new TooltipComponent();
        }

        rec[1] = this.popupService.addPopup(false, rec[0].getGui(), false);

        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: e,
            ePopup: rec[0].getGui()
        });
    }

    private hideTooltip(e: MouseEvent, el: HTMLElement): void {
        const id = el.id;
        const rec = this.registeredComponents[id];
        if (!rec || !rec[1]) { return; }

        rec[1]();
    }
}