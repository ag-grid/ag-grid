import { Direction } from '../agStack/constants/direction';
import type { BasePopupPositionParams } from '../agStack/interfaces/iPopup';
import { BasePopupService } from '../agStack/popup/basePopupService';
import type { NamedBean } from '../context/bean';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgEventTypeParams, CssVariablesChanged } from '../events';
import type { GridCtrl } from '../gridComp/gridCtrl';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { PostProcessPopupParams } from '../interfaces/iCallbackParams';
import type { AgGridCommon, WithoutGridCommon } from '../interfaces/iCommon';
import type { PopupPositionParams } from '../interfaces/iPopupPositionParams';
import type { IRowNode } from '../interfaces/iRowNode';
import { _isStopPropagationForAgGrid } from '../utils/gridEvent';

export class PopupService
    extends BasePopupService<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        PopupPositionParams
    >
    implements NamedBean
{
    private gridCtrl: GridCtrl;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridCtrl = p.gridCtrl;
        });
        this.addManagedEventListeners({ gridStylesChanged: this.handleThemeChange.bind(this) });
    }

    protected getDefaultPopupParent(): HTMLElement {
        return this.gridCtrl.getGui();
    }

    public positionPopupForMenu(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column: AgColumn | null;
        rowNode: IRowNode | null;
        event?: MouseEvent | KeyboardEvent;
    }): void {
        const { eventSource, ePopup, event } = params;

        const sourceRect = eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect();

        this.setAlignedTo(eventSource, ePopup);

        let minWidthSet = false;

        const updatePosition = () => {
            const y = this.keepXYWithinBounds(ePopup, sourceRect.top - parentRect.top, Direction.Vertical);

            const minWidth = ePopup.clientWidth > 0 ? ePopup.clientWidth : 200;
            if (!minWidthSet) {
                ePopup.style.minWidth = `${minWidth}px`;
                minWidthSet = true;
            }
            const widthOfParent = parentRect.right - parentRect.left;
            const maxX = widthOfParent - minWidth;

            // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
            // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
            // we try place it first to the left, and then if not to the right.
            let x: number;
            if (this.gos.get('enableRtl')) {
                // for RTL, try left first
                x = xLeftPosition();
                if (x < 0) {
                    x = xRightPosition();
                    this.setAlignedStyles(ePopup, 'left');
                }
                if (x > maxX) {
                    x = 0;
                    this.setAlignedStyles(ePopup, 'right');
                }
            } else {
                // for LTR, try right first
                x = xRightPosition();
                if (x > maxX) {
                    x = xLeftPosition();
                    this.setAlignedStyles(ePopup, 'right');
                }
                if (x < 0) {
                    x = 0;
                    this.setAlignedStyles(ePopup, 'left');
                }
            }
            return { x, y };

            function xRightPosition(): number {
                return sourceRect.right - parentRect.left - 2;
            }

            function xLeftPosition(): number {
                return sourceRect.left - parentRect.left - minWidth;
            }
        };

        this.positionPopup({
            ePopup,
            keepWithinBounds: true,
            updatePosition,
            postProcessCallback: () =>
                this.callPostProcessPopup(
                    params,
                    'subMenu',
                    ePopup,
                    eventSource,
                    event instanceof MouseEvent ? event : undefined
                ),
        });
    }

    public callPostProcessPopup(
        params: Omit<PopupPositionParams, keyof BasePopupPositionParams>,
        type: string,
        ePopup: HTMLElement,
        eventSource?: HTMLElement | null,
        mouseEvent?: MouseEvent | Touch | null
    ): void {
        const callback = this.gos.getCallback('postProcessPopup');
        if (callback) {
            const { column, rowNode } = params;
            const postProcessParams: WithoutGridCommon<PostProcessPopupParams> = {
                column,
                rowNode,
                ePopup,
                type,
                eventSource,
                mouseEvent,
            };
            callback(postProcessParams);
        }
    }

    public getActivePopups(): HTMLElement[] {
        return this.popupList.map((popup) => popup.element);
    }

    private handleThemeChange(e: CssVariablesChanged) {
        if (e.themeChanged) {
            const environment = this.beans.environment;
            for (const popup of this.popupList) {
                environment.applyThemeClasses(popup.wrapper);
            }
        }
    }

    public hasAnchoredPopup(): boolean {
        return this.popupList.some((popup) => popup.isAnchored);
    }

    protected override isStopPropagation(event: Event): boolean {
        return _isStopPropagationForAgGrid(event);
    }
}
