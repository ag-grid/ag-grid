import {Utils as _} from '../utils';
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired, PreDestroy} from "../context/context";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {Column} from "../entities/column";
import {Context} from "../context/context";
import {RenderedHeaderGroupCell} from "./renderedHeaderGroupCell";
import {RenderedHeaderCell} from "./renderedHeaderCell";
import {DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {MoveColumnController} from "./moveColumnController";
import {ColumnController} from "../columnController/columnController";
import {DropTarget} from "../dragAndDrop/dragAndDropService";
import {GridPanel} from "../gridPanel/gridPanel";
import {PostConstruct} from "../context/context";
import {EventService} from "../eventService";
import {Events} from "../events";
import {HeaderRowComp} from "./headerRowComp";

export class HeaderContainer {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('$scope') private $scope: any;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('eventService') private eventService: EventService;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;
    private eRoot: HTMLElement;

    private headerRowComps: HeaderRowComp[] = [];
    
    private pinned: string;

    private dropTarget: DropTarget;

    constructor(eContainer: HTMLElement, eViewport: HTMLElement, eRoot: HTMLElement, pinned: string) {
        this.eContainer = eContainer;
        this.eRoot = eRoot;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }

    public setWidth(width: number): void {
        this.eContainer.style.width = width + 'px';
    }
    
    @PostConstruct
    private init(): void {
        this.setupDragAndDrop();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        // this.eventService.addEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.refresh.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.refresh.bind(this));
        this.eventService.addEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, this.refresh.bind(this));
    }

    public destroy(): void {
        this.removeHeaderRowComps();
    }

    // private onGridColumnsChanged(): void {
    //     this.removeHeaderRowComps();
    //     this.createHeaderRowComps();
    // }
    
    public refresh() {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    }

    private setupDragAndDrop(): void {
        var moveColumnController = new MoveColumnController(this.pinned);
        this.context.wireBean(moveColumnController);

        var secondaryContainers: HTMLElement[];
        switch (this.pinned) {
            case Column.PINNED_LEFT: secondaryContainers = this.gridPanel.getDropTargetLeftContainers(); break;
            case Column.PINNED_RIGHT: secondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers(); break;
            default: secondaryContainers = this.gridPanel.getDropTargetBodyContainers(); break;
        }

        var icon = this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;

        this.dropTarget = {
            eContainer: this.eViewport ? this.eViewport : this.eContainer,
            iconName: icon,
            eSecondaryContainers: secondaryContainers,
            onDragging: moveColumnController.onDragging.bind(moveColumnController),
            onDragEnter: moveColumnController.onDragEnter.bind(moveColumnController),
            onDragLeave: moveColumnController.onDragLeave.bind(moveColumnController),
            onDragStop: moveColumnController.onDragStop.bind(moveColumnController)
        };
        this.dragAndDropService.addDropTarget(this.dropTarget);
    }

    private removeHeaderRowComps(): void {
        this.headerRowComps.forEach( headerRowComp => {
            headerRowComp.destroy();
        });
        this.headerRowComps.length = 0;
        _.removeAllChildren(this.eContainer);
    }

    private createHeaderRowComps(): void {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowCount = this.columnController.getHeaderRowCount();
        
        for (var dept = 0; dept<rowCount; dept++) {
            var groupRow = dept !== (rowCount - 1);
            var headerRowComp = new HeaderRowComp(dept, groupRow, this.pinned, this.eRoot, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    }

}