import { ColumnApi } from "../../../columns/columnApi";
import { ColumnModel } from "../../../columns/columnModel";
import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired } from "../../../context/context";
import {
    DragAndDropService,
    DragItem,
    DragSource,
    DragSourceType
} from "../../../dragAndDrop/dragAndDropService";
import { Column } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { GridApi } from "../../../gridApi";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { removeFromArray } from "../../../utils/array";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { ITooltipFeatureComp, ITooltipFeatureCtrl, TooltipFeature } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { GroupResizeFeature } from "./groupResizeFeature";
import { GroupWidthFeature } from "./groupWidthFeature";
import { IHeaderGroupParams } from "./headerGroupComp";

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp, ITooltipFeatureComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveResizableCssClass(cssClassName: string, on: boolean): void;
    setWidth(width: string): void;
    setColId(id: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('dragAndDropService') private readonly dragAndDropService: DragAndDropService;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;

    private expandable: boolean;
    private displayName: string | null;
    private groupResizeFeature: GroupResizeFeature;

    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.columnGroup = columnGroup;
    }

    public setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void {
        super.setGui(eGui);
        this.comp = comp;

        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        this.addClasses();
        this.addAttributes();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();

        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.columnGroup.getProvidedColumnGroup().getLeafColumns();

        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.columnGroup, eGui, this.beans));
        this.createManagedBean(new GroupWidthFeature(comp, this.columnGroup));
        this.groupResizeFeature = this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.columnGroup));

        this.createManagedBean(new ManagedFocusFeature(
            eGui,
            {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: () => undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this)
            }
        ));
    }

    public resizeLeafColumnsToFit(): void {
        this.groupResizeFeature.onResizeStart(false);
        this.groupResizeFeature.resizeLeafColumnsToFit();
    }

    private setupUserComp(): void {

        let displayName = this.displayName;

        const params: IHeaderGroupParams = {
            displayName: this.displayName!,
            columnGroup: this.columnGroup,
            setExpanded: (expanded: boolean) => {
                this.columnModel.setColumnGroupOpened(this.columnGroup.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };

        if (!displayName) {
            let columnGroup = this.columnGroup;
            const leafCols = columnGroup.getLeafColumns();

            // find the top most column group that represents the same columns. so if we are dragging a group, we also
            // want to visually show the parent groups dragging for the same column set. for example imaging 5 levels
            // of grouping, with each group only containing the next group, and the last group containing three columns,
            // then when you move any group (even the lowest level group) you are in-fact moving all the groups, as all
            // the groups represent the same column set.
            while (columnGroup.getParent() && columnGroup.getParent().getLeafColumns().length === leafCols.length) {
                columnGroup = columnGroup.getParent();
            }

            const colGroupDef = columnGroup.getColGroupDef();

            if (colGroupDef) {
                displayName = colGroupDef.headerName!;
            }

            if (!displayName) {
                displayName = leafCols ? this.columnModel.getDisplayNameForColumn(leafCols[0], 'header', true)! : '';
            }
        }

        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params)!;

        this.comp.setUserCompDetails(compDetails);
    }

    private setupTooltip(): void {

        const colGroupDef = this.columnGroup.getColGroupDef();

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.columnGroup,
            getGui: () => this.eGui,
            getLocation: () => 'headerGroup',
            getTooltipValue: () => colGroupDef && colGroupDef.headerTooltip
        };

        if (colGroupDef) {
            tooltipCtrl.getColDef = () => colGroupDef;
        }

        const tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));

        tooltipFeature.setComp(this.comp);
    }

    private setupExpandable(): void {
        const providedColGroup = this.columnGroup.getProvidedColumnGroup();

        this.refreshExpanded();

        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    }

    private refreshExpanded(): void {
        const column = this.columnGroup as ColumnGroup;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();

        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        } else {
            this.comp.setAriaExpanded(undefined);
        }
    }

    private addAttributes(): void {
        this.comp.setColId(this.columnGroup.getUniqueId());
    }

    private addClasses(): void {
        const colGroupDef = this.columnGroup.getColGroupDef();
        const classes = CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsWrapper, null, this.columnGroup);

        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        classes.push(this.columnGroup.isPadding() ? `ag-header-group-cell-no-group` : `ag-header-group-cell-with-group`);

        classes.forEach(c => this.comp.addOrRemoveCssClass(c, true));
    }

    private setupMovingCss(): void {
        const providedColumnGroup = this.columnGroup.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();

        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.columnGroup.isMoving());

        leafColumns.forEach(col => {
            this.addManagedListener(col, Column.EVENT_MOVING_CHANGED, listener);
        });

        listener();
    }

    private onFocusIn(e: FocusEvent) {
        if (!this.eGui.contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.columnGroup);
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        const wrapperHasFocus = this.getWrapperHasFocus();

        if (!this.expandable || !wrapperHasFocus) { return; }

        if (e.key === KeyCode.ENTER) {
            const column = this.columnGroup;
            const newExpandedValue = !column.isExpanded();

            this.columnModel.setColumnGroupOpened(column.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    }

    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    public setDragSource(eHeaderGroup: HTMLElement): void {

        if (this.isSuppressMoving()) { return; }

        const allLeafColumns = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        const dragSource: DragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            defaultIconName: DragAndDropService.ICON_HIDE,
            dragItemName: this.displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: () => allLeafColumns.forEach(col => col.setMoving(true, "uiColumnDragged")),
            onDragStopped: () => allLeafColumns.forEach(col => col.setMoving(false, "uiColumnDragged"))
        };

        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    public getDragItemForGroup(): DragItem {
        const allColumnsOriginalOrder = this.columnGroup.getProvidedColumnGroup().getLeafColumns();

        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState: { [key: string]: boolean; } = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());

        const allColumnsCurrentOrder: Column[] = [];
        this.columnModel.getAllDisplayedColumns().forEach(column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                removeFromArray(allColumnsOriginalOrder, column);
            }
        });

        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(column => allColumnsCurrentOrder.push(column));

        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            visibleState: visibleState
        };
    }

    private isSuppressMoving(): boolean {
        // if any child is fixed, then don't allow moving
        let childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach((column: Column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });

        const result = childSuppressesMoving || this.gridOptionsWrapper.isSuppressMovableColumns();

        return result;
    }
}
