import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { ColumnApi } from "../../../columns/columnApi";
import { ColumnModel, ColumnResizeSet } from "../../../columns/columnModel";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { Constants } from "../../../constants/constants";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, PostConstruct } from "../../../context/context";
import {
    DragAndDropService,
    DragItem,
    DragSource,
    DragSourceType
} from "../../../dragAndDrop/dragAndDropService";
import { ColGroupDef } from "../../../entities/colDef";
import { Column } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { GridApi } from "../../../gridApi";
import { Beans } from "../../../rendering/beans";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { ITooltipParams } from "../../../rendering/tooltipComponent";
import { setAriaExpanded } from "../../../utils/aria";
import { removeFromArray } from "../../../utils/array";
import { addCssClass, addOrRemoveCssClass, removeCssClass, removeFromParent } from "../../../utils/dom";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { HorizontalResizeService } from "../../common/horizontalResizeService";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { GroupResizeFeature } from "./groupResizeFeature";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerGroupComp";
import { GroupWidthFeature } from "./groupWidthFeature";
export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveResizableCssClass(cssClassName: string, on: boolean): void;
    setWidth(width: string): void;
    setColId(id: string): void;
    setAriaExpanded(expanded: string | undefined): void;
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('beans') protected beans: Beans;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;

    private expandable: boolean;

    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.columnGroup = columnGroup;
    }

    public setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void {
        super.setAbstractComp(comp, eGui);
        this.comp = comp;

        this.addClasses();
        this.addAttributes();
        this.setupMovingCss();
        this.setupExpandable();

        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.columnGroup.getOriginalColumnGroup().getLeafColumns();

        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.columnGroup, eGui, this.beans));
        this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.columnGroup));
        this.createManagedBean(new GroupWidthFeature(comp, this.columnGroup));

        this.createManagedBean(new ManagedFocusFeature(
            eGui,
            {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: ()=> undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this)
            }
        ));
    }

    private setupExpandable(): void {
        const providedColGroup = this.columnGroup.getOriginalColumnGroup();

        this.refreshExpanded();

        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    }

    private refreshExpanded(): void {
        const column = this.columnGroup as ColumnGroup;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();

        if (this.expandable) {
            this.comp.setAriaExpanded(`${!!expanded}`);
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

        classes.forEach( c => this.comp.addOrRemoveCssClass(c, true) );
    }

    private setupMovingCss(): void {
        const providedColumnGroup = this.columnGroup.getOriginalColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();

        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = ()=> this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.columnGroup.isMoving());

        leafColumns.forEach(col => {
            this.addManagedListener(col, Column.EVENT_MOVING_CHANGED, listener);
        });

        listener();
    }
    
    protected onFocusIn(e: FocusEvent) {
        if (!this.eGui.contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.columnGroup);
        }
    }

    protected handleKeyDown(e: KeyboardEvent) {
        const activeEl = document.activeElement;
        const wrapperHasFocus = activeEl === this.eGui;

        if (!this.expandable || !wrapperHasFocus) { return; }

        if (e.keyCode === KeyCode.ENTER) {
            const column = this.columnGroup;
            const newExpandedValue = !column.isExpanded();

            this.columnModel.setColumnGroupOpened(column.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    }
}
