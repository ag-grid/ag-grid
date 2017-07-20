import {EventService} from "../eventService";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {Events, CellEvent} from "../events";
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
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_HOVER_CHANGED);
    }

    private onCellMouseOut(): void {
        this.currentlySelectedColumn = null;
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_HOVER_CHANGED);
    }

    public isHovered(column:Column): boolean{
        return column == this.currentlySelectedColumn;
    }
}