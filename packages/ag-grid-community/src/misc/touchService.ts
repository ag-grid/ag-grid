import { _exists, _isEventFromThisInstance, _isEventSupported, _isIOSUserAgent } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import type { RowContainerEventsFeature } from '../gridBodyComp/rowContainer/rowContainerEventsFeature';
import { _isLegacyMenuEnabled } from '../gridOptionsUtils';
import type { AgColumnHeader } from '../headerRendering/cells/column/agColumnHeader';
import type { AgColumnGroupHeader } from '../headerRendering/cells/columnGroup/agColumnGroupHeader';
import type { GridHeaderCtrl } from '../headerRendering/gridHeaderCtrl';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import { _onCellDoubleClicked } from '../rendering/cell/cellMouseListenerFeature';
import type { LongTapEvent, TapEvent } from '../widgets/touchListener';
import { TouchListener } from '../widgets/touchListener';

const _shouldOpenHeaderMenuOnLongTap = (
    enableMenu: boolean,
    isHeaderContextMenuEnabled: boolean,
    isLegacyMenuEnabled: boolean
): boolean => isHeaderContextMenuEnabled || (enableMenu && isLegacyMenuEnabled);

export class TouchService extends BeanStub implements NamedBean {
    beanName = 'touchSvc' as const;

    public mockBodyContextMenu(
        ctrl: GridBodyCtrl,
        listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void
    ): void {
        this.mockContextMenu(ctrl, ctrl.eGridViewport, listener);
    }

    public mockHeaderContextMenu(
        ctrl: GridHeaderCtrl,
        listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void
    ): void {
        this.mockContextMenu(ctrl, ctrl.eGui, listener);
    }

    public mockRowContextMenu(ctrl: RowContainerEventsFeature): void {
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!_isIOSUserAgent()) {
            return;
        }

        const listener = (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => {
            const { rowCtrl, cellCtrl } = ctrl.getControlsForEventTarget(touchEvent?.target ?? null);
            if (cellCtrl?.column) {
                cellCtrl.dispatchCellContextMenuEvent(touchEvent ?? null);
            }
            this.beans.contextMenuSvc?.handleContextMenuMouseEvent(undefined, touchEvent, rowCtrl, cellCtrl);
        };
        this.mockContextMenu(ctrl, ctrl.element, listener);
    }

    public handleCellDoubleClick(ctrl: CellCtrl, mouseEvent: MouseEvent): boolean {
        const isDoubleClickOnIPad = () => {
            if (!_isIOSUserAgent() || _isEventSupported('dblclick')) {
                return false;
            }

            const nowMillis = Date.now();
            const res = nowMillis - ctrl.lastIPadMouseClickEvent < 200;
            ctrl.lastIPadMouseClickEvent = nowMillis;

            return res;
        };
        if (isDoubleClickOnIPad()) {
            _onCellDoubleClicked(this.beans, ctrl, mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in

            return true;
        }
        return false;
    }

    public setupForHeader(comp: AgColumnHeader): void {
        const { gos, sortSvc, menuSvc } = this.beans;

        if (gos.get('suppressTouch')) {
            return;
        }
        const { params, eMenu, eFilterButton } = comp;

        const touchListener = new TouchListener(comp.getGui(), true);
        comp.addDestroyFunc(() => touchListener.destroy());

        const suppressMenuHide = comp.shouldSuppressMenuHide();
        const tapMenuButton = suppressMenuHide && _exists(eMenu) && params.enableMenu;
        const isHeaderContextMenuEnabled = !!menuSvc?.isHeaderContextMenuEnabled(params.column as AgColumn);
        const shouldOpenMenuOnLongTap = _shouldOpenHeaderMenuOnLongTap(
            params.enableMenu,
            isHeaderContextMenuEnabled,
            _isLegacyMenuEnabled(gos)
        );

        let menuTouchListener = touchListener;
        if (tapMenuButton) {
            menuTouchListener = new TouchListener(eMenu, true);
            comp.addDestroyFunc(() => menuTouchListener.destroy());
        }

        const showMenuFn = (event: TapEvent | LongTapEvent) => params.showColumnMenuAfterMouseClick(event.touchStart);

        if (tapMenuButton && params.enableMenu) {
            comp.addManagedListeners(menuTouchListener, { tap: showMenuFn });
        }

        if (shouldOpenMenuOnLongTap) {
            comp.addManagedListeners(touchListener, { longTap: showMenuFn });
        }

        if (params.enableSorting) {
            const tapListener = (event: TapEvent) => {
                const target = event.touchStart.target as HTMLElement;
                // When suppressMenuHide is true, a tap on the menu icon or filter button will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && (eMenu?.contains(target) || eFilterButton?.contains(target))) {
                    return;
                }

                sortSvc?.progressSort(params.column as AgColumn, false, 'uiColumnSorted');
            };

            comp.addManagedListeners(touchListener, { tap: tapListener });
        }

        if (params.enableFilterButton && eFilterButton) {
            const filterButtonTouchListener = new TouchListener(eFilterButton, true);
            comp.addManagedListeners(filterButtonTouchListener, {
                tap: () => params.showFilter(eFilterButton),
            });
            comp.addDestroyFunc(() => filterButtonTouchListener.destroy());
        }
    }

    public setupForHeaderGroup(comp: AgColumnGroupHeader): void {
        const params = comp.params;
        if (
            this.beans.menuSvc?.isHeaderContextMenuEnabled(
                params.columnGroup.getProvidedColumnGroup() as AgProvidedColumnGroup
            )
        ) {
            const touchListener = new TouchListener(params.eGridHeader, true);
            const showMenuFn = (event: LongTapEvent) => params.showColumnMenuAfterMouseClick(event.touchStart);
            comp.addManagedListeners(touchListener, { longTap: showMenuFn });
            comp.addDestroyFunc(() => touchListener.destroy());
        }
    }

    public setupForHeaderGroupElement(
        comp: AgColumnGroupHeader,
        eElement: HTMLElement,
        action: (event: MouseEvent) => void
    ): void {
        const touchListener = new TouchListener(eElement, true);

        comp.addManagedListeners(touchListener, { tap: action });
        comp.addDestroyFunc(() => touchListener.destroy());
    }

    private mockContextMenu(
        ctrl: BeanStub,
        element: HTMLElement,
        listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void
    ): void {
        // we do NOT want this when not in iPad
        if (!_isIOSUserAgent()) {
            return;
        }

        const touchListener = new TouchListener(element);
        const longTapListener = (event: LongTapEvent) => {
            if (!_isEventFromThisInstance(this.beans, event.touchEvent)) {
                return;
            }
            listener(undefined, event.touchStart, event.touchEvent);
        };

        ctrl.addManagedListeners(touchListener, { longTap: longTapListener });
        ctrl.addDestroyFunc(() => touchListener.destroy());
    }
}
