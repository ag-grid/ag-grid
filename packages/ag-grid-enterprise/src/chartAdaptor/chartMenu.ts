import {
    _,
    Autowired,
    Component,
    IComponent,
    MenuItemDef,
    PostConstruct,
    RefSelector,
    Dialog,
    PopupService,
    GridOptionsWrapper
} from "ag-grid-community";
import {MenuItemMapper} from "../menu/menuItemMapper";
import {MenuList} from "../menu/menuList";
import {MenuItemComponent} from "../menu/menuItemComponent";

export class ChartMenu extends Component {

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartMenu" class="ag-icon-menu"></span>
        </div>`;

    @RefSelector('eChartMenu') private eChartMenu: HTMLElement;

    private chart: Component;

    constructor(chart: Component) {
        super(ChartMenu.TEMPLATE);
        this.chart = chart;
    }

    @Autowired('popupService') private popupService: PopupService;

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartMenu, 'click', () => this.showMenu());
    }

    private showMenu(): void {
        const menu = new Menu(this.chart);

        this.getContext().wireBean(menu);

        const hidePopup = this.popupService.addAsModalPopup(
            menu.getGui(),
            true,
            () => menu.destroy.bind(this)
        );

        this.popupService.positionPopupUnderComponent(
            {
                type: 'chartMenu',
                eventSource: this.eChartMenu,
                ePopup: menu.getGui(), keepWithinBounds: true
            });

        menu.addDestroyFunc(() => hidePopup());
    }
}

class Menu extends Component implements IComponent<any> {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;

    private chart: Component;

    constructor(chartMenu: Component) {
        super('<div class="ag-menu"></div>');
        this.chart = chartMenu;
    }

    @PostConstruct
    private addMenuItems(): void {
        const menuList = new MenuList();
        this.getContext().wireBean(menuList);

        menuList.addMenuItems(this.getMenuItems());

        this.appendChild(menuList);
        menuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.destroy.bind(this));
    }

    private getMenuItems(): (MenuItemDef )[] {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        return [{
            name: localeTextFunc('closeDialog', 'Close'),
            action: () => {
                const chartContainer = this.chart.getContainer();
                (chartContainer as Dialog).close();
            }
        }];
    }
}