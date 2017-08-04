import {EventService} from "../eventService";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {Events, CellEvent, ColumnHoverChangedEvent} from "../events";
import {Column} from "../entities/column";
import {BeanStub} from "../context/beanStub";

@Bean('columnHoverService')
export class ColumnHoverService extends BeanStub {

    @Autowired('eventService') private eventService: EventService;

    private currentlySelectedColumn: Column;

    @PostConstruct
    private init():void{
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_MOUSE_OVER, this.onCellMouseOver.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_MOUSE_OUT, this.onCellMouseOut.bind(this));
    }

    private onCellMouseOver(cellEvent:CellEvent): void {
        this.currentlySelectedColumn = cellEvent.column;
        let event: ColumnHoverChangedEvent = {type: Events.EVENT_COLUMN_HOVER_CHANGED};
        this.eventService.dispatchEvent(event.type, event);
    }

    private onCellMouseOut(): void {
        this.currentlySelectedColumn = null;
        let event: ColumnHoverChangedEvent = {type: Events.EVENT_COLUMN_HOVER_CHANGED};
        this.eventService.dispatchEvent(event.type, event);
    }

    public isHovered(column:Column): boolean{
        return column == this.currentlySelectedColumn;
    }
}