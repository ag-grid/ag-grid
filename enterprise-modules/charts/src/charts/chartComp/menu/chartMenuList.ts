import {
    AgMenuItemComponent,
    AgMenuList,
    Autowired,
    Bean,
    BeanStub,
    Component,
    FocusService,
    IAfterGuiAttachedParams,
    MenuItemDef,
    PopupService,
    PostConstruct,
    RefSelector,
    _
} from '@ag-grid-community/core';
import { ChartController } from '../chartController';
import { ChartMenuService } from '../services/chartMenuService';

@Bean('chartMenuListFactory')
export class ChartMenuListFactory extends BeanStub {
    @Autowired('popupService') private readonly popupService: PopupService;
    @Autowired('chartMenuService') private readonly chartMenuService: ChartMenuService;

    private activeChartMenuList?: ChartMenuList;

    public showMenuList(params: {
        eventSource: HTMLElement,
        showMenu: () => void,
        chartController: ChartController
    }) {
        const { eventSource, showMenu, chartController } = params;
        const chartMenuList = this.createBean(new ChartMenuList(this.getMenuItems(chartController, showMenu)));
        this.activeChartMenuList = chartMenuList;

        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        if (this.gridOptionsService.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }

        const eGui = chartMenuList.getGui()

        this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: () => {
                this.destroyBean(chartMenuList);
                this.activeChartMenuList = undefined;
            },
            afterGuiAttached: params => chartMenuList.afterGuiAttached(params),
            positionCallback: () => {
                {
                    this.popupService.positionPopupByComponent({
                        type: 'chartMenu',
                        eventSource,
                        ePopup: eGui,
                        alignSide,
                        nudgeX: 4 * multiplier,
                        nudgeY: 4,
                        position: 'under',
                        keepWithinBounds: true,
                    });
                }
            },
            ariaLabel: 'Chart Menu'
        });
    }

    private getMenuItems(
        chartController: ChartController,
        showMenu: () => void
    ): (MenuItemDef | string)[] {
        return [
            this.createMenuItem('Edit Chart', 'chart', showMenu),
            chartController.isChartLinked()
                ? this.createMenuItem('Unlink from Grid', 'unlinked', () => this.chartMenuService.toggleLinked(chartController))
                : this.createMenuItem('Link to Grid', 'linked', () => this.chartMenuService.toggleLinked(chartController)),
            this.createMenuItem('Download Chart', 'save', () => this.chartMenuService.downloadChart(chartController))
        ];
    }

    private createMenuItem(name: string, iconName: string, action: () => void): MenuItemDef {
        return {
            name,
            icon: _.createIconNoSpan(iconName, this.gridOptionsService, null),
            action
        }
    }

    protected destroy(): void {
        this.destroyBean(this.activeChartMenuList);
        super.destroy();
    }
}

class ChartMenuList extends Component {
    @Autowired('focusService') private readonly focusService: FocusService;

    @RefSelector('eChartsMenu') private readonly eChartsMenu: HTMLElement;

    private hidePopupFunc: () => void;
    private mainMenuList: AgMenuList;

    constructor(private readonly menuItems: (MenuItemDef | string)[]) {
        super(/* html */`
            <div ref="eChartsMenu" role="presentation" class="ag-menu ag-charts-menu"></div>
        `);
    }

    @PostConstruct
    private init(): void {
        this.mainMenuList = this.createManagedBean(new AgMenuList(0));
        this.mainMenuList.addMenuItems(this.menuItems);
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.eChartsMenu.appendChild(this.mainMenuList.getGui());
    }

    private onHidePopup(): void {
        this.hidePopupFunc?.();
    }

    public afterGuiAttached({ hidePopup }: IAfterGuiAttachedParams): void {
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
        this.focusService.focusInto(this.mainMenuList.getGui());
    }
}