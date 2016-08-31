import {Bean, PreDestroy, Autowired, PostConstruct} from "../context/context";
import {LoggerFactory, Logger} from "../logger";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events} from "../events";

/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
@Bean('dragService')
export class DragService {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('eventService') private eventService: EventService;

    private currentDragParams: DragListenerParams;
    private dragging: boolean;
    private eventLastTime: MouseEvent;
    private dragStartEvent: MouseEvent;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private logger: Logger;

    private destroyFunctions: (()=>void)[] = [];

    private eBody: HTMLElement;

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('DragService');
        this.eBody = <HTMLElement> document.querySelector('body');
    }

    @PreDestroy
    private destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    private setNoSelectToBody(noSelect: boolean): void {
        if (_.exists(this.eBody)) {
            _.addOrRemoveCssClass(this.eBody, 'ag-body-no-select', noSelect);
        }
    }

    public addDragSource(params: DragListenerParams): void {
        var listener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', listener);
        this.destroyFunctions.push( ()=>  params.eElement.removeEventListener('mousedown', listener));
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        // only interested in left button clicks
        if (mouseEvent.button!==0) { return; }

        this.currentDragParams = params;
        this.dragging = false;

        this.eventLastTime = mouseEvent;
        this.dragStartEvent = mouseEvent;

        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);

        // see if we want to start dragging straight away
        if (params.dragStartPixels===0) {
            this.onMouseMove(mouseEvent);
        }
    }

    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    private isEventNearStartEvent(event: MouseEvent): boolean {
        // by default, we wait 4 pixels before starting the drag
        var requiredPixelDiff = _.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
        if (requiredPixelDiff===0) {
            return false;
        }
        var diffX = Math.abs(event.clientX - this.dragStartEvent.clientX);
        var diffY = Math.abs(event.clientY - this.dragStartEvent.clientY);
        return Math.max(diffX, diffY) <= requiredPixelDiff;
    }

    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    private onMouseMove(mouseEvent: MouseEvent): void {

        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            var toEarlyToDrag = !this.dragging && this.isEventNearStartEvent(mouseEvent);
            if (toEarlyToDrag) {
                return;
            } else {
                this.dragging = true;
                this.eventService.dispatchEvent(Events.EVENT_DRAG_STARTED);
                this.currentDragParams.onDragStart(this.dragStartEvent);
                this.setNoSelectToBody(true);
            }
        }

        this.currentDragParams.onDragging(mouseEvent);
    }

    public onMouseUp(mouseEvent: MouseEvent): void {

        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);

        this.setNoSelectToBody(false);
        this.dragStartEvent = null;
        this.eventLastTime = null;

        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(mouseEvent);
            this.eventService.dispatchEvent(Events.EVENT_DRAG_STOPPED);
        }
    }
}

export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number,
    /** Dom element to add the drag handling to */
    eElement: HTMLElement,
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent)=>void,
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent)=>void,
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent)=>void
}