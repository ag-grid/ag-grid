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
import { RefSelector } from "../../../widgets/componentAnnotations";
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
import { HeaderGroupCellCtrl, IHeaderGroupCellComp } from "./headerGroupCellCtrl";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerGroupComp";

export class HeaderGroupCellComp extends AbstractHeaderCellComp<HeaderGroupCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-group-cell" role="columnheader" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('beans') protected beans: Beans;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    @RefSelector('eResize') private eResize: HTMLElement;

    protected readonly columnGroup: ColumnGroup;
    protected readonly pinned: string | null;

    constructor(ctrl: HeaderGroupCellCtrl) {
        super(HeaderGroupCellComp.TEMPLATE, ctrl);
        this.columnGroup = ctrl.getColumnGroupChild() as ColumnGroup;
        this.pinned = ctrl.getPinned();
    }

    @PostConstruct
    private postConstruct(): void {

        this.appendHeaderGroupComp();

        const eGui = this.getGui();

        const setAttribute = (key: string, value: string | undefined) => 
                value!=undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);

        const compProxy: IHeaderGroupCellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveResizableCssClass: (cssClassName, on) => addOrRemoveCssClass(this.eResize, cssClassName, on),
            setWidth: width => eGui.style.width = width,
            setColId: id => eGui.setAttribute("col-id", id),
            setAriaExpanded: expanded => setAttribute('aria-expanded', expanded),
            setTitle: title => setAttribute("title", title)
        };

        this.ctrl.setComp(compProxy, eGui, this.eResize);
    }

    public getComponentHolder(): ColGroupDef | null {
        return this.columnGroup.getColGroupDef();
    }

    private appendHeaderGroupComp(): void {
        let displayName = this.columnModel.getDisplayNameForColumnGroup(this.columnGroup, 'header');

        const params: IHeaderGroupParams = {
            displayName: displayName!,
            columnGroup: this.columnGroup,
            setExpanded: (expanded: boolean) => {
                this.columnModel.setColumnGroupOpened(this.columnGroup.getOriginalColumnGroup(), expanded, "gridInitializing");
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

        const callback = this.afterHeaderCompCreated.bind(this, displayName);

        this.userComponentFactory.newHeaderGroupComponent(params)!.then(callback);
    }

    private afterHeaderCompCreated(displayName: string, headerGroupComp: IHeaderGroupComp): void {
        this.getGui().appendChild(headerGroupComp.getGui());
        this.addDestroyFunc(() => {
            this.getContext().destroyBean(headerGroupComp);
        });

        this.ctrl.setDragSource(headerGroupComp.getGui());
    }


}
