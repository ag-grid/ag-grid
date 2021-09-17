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
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {

    private columnGroup: ColumnGroup;
    private comp: IHeaderGroupCellComp;

    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.columnGroup = columnGroup;
    }

    public setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void {
        super.setAbstractComp(comp, eGui);
        this.comp = comp;

        this.addClasses();
        this.addAttributes();

        const pinned = this.getParentRowCtrl().getPinned();
        this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.columnGroup));
        this.createManagedBean(new GroupWidthFeature(comp, this.columnGroup));
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


}
