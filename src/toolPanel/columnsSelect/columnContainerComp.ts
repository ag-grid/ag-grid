import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    Context,
    Events,
    EventService,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    Utils,
    GridOptionsWrapper
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";
import {BaseColumnItem} from "./columnSelectComp";
import {SELECTED_STATE} from "./columnSelectHeaderComp";

export type ColumnItem = BaseColumnItem & Component;

export class ColumnContainerComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;
    @Autowired('context') private context: Context;

    private props: {
        allowDragging: boolean;
    };

    private columnTree: OriginalColumnGroupChild[];
    private columnComps: { [key: string]: ColumnItem };

    private filterText: string;

    private expandGroupsByDefault: boolean;

    public static TEMPLATE = `<div class="ag-column-container"></div>`;

    constructor(){
        super(ColumnContainerComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        this.expandGroupsByDefault = !this.gridOptionsWrapper.isContractColumnSelection();
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyColumnComps();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        let groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.updateVisibilityOfRows();
    }

    private destroyColumnComps(): void {
        Utils.removeAllChildren(this.getGui());
        if (this.columnComps) {
            Utils.iterateObject(this.columnComps, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.columnComps = {};
    }

    private recursivelyAddGroupComps(columnGroup: OriginalColumnGroup, dept: number, groupsExist: boolean): void {
        // only render group if user provided the definition
        let newDept: number;

        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) {
            return;
        }

        if (!columnGroup.isPadding()) {
            let renderedGroup = new ToolPanelGroupComp(columnGroup,  dept, this.onGroupExpanded.bind(this),
                this.props.allowDragging, this.expandGroupsByDefault);
            this.context.wireBean(renderedGroup);
            this.getGui().appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            this.columnComps[columnGroup.getId()] = renderedGroup;
        } else {
            // no children, so no indent
            newDept = dept;
        }

        this.recursivelyAddComps(columnGroup.getChildren(), newDept, groupsExist);

    }

    public onGroupExpanded(): void {
        this.updateVisibilityOfRows();
        this.fireExpandedEvent();
    }

    private fireExpandedEvent(): void {
        let expandedCount = 0;
        let notExpandedCount = 0;

        let recursiveFunc = (items: OriginalColumnGroupChild[]) => {
            items.forEach( item => {

                // only interested in groups
                if (item instanceof OriginalColumnGroup) {
                    let comp = <ToolPanelGroupComp> this.columnComps[item.getId()];

                    if (comp) {
                        if (comp.isExpanded()) {
                            expandedCount++;
                        } else {
                            notExpandedCount++;
                        }
                    }

                    let columnGroup = <OriginalColumnGroup> item;
                    let groupChildren = columnGroup.getChildren();

                    recursiveFunc(groupChildren);
                }
            });
        };

        recursiveFunc(this.columnTree);

        let state: SELECTED_STATE;
        if (expandedCount>0 && notExpandedCount>0) {
            state = SELECTED_STATE.INDETERMINIATE;
        } else if (notExpandedCount>0) {
            state = SELECTED_STATE.UNCHECKED;
        } else {
            state = SELECTED_STATE.CHECKED;
        }

        this.dispatchEvent({type: 'groupExpanded', state: state});
    }

    private recursivelyAddColumnComps(column: Column, dept: number, groupsExist: boolean): void {
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }

        let renderedColumn = new ToolPanelColumnComp(column, dept, this.props.allowDragging, groupsExist);
        this.context.wireBean(renderedColumn);
        this.getGui().appendChild(renderedColumn.getGui());

        this.columnComps[column.getId()] = renderedColumn;
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], dept: number, groupsExist: boolean): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyAddGroupComps(<OriginalColumnGroup> child, dept, groupsExist);
            } else {
                this.recursivelyAddColumnComps(<Column> child, dept, groupsExist);
            }
        });
    }

    public destroy(): void {
        super.destroy();
        this.destroyColumnComps();
    }

    public doSetExpandedAll(value: boolean): void {
        _.iterateObject(this.columnComps, (key, renderedItem) => {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpanded(value);
            }
        });
    }

    public setFilterText(filterText:string) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.updateVisibilityOfRows();
    }

    private updateVisibilityOfRows(): void {
        // we have to create the filter results first as that requires dept first search, then setting
        // the visibility requires breadth first search. this is because a group passes filter if CHILDREN
        // pass filter, a column passes group open/closed visibility if a PARENT is open. so we need to do
        // two recursions. we pass the result of the first recursion to the second.
        let filterResults: {[id: string]: boolean} = _.exists(this.filterText) ? this.createFilterResults() : null;
        this.recursivelySetVisibility(this.columnTree, true, filterResults);
    }

    private createFilterResults(): {[id: string]: boolean} {
        let filterResults: {[id: string]: boolean} = {};

        // we recurse dept first - as the item should show if any of the children are showing

        let recursivelyCheckFilter = (items: OriginalColumnGroupChild[]): boolean => {

            let atLeastOneThisLevelPassed = false;

            items.forEach( item => {

                let atLeastOneChildPassed = false;

                if (item instanceof OriginalColumnGroup) {
                    let columnGroup = <OriginalColumnGroup> item;
                    let groupChildren = columnGroup.getChildren();
                    atLeastOneChildPassed = recursivelyCheckFilter(groupChildren);
                }

                let filterPasses: boolean;
                if (atLeastOneChildPassed) {
                    filterPasses = true;
                } else {
                    let comp = this.columnComps[item.getId()];
                    if (comp) {
                        filterPasses = comp.getDisplayName().toLowerCase().indexOf(this.filterText) >= 0;
                    } else {
                        filterPasses = true;
                    }
                }

                filterResults[item.getId()] = filterPasses;

                if (filterPasses) {
                    atLeastOneThisLevelPassed = true;
                }
            });

            return atLeastOneThisLevelPassed;
        };

        recursivelyCheckFilter(this.columnTree);

        return filterResults;
    }

    private recursivelySetVisibility(columnTree: any[], parentGroupsOpen: boolean, filterResults: {[id: string]: boolean}): void {
        columnTree.forEach(child => {

            let comp: ColumnItem = this.columnComps[child.getId()];
            if (comp) {
                let passesFilter = filterResults ? filterResults[child.getId()] : true;
                comp.setVisible(parentGroupsOpen && passesFilter);
            }

            if (child instanceof OriginalColumnGroup) {
                let columnGroup = <OriginalColumnGroup> child;

                let childrenOpen: boolean;
                if (comp) {
                    let expanded = (<ToolPanelGroupComp>comp).isExpanded();
                    childrenOpen = parentGroupsOpen ? expanded : false;
                } else {
                    childrenOpen = parentGroupsOpen;
                }

                let children = columnGroup.getChildren();
                this.recursivelySetVisibility(children, childrenOpen, filterResults);
            }
        });
    }

    public doSetSelectedAll(checked: boolean): void {
        _.iterateObject(this.columnComps, (key, column)=>{
            column.onSelectAllChanged(checked);
        });
    }
}
