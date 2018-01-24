import {EventService} from "../eventService";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {Events, CellEvent, ColumnHoverChangedEvent} from "../events";
import {Column} from "../entities/column";
import {BeanStub} from "../context/beanStub";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";

@Bean('columnHoverService')
export class ColumnHoverService extends BeanStub {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private currentlySelectedColumn: Column;

    @PostConstruct
    private init():void{
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_MOUSE_OVER, this.onCellMouseOver.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_MOUSE_OUT, this.onCellMouseOut.bind(this));
    }

    private onCellMouseOver(cellEvent:CellEvent): void {
        this.currentlySelectedColumn = cellEvent.column;
        let event: ColumnHoverChangedEvent = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    private onCellMouseOut(): void {
        this.currentlySelectedColumn = null;
        let event: ColumnHoverChangedEvent = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    public isHovered(column:Column): boolean{
        return column == this.currentlySelectedColumn;
    }
}