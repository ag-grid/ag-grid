import {Bean} from "../../context/context";
import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import _ from '../../utils';
import EventService from "../../eventService";
import {Events} from "../../events";
import Column from "../../entities/column";
import {Context} from "../../context/context";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import {DragSource} from "../../dragAndDrop/dragAndDropService2";
import {RenderedColumn} from "./renderedColumn";
import {OriginalColumnGroupChild} from "../../entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import {RenderedGroup} from "./renderedGroup";

export class ColumnSelectPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private static TEMPLATE = '<div class="ag-column-select-panel"></div>';

    private eGui: HTMLElement;

    private renderedColumnsAndGroups: {[key: string]: any} = {};

    private columnTree: OriginalColumnGroupChild[];

    public agPostWire(): void {
        console.log('ColumnSelectPanel is alive!!');
        this.eGui = _.loadTemplate(ColumnSelectPanel.TEMPLATE);
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
    }

    public onColumnsChanged(): void {
        _.removeAllChildren(this.eGui);
        _.iterateObject(this.renderedColumnsAndGroups, (key, value) => value.destroy() );
        this.renderedColumnsAndGroups = {};

        this.columnTree = this.columnController.getOriginalColumnTree();
        this.recursivelyRenderOriginalColumn(this.columnTree, 0);
    }

    private recursivelyRenderOriginalColumn(tree: OriginalColumnGroupChild[], dept: number): void {
        tree.forEach( child => {
            if (child instanceof OriginalColumnGroup) {
                var columnGroup = <OriginalColumnGroup> child;

                // only render group if user provided the definition
                var newDept: number;
                if (columnGroup.getColGroupDef()) {
                    var renderedGroup = new RenderedGroup(columnGroup, dept, this.onGroupExpanded.bind(this));
                    this.context.wireBean(renderedGroup);
                    this.renderedColumnsAndGroups[columnGroup.getGroupId()] = renderedGroup;
                    this.eGui.appendChild(renderedGroup.getGui());
                    // we want to indent on the gui for the children
                    newDept = dept + 1;
                } else {
                    // no children, so no indent
                    newDept = dept;
                }

                this.recursivelyRenderOriginalColumn(columnGroup.getChildren(), newDept);
            } else {
                var column = <Column> child;
                var renderedColumn = new RenderedColumn(column, dept);
                this.context.wireBean(renderedColumn);
                this.renderedColumnsAndGroups[column.getColId()] = renderedColumn;
                this.eGui.appendChild(renderedColumn.getGui());
            }
        });
    }

    public recursivelySetVisibility(tree: OriginalColumnGroupChild[], visible: boolean): void {
        tree.forEach( child => {

            var component = this.renderedColumnsAndGroups[child.getId()];

            if (child instanceof OriginalColumnGroup) {

                var originalColumnGroup = <OriginalColumnGroup> child;
                var newVisible: boolean;

                if (component) {
                    var renderedGroup = <RenderedGroup> component;
                    _.setVisible(renderedGroup.getGui(), visible, 'block');

                    newVisible = visible ? renderedGroup.isExpanded() : false;
                } else {
                    newVisible = visible;
                }

                this.recursivelySetVisibility(originalColumnGroup.getChildren(), newVisible);

            } else {
                var renderedGroup = <RenderedGroup> component;
                _.setVisible(renderedGroup.getGui(), visible, 'block');
            }

        });
    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.columnTree, true);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}
