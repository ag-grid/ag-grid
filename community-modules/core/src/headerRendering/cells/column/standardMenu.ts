import { Autowired, Bean } from '../../../context/context';
import { BeanStub } from "../../../context/beanStub";
import { IMenuFactory } from '../../../interfaces/iMenuFactory';
import { FilterManager } from '../../../filter/filterManager';
import { Column } from '../../../entities/column';
import { PopupService } from '../../../widgets/popupService';
import { FocusService } from '../../../focusService';
import { isVisible } from '../../../utils/dom';
import { KeyCode } from '../../../constants/keyCode';
import { ContainerType } from '../../../interfaces/iAfterGuiAttachedParams';
import { CtrlsService } from '../../../ctrlsService';
import { setAriaRole } from '../../../utils/aria';
import { MenuService } from '../../../misc/menuService';
import { WithoutGridCommon } from '../../../interfaces/iCommon';
import { ColumnMenuVisibleChangedEvent } from '../../../events';
import { Events } from '../../../eventKeys';
import { FilterWrapperComp } from '../../../filter/filterWrapperComp';

@Bean('filterMenuFactory')
export class StandardMenuFactory extends BeanStub implements IMenuFactory {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('menuService') private menuService: MenuService;

    private hidePopup: () => void;
    private tabListener: () => null;
    private activeMenu?: FilterWrapperComp;

    public hideActiveMenu(): void {
        if (this.hidePopup) {
            this.hidePopup();
        }
    }

    public showMenuAfterMouseEvent(column: Column | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType): void {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderMouseEvent({
                column,
                type: containerType,
                mouseEvent,
                ePopup: eMenu
            });
        }, containerType, mouseEvent.target as HTMLElement, this.menuService.isLegacyMenuEnabled());
    }

    public showMenuAfterButtonClick(column: Column | undefined, eventSource: HTMLElement, containerType: ContainerType): void {
        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (!isLegacyMenuEnabled && this.gos.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        let nudgeX = isLegacyMenuEnabled ? undefined : (4 * multiplier);
        let nudgeY = isLegacyMenuEnabled ? undefined : 4;

        this.showPopup(column, eMenu => {
            this.popupService.positionPopupByComponent({
                type: containerType,
                eventSource,
                ePopup: eMenu,
                nudgeX,
                nudgeY,
                alignSide,
                keepWithinBounds: true,
                position: 'under',
                column,
            });
        }, containerType, eventSource, isLegacyMenuEnabled);
    }

    private showPopup(
        column: Column | undefined,
        positionCallback: (eMenu: HTMLElement) => void,
        containerType: ContainerType,
        eventSource: HTMLElement,
        isLegacyMenuEnabled: boolean
    ): void {
        const comp = column ? this.createBean(new FilterWrapperComp(column, 'COLUMN_MENU')) : undefined;
        this.activeMenu = comp;
        if (!comp?.hasFilter() || !column) {
            throw new Error('AG Grid - unable to show popup filter, filter instantiation failed');
        }

        const eMenu = document.createElement('div');

        setAriaRole(eMenu, 'presentation');
        eMenu.classList.add('ag-menu');
        if (!isLegacyMenuEnabled) {
            eMenu.classList.add('ag-filter-menu');
        }

        this.tabListener = this.addManagedListener(eMenu, 'keydown', (e) => this.trapFocusWithin(e, eMenu))!;

        eMenu.appendChild(comp?.getGui()!);

        let hidePopup: (() => void);

        const afterGuiDetached = () => comp?.afterGuiDetached();

        const anchorToElement = this.menuService.isColumnMenuAnchoringEnabled() ? (eventSource ?? this.ctrlsService.getGridBodyCtrl().getGui()) : undefined;
        const closedCallback = (e: MouseEvent | TouchEvent | KeyboardEvent) => {
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;

            if (this.tabListener) {
                this.tabListener = this.tabListener()!;
            }

            if (isKeyboardEvent && eventSource && isVisible(eventSource)) {
                const focusableEl = this.focusService.findTabbableParent(eventSource);

                if (focusableEl) { focusableEl.focus(); }
            }
            afterGuiDetached();
            this.destroyBean(this.activeMenu);
            this.dispatchVisibleChangedEvent(false, containerType, column);
        };

        const translate = this.localeService.getLocaleTextFunc();

        const ariaLabel = isLegacyMenuEnabled && containerType !== 'columnFilter'
            ? translate('ariaLabelColumnMenu', 'Column Menu')
            : translate('ariaLabelColumnFilter', 'Column Filter');

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            closedCallback,
            positionCallback: () => positionCallback(eMenu),
            anchorToElement,
            ariaLabel
        });

        if (addPopupRes) {
            this.hidePopup = hidePopup = addPopupRes.hideFunc;
        }

        comp.afterInit().then(() => {
            // need to make sure the filter is present before positioning, as only
            // after filter it is visible can we find out what the width of it is
            positionCallback(eMenu);

            comp.afterGuiAttached({ container: containerType, hidePopup });
        });

        column.setMenuVisible(true, 'contextMenu');

        this.dispatchVisibleChangedEvent(true, containerType, column);
    }

    private trapFocusWithin(e: KeyboardEvent, menu: HTMLElement) {
        if (e.key !== KeyCode.TAB ||
            e.defaultPrevented ||
            this.focusService.findNextFocusableElement(menu, false, e.shiftKey)) {
            return;
        }

        e.preventDefault();

        this.focusService.focusInto(menu, e.shiftKey);
    }

    private dispatchVisibleChangedEvent(visible: boolean, containerType: ContainerType, column?: Column): void {
        const displayedEvent: WithoutGridCommon<ColumnMenuVisibleChangedEvent> = {
            type: Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab: false,
            key: containerType as 'columnMenu' | 'columnFilter' | 'floatingFilter',
            column: column ?? null
        }
        this.eventService.dispatchEvent(displayedEvent)
    }

    public isMenuEnabled(column: Column): boolean {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed by passing an empty array
        return column.isFilterAllowed() && (column.getColDef().menuTabs ?? ['filterMenuTab']).includes('filterMenuTab');
    }

    public showMenuAfterContextMenuEvent(): void {
        // not supported in standard menu
    }

    protected destroy(): void {
        this.destroyBean(this.activeMenu);
        super.destroy();
    }
}
