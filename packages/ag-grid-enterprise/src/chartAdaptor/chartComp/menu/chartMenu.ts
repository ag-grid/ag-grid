import {
    AgEvent,
    Component,
    PostConstruct,
    Promise,
    RefSelector,
    Dialog,
    _
} from "ag-grid-community";
import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
import { GridChartComp } from "../gridChartComp";

export class ChartMenu extends Component {

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartButton" class="ag-icon ag-icon-chart"></span>
            <span ref="eDataButton" class="ag-icon ag-icon-data"></span>
            <span ref="eSaveButton" class="ag-icon ag-icon-save"></span>
        </div>`;

    @RefSelector('eChartButton') private eChartButton: HTMLElement;
    @RefSelector('eDataButton') private eDataButton: HTMLElement;
    @RefSelector('eSaveButton') private eSaveButton: HTMLElement;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;
    private menuDialog: Dialog;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartButton, 'click', () => this.showMenu(0));
        this.addDestroyableEventListener(this.eDataButton, 'click', () => this.showMenu(1));
        this.addDestroyableEventListener(this.eSaveButton, 'click', () => this.saveChart());
    }

    private saveChart() {
        const event: AgEvent = {
            type: ChartMenu.EVENT_DOWNLOAD_CHART
        };
        this.dispatchEvent(event);
    }

    private showMenu(tab: number): void {
        const chartComp = this.parentComponent as GridChartComp;
        const parentGui = chartComp.getGui();
        const parentRect = parentGui.getBoundingClientRect();

        this.menuDialog = new Dialog({
            alwaysOnTop: true,
            movable: true,
            resizable: {
                bottom: true,
                top: true
            },
            maximizable: false,
            minWidth: 220,
            width: 220,
            height: Math.min(390, parentRect.height),
            x: parentRect.right - 225,
            y: parentRect.top + 5
        });

        this.tabbedMenu = new TabbedChartMenu(this.chartController, chartComp.getCurrentChartType());

        new Promise((res) => {
            window.setTimeout(() => {
                this.menuDialog.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(tab);
            }, 100);
        });

        this.menuDialog.addDestroyableEventListener(this.menuDialog, Component.EVENT_DESTROYED, () => {
            this.tabbedMenu.destroy();
        });

        const context = this.getContext();

        context.wireBean(this.menuDialog);
        context.wireBean(this.tabbedMenu);

        this.menuDialog.setParentComponent(this);
    }

    public destroy() {
        super.destroy();
        if (this.tabbedMenu) {
            this.menuDialog.destroy();
        }
    }
}