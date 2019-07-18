import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { CellComp } from "../rendering/cellComp";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { ColDef } from "../entities/colDef";
import { _ } from "../utils";

interface TooltipTarget extends Component {
    getTooltipText(): string;
    getComponentHolder(): ColDef | undefined;

}

interface RegisteredComponent {
    tooltipComp?: Component;
    destroyFunc?: () => void;
    eventDestroyFuncs: (() => void)[];
}

@Bean('tooltipManager')
export class TooltipManager {

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private readonly DEFAULT_HIDE_TOOLTIP_TIMEOUT = 10000;
    private readonly MOUSEOUT_HIDE_TOOLTIP_TIMEOUT = 1000;
    private readonly MOUSEOVER_SHOW_TOOLTIP_TIMEOUT = 2000;
    private readonly HIDE_SHOW_ONLY = true;

    private showTimeoutId: number = 0;
    private hideTimeoutId: number = 0;
    private activeComponent: TooltipTarget | undefined;
    private lastHoveredComponent: TooltipTarget | undefined;
    private lastMouseEvent: MouseEvent | undefined;

    // map of compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: RegisteredComponent } = {};

    public registerTooltip(targetCmp: TooltipTarget): void {
        const el = targetCmp.getGui();
        const id = targetCmp.getCompId();

        this.registeredComponents[id] = {
            tooltipComp: undefined,
            destroyFunc: undefined,
            eventDestroyFuncs: [
                targetCmp.addDestroyableEventListener(el, 'mouseover', (e) => this.processMouseOver(e, targetCmp)),
                targetCmp.addDestroyableEventListener(el, 'mousemove', (e) => this.processMouseMove(e)),
                targetCmp.addDestroyableEventListener(el, 'mousedown', this.hideTooltip.bind(this)),
                targetCmp.addDestroyableEventListener(el, 'mouseout', this.processMouseOut.bind(this))
            ]
        };
        targetCmp.addDestroyFunc(() => this.unregisterTooltip(targetCmp));
    }

    public unregisterTooltip(targetCmp: TooltipTarget): void {
        const id = targetCmp.getCompId();
        const registeredComponent = this.registeredComponents[id];

        // hide the tooltip if it's being displayed while unregistering the component
        if (this.activeComponent === targetCmp) {
            this.hideTooltip();
        }

        if (targetCmp.isAlive() && registeredComponent && registeredComponent.eventDestroyFuncs.length) {
            registeredComponent.eventDestroyFuncs.forEach(func => func());
        }

        delete this.registeredComponents[id];
    }

    private processMouseOver(e: MouseEvent, targetCmp: TooltipTarget) {
        let delay = this.MOUSEOVER_SHOW_TOOLTIP_TIMEOUT;

        if (this.activeComponent) {
            // lastHoveredComponent will be the activeComponent when we are hovering
            // a component with many child elements like the grid header
            if (this.lastHoveredComponent === this.activeComponent) { return; }

            delay = 200;
        } else if (this.showTimeoutId && this.lastHoveredComponent === targetCmp) { return; }

        this.clearTimers(this.HIDE_SHOW_ONLY);

        // lastHoveredComponent will be the targetCmp when a click hid the tooltip
        // and the lastHoveredComponent has many child elements
        if (this.lastHoveredComponent === targetCmp) { return; }

        this.lastHoveredComponent = targetCmp;
        this.lastMouseEvent = e;
        this.showTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay, e);
    }

    private processMouseOut(e: MouseEvent) {
        const activeComponent = this.activeComponent;
        const relatedTarget = e.relatedTarget as HTMLElement;

        if (!activeComponent) {
            if (this.lastHoveredComponent) {
                const containsElement = this.lastHoveredComponent.getGui().contains(relatedTarget);

                if (this.showTimeoutId && containsElement) {
                    // if we are hovering within a component with multiple child elements before
                    // the tooltip has been displayed, we should cancel this event
                    return;
                } else if (!containsElement) {
                    // when a click hides the tooltip we need to reset the lastHoveredComponent
                    // otherwise the tooltip won't appear until another registered component is hovered.
                    this.lastHoveredComponent = undefined;
                }
            }
            this.clearTimers();
            return;
        }

        // the mouseout was called from within the activeComponent so we do nothing
        if (activeComponent.getGui().contains(relatedTarget)) {
            return;
        }

        const registeredComponent = this.registeredComponents[activeComponent.getCompId()];
        _.addCssClass(registeredComponent.tooltipComp.getGui(), 'ag-tooltip-hiding');
        this.lastHoveredComponent = undefined;
        this.clearTimers();
        this.hideTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.MOUSEOUT_HIDE_TOOLTIP_TIMEOUT);
    }

    private processMouseMove(e: MouseEvent): void {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        this.lastMouseEvent = e;
    }

    private showTooltip(e: MouseEvent): void {
        const targetCmp = this.lastHoveredComponent;
        const cellComp = targetCmp as CellComp;
        const registeredComponent = this.registeredComponents[targetCmp.getCompId()];
        this.hideTooltip();

        const params: ITooltipParams = {
            api: this.gridApi,
            columnApi: this.columnApi,
            colDef: targetCmp.getComponentHolder(),
            column: cellComp.getColumn && cellComp.getColumn(),
            context: this.gridOptionsWrapper.getContext(),
            rowIndex: cellComp.getCellPosition && cellComp.getCellPosition().rowIndex,
            value: targetCmp.getTooltipText()
        };

        this.createTooltipComponent(params, registeredComponent, e);
    }

    private createTooltipComponent(params: ITooltipParams, cmp: RegisteredComponent, e: MouseEvent): void {
        this.userComponentFactory.newTooltipComponent(params).then(tooltipComp => {
            // if the component was unregistered while creating
            // the tooltip (async) we should return undefined here.
            if (!cmp) {
                return;
            }
            cmp.tooltipComp = tooltipComp;
            const eGui = tooltipComp.getGui();

            if (!_.containsClass(eGui, 'ag-tooltip')) {
                _.addCssClass(eGui, 'ag-tooltip-custom');
            }

            const closeFnc = this.popupService.addPopup(false, eGui, false);
            cmp.destroyFunc = () => {
                closeFnc();
                if (tooltipComp.destroy) {
                    tooltipComp.destroy();
                }
            };

            this.popupService.positionPopupUnderMouseEvent({
                type: 'tooltip',
                mouseEvent: this.lastMouseEvent,
                ePopup: eGui,
                nudgeY: 18
            });

            this.activeComponent = this.lastHoveredComponent;
            this.hideTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.DEFAULT_HIDE_TOOLTIP_TIMEOUT);
        });
    }

    private hideTooltip(): void {
        const activeComponent = this.activeComponent;

        this.clearTimers();
        if (!activeComponent) { return; }

        const id = activeComponent.getCompId();
        const registeredComponent = this.registeredComponents[id];

        this.activeComponent = undefined;

        if (!registeredComponent) { return; }
        if (registeredComponent.destroyFunc) {
            registeredComponent.destroyFunc();
        }
        this.clearRegisteredComponent(registeredComponent);
    }

    private clearRegisteredComponent(registeredComponent: RegisteredComponent) {
        delete registeredComponent.destroyFunc;
        delete registeredComponent.tooltipComp;
    }

    private clearTimers(showOnly: boolean = false): void {
        if (this.hideTimeoutId && !showOnly) {
            window.clearTimeout(this.hideTimeoutId);
            this.hideTimeoutId = 0;
        }

        if (this.showTimeoutId) {
            window.clearTimeout(this.showTimeoutId);
            this.showTimeoutId = 0;
        }
    }
}
