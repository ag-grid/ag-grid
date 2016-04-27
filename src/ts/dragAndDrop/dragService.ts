import {Bean, PreDestroy} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {PostConstruct} from "../context/context";
import {Utils as _} from '../utils';

@Bean('dragService')
export class DragService {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;

    private currentDragParams: DragListenerParams;
    private dragging: boolean;
    private eventLastTime: MouseEvent;
    private dragStartEvent: MouseEvent;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private logger: Logger;

    private destroyFunctions: (()=>void)[] = [];

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('DragService');
    }

    @PreDestroy
    private destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public addDragSource(params: DragListenerParams): void {
        var listener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', listener);
        this.destroyFunctions.push( ()=>  params.eElement.removeEventListener('mousedown', listener));
    }

    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        // only interested in left button clicks
        if (mouseEvent.button!==0) { return; }

        this.currentDragParams = params;
        this.dragging = false;

        this.eventLastTime = mouseEvent;
        this.dragStartEvent = mouseEvent;

        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);

        // see if we want to start dragging straight away
        if (params.dragStartPixels===0) {
            this.onMouseMove(mouseEvent);
        }
    }

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

    private onMouseMove(mouseEvent: MouseEvent): void {

        if (!this.dragging) {
            // we want to have moved at least 4px before the drag starts
            if (this.isEventNearStartEvent(mouseEvent)) {
                return;
            } else {
                this.dragging = true;
                this.currentDragParams.onDragStart(this.dragStartEvent);
            }
        }

        this.currentDragParams.onDragging(mouseEvent);
    }

    public onMouseUp(mouseEvent: MouseEvent): void {
        this.logger.log('onMouseUp');

        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);

        if (this.dragging) {
            this.currentDragParams.onDragStop(mouseEvent);
        }

        this.dragStartEvent = null;
        this.eventLastTime = null;
        this.dragging = false;
    }
}

export interface DragListenerParams {
    dragStartPixels?: number,
    eElement: HTMLElement,
    onDragStart: (mouseEvent: MouseEvent)=>void,
    onDragStop: (mouseEvent: MouseEvent)=>void,
    onDragging: (mouseEvent: MouseEvent)=>void
}