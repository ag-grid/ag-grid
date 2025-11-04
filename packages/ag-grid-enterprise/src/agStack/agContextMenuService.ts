import type {
    _AfterGuiAttachedParams,
    _AgCoreBeanCollection,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
    _WithoutCommon,
} from 'ag-grid-community';
import {
    _AgBeanStub,
    _AgComponentStub,
    _anchorElementToMouseMoveEvent,
    _createAgElement,
    _focusInto,
    _getPageBody,
    _getRootNode,
    _isPromise,
    _isVisible,
} from 'ag-grid-community';

import type { AgCloseMenuEvent, AgMenuItemCallbacks, AgMenuItemDef } from './agMenuItemComponent';
import { AgMenuList } from './agMenuList';

const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_LOADING_ICON = 'ag-context-menu-loading-icon';

export interface AgContextMenuServiceParams<
    TBeanCollection,
    TCommon,
    TMenuActionParams extends TCommon,
    TDefaultMenuItem extends string,
> {
    menuItemCallbacks: AgMenuItemCallbacks<TBeanCollection, TMenuActionParams, TCommon>;
    getMenuItems(
        menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>,
        mouseEvent: MouseEvent | Touch
    ):
        | (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[]
        | Promise<(TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[]>
        | undefined;
    mapMenuItems?(
        menuItems: (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[],
        menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>,
        getGui: () => HTMLElement
    ): (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[];
    shouldBlockMenuOpen?(): boolean;
    beforeMenuOpen?(menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>): void;
    onMenuOpen?(): void;
    onMenuClose?(): void;
    afterMenuDestroyed?(): void;
    onVisibleChanged?(visible: boolean, source: 'api' | 'ui'): void;
}

export class AgContextMenuService<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TMenuActionParams extends TCommon,
    TDefaultMenuItem extends string,
> extends _AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private destroyLoadingSpinner: (() => void) | null = null;
    private lastPromise: number = 0;

    private activeMenu: ContextMenu<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TMenuActionParams,
        TDefaultMenuItem
    > | null;

    constructor(
        private readonly params: AgContextMenuServiceParams<
            TBeanCollection,
            TCommon,
            TMenuActionParams,
            TDefaultMenuItem
        >
    ) {
        super();
    }

    public hideActiveMenu(): void {
        this.destroyBean(this.activeMenu);
    }

    public showMenu(
        menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>,
        mouseEvent: MouseEvent | Touch,
        anchorToElement?: HTMLElement
    ): boolean {
        const { getMenuItems, shouldBlockMenuOpen: shouldBlockMenu } = this.params;
        const menuItems = getMenuItems(menuActionParams, mouseEvent);

        if (_isPromise<(TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[]>(menuItems)) {
            const currentPromise = this.lastPromise + 1;
            this.lastPromise = currentPromise;
            if (!this.destroyLoadingSpinner) {
                this.createLoadingIcon(mouseEvent);
            }

            menuItems.then((menuItems) => {
                if (this.lastPromise !== currentPromise) {
                    return;
                }

                const { target } = mouseEvent;

                // if there is no event target, it means the event was created by `api.showContextMenu`.
                const isFromFakeEvent = !target;

                const shouldShowMenu =
                    // check if there are actual menu items to be displayed
                    menuItems?.length &&
                    // check if the element that triggered the context menu was removed from the DOM
                    (isFromFakeEvent || _isVisible(target as HTMLElement)) &&
                    !shouldBlockMenu?.();

                if (shouldShowMenu) {
                    this.createContextMenu({ menuItems, menuActionParams, mouseEvent, anchorToElement });
                }

                this.destroyLoadingSpinner?.();
            });
            return true;
        }

        if (!menuItems?.length) {
            return false;
        }

        this.createContextMenu({ menuItems, menuActionParams, mouseEvent, anchorToElement });

        return true;
    }

    private createLoadingIcon(mouseEvent: MouseEvent | Touch) {
        const { beans } = this;
        const translate = this.getLocaleTextFunc();
        const loadingIcon = beans.iconSvc.createIconNoSpan('loadingMenuItems') as HTMLElement;
        const wrapperEl = _createAgElement({ tag: 'div', cls: CSS_CONTEXT_MENU_LOADING_ICON });
        wrapperEl.appendChild(loadingIcon);

        const rootNode = _getRootNode(beans);
        const targetEl = _getPageBody(beans);

        if (!targetEl) {
            return;
        }

        targetEl.appendChild(wrapperEl);
        beans.ariaAnnounce?.announceValue(
            translate('ariaLabelLoadingContextMenu', 'Loading Context Menu'),
            'contextmenu'
        );
        beans.environment.applyThemeClasses(wrapperEl);
        _anchorElementToMouseMoveEvent(wrapperEl, mouseEvent, beans);

        const mouseMoveCallback = (e: MouseEvent) => {
            _anchorElementToMouseMoveEvent(wrapperEl, e, beans);
        };

        rootNode.addEventListener('mousemove', mouseMoveCallback);

        this.destroyLoadingSpinner = () => {
            rootNode.removeEventListener('mousemove', mouseMoveCallback);
            wrapperEl.remove();
            this.destroyLoadingSpinner = null;
        };
    }

    private createContextMenu(params: {
        menuItems: (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[];
        menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>;
        mouseEvent: MouseEvent | Touch;
        anchorToElement?: HTMLElement;
    }): void {
        const {
            mapMenuItems,
            menuItemCallbacks,
            beforeMenuOpen,
            onMenuClose,
            afterMenuDestroyed,
            onVisibleChanged,
            onMenuOpen,
        } = this.params;
        const { menuItems, menuActionParams, mouseEvent, anchorToElement } = params;
        const popupSvc = this.beans.popupSvc;

        const getMenuItems = mapMenuItems
            ? (getGui: () => HTMLElement) => mapMenuItems(menuItems, menuActionParams, getGui)
            : () => menuItems;

        const menu = new ContextMenu<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            TMenuActionParams,
            TDefaultMenuItem
        >(getMenuItems, menuActionParams, menuItemCallbacks);
        this.createBean(menu);

        const eMenuGui = menu.getGui();

        beforeMenuOpen?.(menuActionParams);

        const positionParams = {
            additionalParams: menuItemCallbacks.getPostProcessPopupParams(menuActionParams),
            type: 'contextMenu',
            mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1,
        };

        const translate = this.getLocaleTextFunc();

        const addPopupRes = popupSvc?.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e) => {
                menuItemCallbacks.preserveRangesWhile(this.beans, () => {
                    onMenuClose?.();
                    this.destroyBean(menu);
                    afterMenuDestroyed?.();
                    onVisibleChanged?.(false, e === undefined ? 'api' : 'ui');
                });
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gos.get('enableRtl');
                popupSvc?.positionPopupUnderMouseEvent({
                    ...positionParams,
                    nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1,
                });
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu'),
        });

        if (addPopupRes) {
            onMenuOpen?.();
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
            menu.addEventListener('closeMenu', (e: AgCloseMenuEvent) =>
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
        onVisibleChanged?.(true, isApi ? 'api' : 'ui');
    }

    public override destroy(): void {
        this.destroyLoadingSpinner?.();
        super.destroy();
    }
}

type ContextMenuEvent = 'closeMenu';

class ContextMenu<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TMenuActionParams extends TCommon,
    TDefaultMenuItem extends string,
> extends _AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    ContextMenuEvent
> {
    private menuList: AgMenuList<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TMenuActionParams
    > | null = null;

    constructor(
        private readonly getMenuItems: (
            getGui: () => HTMLElement
        ) => (AgMenuItemDef<TMenuActionParams, TCommon> | TDefaultMenuItem)[],
        private readonly menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>,
        private readonly callbacks: AgMenuItemCallbacks<TBeanCollection, TMenuActionParams, TCommon>
    ) {
        super({ tag: 'div', cls: CSS_MENU, role: 'presentation' });
    }

    public postConstruct(): void {
        const menuList = this.createManagedBean(
            new AgMenuList<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType,
                TMenuActionParams
            >(0, this.menuActionParams, this.callbacks)
        );
        const menuItemsMapped = this.getMenuItems(() => this.getGui());

        menuList.addMenuItems(menuItemsMapped);

        this.appendChild(menuList);
        this.menuList = menuList;

        menuList.addEventListener('closeMenu', (e) => this.dispatchLocalEvent(e));
    }

    public afterGuiAttached({ hidePopup }: _AfterGuiAttachedParams<string>): void {
        if (hidePopup) {
            this.addDestroyFunc(hidePopup);
        }

        const menuList = this.menuList;
        if (menuList) {
            this.callbacks.preserveRangesWhile(this.beans, () => _focusInto(menuList.getGui()));
        }
    }
}
