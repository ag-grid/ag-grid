import {
    _,
    Bean,
    Autowired,
    PostConstruct,
    BeanStub,
    Column,
    Component,
    Context,
    EventService,
    GetContextMenuItems,
    GetContextMenuItemsParams,
    GridOptionsWrapper,
    IAfterGuiAttachedParams,
    IComponent,
    IContextMenuFactory,
    IRowModel,
    MenuItemDef,
    PopupService,
    RowNode,
    ModuleNames,
    ColumnController
} from "ag-grid-community";
import { MenuItemComponent } from "./menuItemComponent";
import { MenuList } from "./menuList";
import { MenuItemMapper } from "./menuItemMapper";
import { RangeController } from "../rangeController";

@Bean('contextMenuFactory')
export class ContextMenuFactory implements IContextMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('columnController') private columnController: ColumnController;

    private activeMenu: ContextMenu | null;

    @PostConstruct
    private init(): void {
    }

    public hideActiveMenu(): void {
        if (!this.activeMenu) {
            return;
        }

        this.activeMenu.destroy();
    }

    private getMenuItems(node: RowNode, column: Column, value: any): (MenuItemDef | string)[] | undefined {
        const defaultMenuOptions: string[] = [];

        if (_.exists(node)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'paste', 'separator');
            }
        } else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            // nothing to show, perhaps tool panels???
        }

        if (this.gridOptionsWrapper.isEnableCharts() && this.context.isModuleRegistered(ModuleNames.ChartsModule)) {

            if (this.columnController.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            // else {
            //     defaultMenuOptions.push('pivotChartAndPivotMode');
            // }

            if (!this.rangeController.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }

        if (_.exists(node)) {
            // if user clicks a cell
            const suppressExcel = this.gridOptionsWrapper.isSuppressExcelExport();
            const suppressCsv = this.gridOptionsWrapper.isSuppressCsvExport();
            const onIPad = _.isUserAgentIPad();
            const anyExport: boolean = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }

        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            const userFunc: GetContextMenuItems | undefined = this.gridOptionsWrapper.getContextMenuItemsFunc();
            const params: GetContextMenuItemsParams = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            return userFunc ? userFunc(params) : undefined;
        }

        return defaultMenuOptions;
    }

    public showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): void {
        const menuItems = this.getMenuItems(node, column, value);

        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
            return;
        }

        const menu = new ContextMenu(menuItems);
        this.context.wireBean(menu);

        const eMenuGui = menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        const hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            () => menu.destroy(),
            mouseEvent
        );

        this.popupService.positionPopupUnderMouseEvent({
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });

        menu.afterGuiAttached({
            hidePopup: hidePopup
        });

        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
    }
}

class ContextMenu extends Component implements IComponent<any> {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;

    private menuItems: (MenuItemDef | string)[];

    constructor(menuItems: (MenuItemDef | string)[]) {
        super('<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }

    @PostConstruct
    private addMenuItems(): void {
        const menuList = new MenuList();
        this.getContext().wireBean(menuList);

        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);

        menuList.addMenuItems(menuItemsMapped);

        this.appendChild(menuList);
        menuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.destroy.bind(this));
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }

        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', this.destroy.bind(this));
    }
}
