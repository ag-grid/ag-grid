import type {
    AgColumn,
    BeanCollection,
    CellPosition,
    CellPositionUtils,
    ColumnModel,
    CtrlsService,
    FocusService,
    IAfterGuiAttachedParams,
    IContextMenuFactory,
    IRangeService,
    MenuItemDef,
    NamedBean,
    PopupService,
    RowNode,
} from 'ag-grid-community';
import {
    BeanStub,
    Component,
    ModuleNames,
    _exists,
    _isIOSUserAgent,
    _isNothingFocused,
    _missingOrEmpty,
} from 'ag-grid-community';
import type { CloseMenuEvent } from '../main';
import { AgMenuList } from '../main';

import type { MenuItemMapper } from './menuItemMapper';
import type { MenuUtils } from './menuUtils';

const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';

export class ContextMenuFactory extends BeanStub implements NamedBean, IContextMenuFactory {
    beanName = 'contextMenuFactory' as const;

    private popupService: PopupService;
    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;
    private menuUtils: MenuUtils;
    private rangeService?: IRangeService;
    private focusService: FocusService;

    public wireBeans(beans: BeanCollection): void {
        this.popupService = beans.popupService;
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
        this.menuUtils = beans.menuUtils as MenuUtils;
        this.rangeService = beans.rangeService;
        this.focusService = beans.focusService;
    }

    private activeMenu: ContextMenu | null;

    public hideActiveMenu(): void {
        this.destroyBean(this.activeMenu);
    }

    private getMenuItems(
        node: RowNode | null,
        column: AgColumn | null,
        value: any
    ): (MenuItemDef | string)[] | undefined {
        const defaultMenuOptions: string[] = [];

        if (_exists(node) && this.gos.isModuleRegistered(ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gos.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }

        if (this.gos.get('enableCharts') && this.gos.isModuleRegistered(ModuleNames.GridChartsModule)) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }

            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }

        if (_exists(node)) {
            // if user clicks a cell
            const csvModuleMissing = !this.gos.isModuleRegistered(ModuleNames.CsvExportModule);
            const excelModuleMissing = !this.gos.isModuleRegistered(ModuleNames.ExcelExportModule);
            const suppressExcel = this.gos.get('suppressExcelExport') || excelModuleMissing;
            const suppressCsv = this.gos.get('suppressCsvExport') || csvModuleMissing;
            const onIPad = _isIOSUserAgent();
            const anyExport: boolean = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }

        const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : undefined;
        const columnContextMenuItems = column?.getColDef().contextMenuItems;

        if (Array.isArray(columnContextMenuItems)) {
            return columnContextMenuItems;
        }

        if (typeof columnContextMenuItems === 'function') {
            return columnContextMenuItems(
                this.gos.addGridCommonParams({
                    column,
                    node,
                    value,
                    defaultItems,
                })
            );
        }

        const userFunc = this.gos.getCallback('getContextMenuItems');
        if (userFunc) {
            return userFunc({ column, node, value, defaultItems });
        }

        return defaultMenuOptions;
    }

    public onContextMenu(
        mouseEvent: MouseEvent | null,
        touchEvent: TouchEvent | null,
        rowNode: RowNode | null,
        column: AgColumn | null,
        value: any,
        anchorToElement: HTMLElement
    ): void {
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) =>
            this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)
        );
    }

    public showMenu(
        node: RowNode | null,
        column: AgColumn | null,
        value: any,
        mouseEvent: MouseEvent | Touch,
        anchorToElement: HTMLElement
    ): boolean {
        const menuItems = this.getMenuItems(node, column, value);
        const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();

        if (menuItems === undefined || _missingOrEmpty(menuItems)) {
            return false;
        }

        const menu = new ContextMenu(menuItems, column, node, value);
        this.createBean(menu);

        const eMenuGui = menu.getGui();

        if (!column) {
            // the context menu has been opened not on a cell, therefore we don't want to
            // display the previous cell as focused, or return focus there after
            this.focusService.clearFocusedCell();
        }

        const positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1,
        };

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e) => {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                this.destroyBean(menu);
                this.dispatchVisibleChangedEvent(false, e === undefined ? 'api' : 'ui');
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gos.get('enableRtl');
                this.popupService.positionPopupUnderMouseEvent({
                    ...positionParams,
                    nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1,
                });
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu'),
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

        menu.addEventListener('destroyed', () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });

        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener('closeMenu', (e: CloseMenuEvent) =>
                addPopupRes.hideFunc({
                    mouseEvent: e.mouseEvent ?? undefined,
                    keyboardEvent: e.keyboardEvent ?? undefined,
                    forceHide: true,
                })
            );
        }

        // we check for a mousedown event because `gridApi.showContextMenu`
        // generates a `mousedown` event to display the context menu.
        const isApi = mouseEvent && mouseEvent instanceof MouseEvent && mouseEvent.type === 'mousedown';
        this.dispatchVisibleChangedEvent(true, isApi ? 'api' : 'ui');

        return true;
    }

    private dispatchVisibleChangedEvent(visible: boolean, source: 'api' | 'ui' = 'ui'): void {
        this.eventService.dispatchEvent({
            type: 'contextMenuVisibleChanged',
            visible,
            source,
        });
    }
}

export type ContextMenuEvent = 'closeMenu';

class ContextMenu extends Component<ContextMenuEvent> {
    private focusService: FocusService;
    private menuItemMapper: MenuItemMapper;
    private cellPositionUtils: CellPositionUtils;

    public wireBeans(beans: BeanCollection): void {
        this.focusService = beans.focusService;
        this.menuItemMapper = beans.menuItemMapper as MenuItemMapper;
        this.cellPositionUtils = beans.cellPositionUtils;
    }

    private menuList: AgMenuList | null = null;
    private focusedCell: CellPosition | null = null;

    constructor(
        private readonly menuItems: (MenuItemDef | string)[],
        private readonly column: AgColumn | null,
        private readonly node: RowNode | null,
        private readonly value: any
    ) {
        super(/* html */ `<div class="${CSS_MENU}" role="presentation"></div>`);
    }

    public postConstruct(): void {
        const menuList = this.createManagedBean(
            new AgMenuList(0, {
                column: this.column,
                node: this.node,
                value: this.value,
            })
        );
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(
            this.menuItems,
            null,
            () => this.getGui(),
            'contextMenu'
        );

        menuList.addMenuItems(menuItemsMapped);

        this.appendChild(menuList);
        this.menuList = menuList;

        menuList.addEventListener('closeMenu', (e) => this.dispatchLocalEvent(e));
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

        if (
            currentFocusedCell &&
            this.focusedCell &&
            this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)
        ) {
            const { rowIndex, rowPinned, column } = this.focusedCell;

            if (_isNothingFocused(this.gos)) {
                this.focusService.setFocusedCell({
                    rowIndex,
                    column,
                    rowPinned,
                    forceBrowserFocus: true,
                    preventScrollOnBrowserFocus: !this.focusService.isKeyboardMode(),
                });
            }
        }
    }

    public override destroy(): void {
        this.restoreFocusedCell();
        super.destroy();
    }
}
