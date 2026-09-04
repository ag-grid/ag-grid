import { _isEventFromThisInstance, _isEventSupported, _isIOSUserAgent } from 'ag-stack';

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

const _shouldOpenHeaderMenuOnLongPress = (
    enableMenu: boolean,
    isHeaderContextMenuEnabled: boolean,
    isLegacyMenuEnabled: boolean
): boolean => isHeaderContextMenuEnabled || (enableMenu && isLegacyMenuEnabled);

export class TouchService extends BeanStub implements NamedBean {
    beanName = 'touchSvc' as const;

    /** `isTargetHandled` mirrors the listener's own target guard, so the long press is only claimed where the listener acts. */
    public setupBodyContextMenu(
        ctrl: GridBodyCtrl,
        listener: (pointerEvent: MouseEvent) => void,
        isTargetHandled: (event: PointerEvent) => boolean
    ): void {
        this.setupLongPressContextMenu(ctrl, ctrl.eGridViewport, listener, isTargetHandled);
    }

    public setupHeaderContextMenu(
        ctrl: GridHeaderCtrl,
        listener: (pointerEvent: MouseEvent) => void,
        isTargetHandled: (event: PointerEvent) => boolean
    ): void {
        this.setupLongPressContextMenu(ctrl, ctrl.eGui, listener, isTargetHandled);
    }

    public setupRowContextMenu(ctrl: RowContainerEventsFeature): void {
        const listener = (pointerEvent: MouseEvent) => {
            const { rowCtrl, cellCtrl } = ctrl.getControlsForEventTarget(pointerEvent.target);
            if (cellCtrl?.column) {
                cellCtrl.dispatchCellContextMenuEvent(pointerEvent);
            }
            this.beans.contextMenuSvc?.handleContextMenuMouseEvent(pointerEvent, rowCtrl, cellCtrl);
        };
        this.setupLongPressContextMenu(ctrl, ctrl.element, listener, (event) => {
            const { rowCtrl, cellCtrl } = ctrl.getControlsForEventTarget(event.target);
            return !!(rowCtrl || cellCtrl);
        });
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
        const { gos, menuSvc, touchGesturesSvc } = this.beans;

        const { params } = comp;
        const isHeaderContextMenuEnabled = !!menuSvc?.isHeaderContextMenuEnabled(params.column as AgColumn);
        const shouldOpenMenuOnLongPress = _shouldOpenHeaderMenuOnLongPress(
            params.enableMenu,
            isHeaderContextMenuEnabled,
            _isLegacyMenuEnabled(gos)
        );

        if (shouldOpenMenuOnLongPress) {
            const unregister = touchGesturesSvc?.registerLongPress({
                element: comp.getGui(),
                onLongPress: (event) => params.showColumnMenuAfterMouseClick(event),
            });
            if (unregister) {
                comp.addDestroyFunc(unregister);
            }
        }
    }

    public setupForHeaderGroup(comp: AgColumnGroupHeader): void {
        const params = comp.params;
        if (
            this.beans.menuSvc?.isHeaderContextMenuEnabled(
                params.columnGroup.getProvidedColumnGroup() as AgProvidedColumnGroup
            )
        ) {
            const unregister = this.beans.touchGesturesSvc?.registerLongPress({
                element: params.eGridHeader,
                onLongPress: (event) => params.showColumnMenuAfterMouseClick(event),
            });
            if (unregister) {
                comp.addDestroyFunc(unregister);
            }
        }
    }

    private setupLongPressContextMenu(
        ctrl: BeanStub,
        element: HTMLElement,
        listener: (pointerEvent: MouseEvent) => void,
        isTargetHandled: (event: PointerEvent) => boolean
    ): void {
        const unregister = this.beans.touchGesturesSvc?.registerLongPress({
            element,
            isEnabled: (event) =>
                !!this.beans.contextMenuSvc &&
                !this.gos.get('suppressContextMenu') &&
                _isEventFromThisInstance(this.beans, event) &&
                isTargetHandled(event),
            onLongPress: listener,
        });
        if (unregister) {
            ctrl.addDestroyFunc(unregister);
        }
    }
}
