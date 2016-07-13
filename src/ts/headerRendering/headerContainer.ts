import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired, Context, PostConstruct} from "../context/context";
import {DragAndDropService, DropTarget} from "../dragAndDrop/dragAndDropService";
import {ColumnController} from "../columnController/columnController";
import {GridPanel} from "../gridPanel/gridPanel";
import {EventService} from "../eventService";
import {Events} from "../events";
import {HeaderRowComp} from "./headerRowComp";
import {BodyDropTarget} from "./bodyDropTarget";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";

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
    
    public forEachHeaderElement(callback: (renderedHeaderElement: IRenderedHeaderElement)=>void): void {
        this.headerRowComps.forEach( headerRowComp => headerRowComp.forEachHeaderElement(callback) );
    }
    
    @PostConstruct
    private init(): void {
        this.setupDragAndDrop();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.onGridColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    }

    public destroy(): void {
        this.removeHeaderRowComps();
    }

    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    private onGridColumnsChanged() {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    }

    // we expose this for gridOptions.api.refreshHeader() to call
    public refresh(): void {
        this.onGridColumnsChanged();
    }
    
    private setupDragAndDrop(): void {
        var dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        var bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.context.wireBean(bodyDropTarget );
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