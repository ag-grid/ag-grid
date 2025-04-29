import type { GroupResizeFeature } from '../../../columnResize/groupResizeFeature';
import { setupCompBean } from '../../../components/emptyBean';
import { _getHeaderGroupCompDetails } from '../../../components/framework/userCompUtils';
import type { BeanStub } from '../../../context/beanStub';
import type { AgColumn } from '../../../entities/agColumn';
import type { HeaderClassParams } from '../../../entities/colDef';
import type { ColumnEventType } from '../../../events';
import { _addGridCommonParams } from '../../../gridOptionsUtils';
import { ColumnHighlightPosition } from '../../../interfaces/iColumn';
import type { UserCompDetails } from '../../../interfaces/iUserCompDetails';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import type { TooltipFeature } from '../../../tooltip/tooltipFeature';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import type { IAbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellCtrl';
import { AbstractHeaderCellCtrl } from '../abstractCell/abstractHeaderCellCtrl';
import { getColumnClassesFromColDef } from '../cssClassApplier';
import { GroupWidthFeature } from './groupWidthFeature';
import type { IHeaderGroupComp, IHeaderGroupParams } from './headerGroupComp';

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setHeaderWrapperMaxHeight(value: number | null): void;
    setHeaderWrapperHidden(value: boolean): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeaderGroupComp | undefined;
}

export class HeaderGroupPaddingCellCtrl extends AbstractHeaderCellCtrl<
    IHeaderGroupCellComp,
    AgColumn,
    GroupResizeFeature
