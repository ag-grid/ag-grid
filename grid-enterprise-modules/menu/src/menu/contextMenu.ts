import {
    _,
    AgEvent,
    AgMenuItemComponent,
    AgMenuList,
    Autowired,
    Bean,
    BeanStub,
    CellPosition,
    CellPositionUtils,
    Column,
    ColumnModel,
    Component,
    FocusService,
    GetContextMenuItemsParams,
    IAfterGuiAttachedParams,
    IContextMenuFactory,
    IRangeService,
    MenuItemDef,
    ModuleNames,
    ModuleRegistry,
    Optional,
    PopupService,
    PostConstruct,
    RowNode,
    CtrlsService,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { MenuItemMapper } from "./menuItemMapper";
import { MenuUtils } from "./menuUtils";

const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';

@Bean('contextMenuFactory')
export class ContextMenuFactory extends BeanStub implements IContextMenuFactory {

    @Autowired('popupService') private popupService: PopupService;
    @Optional('rangeService') private rangeService: IRangeService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('menuUtils') private menuUtils: MenuUtils;

    private activeMenu: ContextMenu | null;

    public hideActiveMenu(): void {
        this.destroyBean(this.activeMenu);
    }

    private getMenuItems(node: RowNode | null, column: Column | null, value: any): (MenuItemDef | string)[] | undefined {
        const defaultMenuOptions: string[] = [];

        if (_.exists(node) && ModuleRegistry.__isRegistered(ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }

        if (this.gridOptionsService.get('enableCharts') && ModuleRegistry.__isRegistered(ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }

            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }

        if (_.exists(node)) {
            // if user clicks a cell
            const csvModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
            const excelModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
            const suppressExcel = this.gridOptionsService.get('suppressExcelExport') || excelModuleMissing;
            const suppressCsv = this.gridOptionsService.get('suppressCsvExport') || csvModuleMissing;
            const onIPad = _.isIOSUserAgent();
            const anyExport: boolean = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }

        const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : undefined;
        const columnContextMenuItems = column?.getColDef().contextMenuItems;
        if (Array.isArray(columnContextMenuItems)) {
            return columnContextMenuItems;
        } else if (typeof columnContextMenuItems === 'function') {
            return columnContextMenuItems(this.gridOptionsService.addGridCommonParams({
                column, node, value, defaultItems
            }));
        } else {
            const userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
            if (userFunc) {
                return userFunc({ column, node, value, defaultItems });
            } else {
                return defaultMenuOptions;
            }
        }
    }

    public onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: Column | null, value: any, anchorToElement: HTMLElement): void {
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement));
    }

    public showMenu(node: RowNode | null, column: Column | null, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean {
        const menuItems = this.getMenuItems(node, column, value);
        const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();

        if (menuItems === undefined || _.missingOrEmpty(menuItems)) { return false; }

        const menu = new ContextMenu(menuItems, column, node, value);
        this.createBean(menu);

        const eMenuGui = menu.getGui();

        const positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: () => {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gridOptionsService.get('enableRtl');
                this.popupService.positionPopupUnderMouseEvent({
                    ...positionParams,
                    nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1
                });
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu')
        });

        if (addPopupRes) {
            eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
            menu.afterGuiAttached({ container: 'contextMenu', hidePopup: addPopupRes.hideFunc });
        }

        // there should never be an active menu at this point, however it was found
        // that you could right click a second time just 1 or 2 pixels from the first
        // click, and another menu would pop up. so somehow the logic for closing the
        // first menu (clicking outside should close it) was glitchy somehow. an easy
        // way to avoid this is just remove the old context menu here if it exists.
        if (this.activeMenu) {
            this.hideActiveMenu();
        }

        this.activeMenu = menu;

        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });

        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, addPopupRes.hideFunc);
        }

        return true;
    }
}

class ContextMenu extends Component {

    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('cellPositionUtils') private cellPositionUtils: CellPositionUtils;

    private menuList: AgMenuList | null = null;
    private focusedCell: CellPosition | null = null;

    constructor(
        private readonly menuItems: (MenuItemDef | string)[],
        private readonly column: Column | null,
        private readonly node: RowNode | null,
        private readonly value: any
    ) {
        super(/* html */`<div class="${CSS_MENU}" role="presentation"></div>`);
    }

    @PostConstruct
    private addMenuItems(): void {
        const menuList = this.createManagedBean(new AgMenuList(0, {
            column: this.column,
            node: this.node,
            value: this.value
        }));
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null, () => this.getGui());

        menuList.addMenuItems(menuItemsMapped);

        this.appendChild(menuList);
        this.menuList = menuList;

        menuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, (e: AgEvent) => this.dispatchEvent(e));
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }

        this.focusedCell = this.focusService.getFocusedCell();

        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    }

    private restoreFocusedCell(): void {
        const currentFocusedCell = this.focusService.getFocusedCell();

        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            const { rowIndex, rowPinned, column } = this.focusedCell;
            const doc = this.gridOptionsService.getDocument();

            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true });
            }
        }
    }

    protected destroy(): void {
        this.restoreFocusedCell();
        super.destroy();
    }
}