> {
    private displayName: string | null;
    private tooltipFeature: TooltipFeature | undefined;

    public setComp(
        comp: IHeaderGroupCellComp,
        eGui: HTMLElement,
        eResize: HTMLElement,
        eHeaderCompWrapper: HTMLElement,
        compBean: BeanStub<any> | undefined
    ): void {
        const { column, beans } = this;
        const { context, colNames, colHover, rangeSvc, colResize } = beans;
        this.comp = comp;
        compBean = setupCompBean(this, context, compBean);
        this.setGui(eGui, compBean);

        this.displayName = colNames.getDisplayNameForProvidedColumnGroup(null, null, 'header');

        this.refreshHeaderStyles();
        this.addClasses();
        this.setupMovingCss(compBean);
        this.setupExpandable(compBean);
        this.setupTooltip();

        this.setupAutoHeight({
            wrapperElement: eHeaderCompWrapper,
            compBean,
        });

        this.setupUserComp();
        this.addHeaderMouseListeners(compBean);

        this.addManagedPropertyListener('groupHeaderHeight', this.refreshMaxHeaderHeight.bind(this));
        this.refreshMaxHeaderHeight();

        const pinned = this.rowCtrl.pinned;
        const leafCols = [this.column];

        colHover?.createHoverFeature(compBean, leafCols, eGui);
        rangeSvc?.createRangeHighlightFeature(compBean, column, comp);
        compBean.createManagedBean(new SetLeftFeature(column, eGui, beans));
        compBean.createManagedBean(new GroupWidthFeature(comp, column));
        if (colResize) {
            colResize.createResizeFeature(pinned, this.column, eResize, comp);
        } else {
            comp.setResizableDisplayed(false);
        }

        compBean.createManagedBean(
            new ManagedFocusFeature(eGui, {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: () => undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
            })
        );

        this.addHighlightListeners(compBean, leafCols);

        compBean.addManagedPropertyListener('suppressMovableColumns', this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners(compBean);
        // Make sure this is the last destroy func as it clears the gui and comp
        compBean.addDestroyFunc(() => this.clearComponent());
    }

    protected getHeaderClassParams(): HeaderClassParams {
        const { column, beans } = this;
        const colDef = column.getDefinition()!;

        return _addGridCommonParams(beans.gos, {
            colDef,
            columnGroup: column as any,
            floatingFilter: false,
        });
    }

    private refreshMaxHeaderHeight(): void {
        const { gos, comp } = this;

        const groupHeaderHeight = gos.get('groupHeaderHeight');

        if (groupHeaderHeight != null) {
            if (groupHeaderHeight === 0) {
                comp.setHeaderWrapperHidden(true);
            } else {
                comp.setHeaderWrapperMaxHeight(groupHeaderHeight);
            }
        } else {
            comp.setHeaderWrapperHidden(false);
            comp.setHeaderWrapperMaxHeight(null);
        }
    }

    private addHighlightListeners(compBean: BeanStub, columns: AgColumn[]): void {
        if (!this.beans.gos.get('suppressMoveWhenColumnDragging')) {
            return;
        }

        for (const column of columns) {
            compBean.addManagedListeners(column, {
                headerHighlightChanged: this.onLeafColumnHighlightChanged.bind(this, column),
            });
        }
    }

    private onLeafColumnHighlightChanged(column: AgColumn): void {
        const highlighted = column.getHighlighted();
        const isColumnMoveAtThisLevel = !!this.rowCtrl.getHeaderCellCtrls().find((ctrl) => {
            return ctrl.column.isMoving();
        });

        let beforeOn = false;
        let afterOn = false;

        if (isColumnMoveAtThisLevel) {
            const isRtl = this.beans.gos.get('enableRtl');
            const isHighlightAfter = highlighted === ColumnHighlightPosition.After;
            const isHighlightBefore = highlighted === ColumnHighlightPosition.Before;

            if (isRtl) {
                beforeOn = isHighlightBefore;
            } else {
                afterOn = isHighlightAfter;
            }
        }

        this.comp.toggleCss('ag-header-highlight-before', beforeOn);
        this.comp.toggleCss('ag-header-highlight-after', afterOn);
    }

    protected resizeHeader(delta: number, shiftKey: boolean): void {
        const { resizeFeature } = this;
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!resizeFeature) {
            return;
        }

        const initialValues = resizeFeature.getInitialValues(shiftKey);

        resizeFeature.resizeColumns(initialValues, initialValues.resizeStartWidth + delta, 'uiColumnResized', true);
    }

    public resizeLeafColumnsToFit(source: ColumnEventType): void {
        // check to avoid throwing when a component has not been setup yet (React 18)
        this.resizeFeature?.resizeLeafColumnsToFit(source);
    }

    private setupUserComp(): void {
        const { userCompFactory, gos, enterpriseMenuFactory } = this.beans;
        const columnGroup = null as any;
        const params: IHeaderGroupParams = _addGridCommonParams(gos, {
            displayName: this.displayName!,
            columnGroup,
            setExpanded: (_expanded: boolean) => {},
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                gos.assertModuleRegistered('Tooltip', 3);
                this.setupTooltip(value, shouldDisplayTooltip);
            },
            showColumnMenu: (buttonElement, onClosedCallback) =>
                enterpriseMenuFactory?.showMenuAfterButtonClick(
                    undefined,
                    buttonElement,
                    'columnMenu',
                    onClosedCallback
                ),
            showColumnMenuAfterMouseClick: (mouseEvent, onClosedCallback) =>
                enterpriseMenuFactory?.showMenuAfterMouseEvent(undefined, mouseEvent, 'columnMenu', onClosedCallback),
            eGridHeader: this.eGui,
        });
        const compDetails = _getHeaderGroupCompDetails(userCompFactory, params);
        if (compDetails) {
            this.comp.setUserCompDetails(compDetails);
        }
    }

    private addHeaderMouseListeners(compBean: BeanStub): void {
        const listener = (e: MouseEvent) => this.handleMouseOverChange(e.type === 'mouseenter');
        const clickListener = () => this.dispatchColumnMouseEvent('columnHeaderClicked', this.column); // breaking change, now passes column instead of columnGroup
        const contextMenuListener = (event: MouseEvent) =>
            this.handleContextMenuMouseEvent(event, undefined, this.column);

        compBean.addManagedListeners(this.eGui, {
            mouseenter: listener,
            mouseleave: listener,
            click: clickListener,
            contextmenu: contextMenuListener,
        });
    }

    private handleMouseOverChange(isMouseOver: boolean): void {
        this.eventSvc.dispatchEvent({
            type: isMouseOver ? 'columnHeaderMouseOver' : 'columnHeaderMouseLeave',
            column: this.column, // breaking change, now passes column instead of columnGroup
        });
    }

    private setupTooltip(value?: string, shouldDisplayTooltip?: () => boolean): void {
        this.tooltipFeature = this.beans.tooltipSvc?.setupHeaderGroupTooltip(
            this.tooltipFeature,
            this.eGui,
            undefined,
            value,
            shouldDisplayTooltip
        );
    }

    private setupExpandable(_compBean: BeanStub): void {}

    private addClasses(): void {
        const { column } = this;
        const colGroupDef = this.beans.gos.get('defaultColGroupDef');
        const classes = getColumnClassesFromColDef(
            colGroupDef?.headerClass,
            colGroupDef ?? {},
            this.beans.gos,
            column,
            null
        );

        classes.push('ag-header-group-cell-no-group');
        classes.forEach((c) => this.comp.toggleCss(c, true));
    }

    private setupMovingCss(compBean: BeanStub): void {
        // function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.toggleCss('ag-header-cell-moving', this.column.isMoving());
        compBean.addManagedListeners(this.column, { movingChanged: listener });

        listener();
    }

    private onSuppressColMoveChange = () => {
        if (!this.isAlive() || this.isSuppressMoving()) {
            this.removeDragSource();
        } else {
            if (!this.dragSource) {
                this.setDragSource(this.eGui);
            }
        }
    };

    private onFocusIn(e: FocusEvent) {
        if (!this.eGui.contains(e.relatedTarget as HTMLElement)) {
            this.focusThis();
        }
    }

    protected override handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);
    }

    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    public setDragSource(eHeaderGroup: HTMLElement): void {
        if (!this.isAlive() || this.isSuppressMoving()) {
            return;
        }

        this.removeDragSource();

        if (!eHeaderGroup) {
            return;
        }

        this.dragSource =
            this.beans.colMoves?.setDragSourceForHeader(eHeaderGroup, this.column, this.displayName) ?? null;
    }

    private isSuppressMoving(): boolean {
        return !!this.column.getColDef().suppressMovable || !!this.column.getColDef().lockPosition;
    }

    public override destroy(): void {
        this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        super.destroy();
    }
}
