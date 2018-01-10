import {Bean, PreDestroy, Autowired, PostConstruct, Optional} from "../context/context";
import {LoggerFactory, Logger} from "../logger";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {DragStartedEvent, DragStoppedEvent, Events} from "../events";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";

/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
@Bean('dragService')
export class DragService {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private currentDragParams: DragListenerParams;
    private dragging: boolean;
    private mouseEventLastTime: MouseEvent;
    private mouseStartEvent: MouseEvent;
    private touchLastTime: Touch;
    private touchStart: Touch;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private onTouchEndListener = this.onTouchUp.bind(this);
    private onTouchMoveListener = this.onTouchMove.bind(this);

    private logger: Logger;

    private dragEndFunctions: Function[] = [];

    private dragSources: DragSourceAndListener[] = [];

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('DragService');
    }

    @PreDestroy
    private destroy(): void {
        this.dragSources.forEach( this.removeListener.bind(this) );
        this.dragSources.length = 0;
    }

    private removeListener(dragSourceAndListener: DragSourceAndListener): void {
        let element = dragSourceAndListener.dragSource.eElement;
        let mouseDownListener = dragSourceAndListener.mouseDownListener;
        element.removeEventListener('mousedown', mouseDownListener);

        // remove touch listener only if it exists
        if (dragSourceAndListener.touchEnabled) {
            let touchStartListener = dragSourceAndListener.touchStartListener;
            element.removeEventListener('touchstart', touchStartListener, <any>{passive:true});
        }
    }

    public removeDragSource(params: DragListenerParams): void {
        let dragSourceAndListener = _.find( this.dragSources, item => item.dragSource === params);

        if (!dragSourceAndListener) { return; }

        this.removeListener(dragSourceAndListener);
        _.removeFromArray(this.dragSources, dragSourceAndListener);
    }

    private setNoSelectToBody(noSelect: boolean): void {
        let usrDocument = this.gridOptionsWrapper.getDocument();
        let eBody = <HTMLElement> usrDocument.querySelector('body');
        if (_.exists(eBody)) {
            _.addOrRemoveCssClass(eBody, 'ag-body-no-select', noSelect);
        }
    }

    public addDragSource(params: DragListenerParams, includeTouch: boolean = false): void {

        let mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);

        let touchListener: (touchEvent: TouchEvent)=>void = null;

        let suppressTouch = this.gridOptionsWrapper.isSuppressTouch();

        let reallyIncludeTouch = includeTouch && !suppressTouch;

        if (reallyIncludeTouch) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener, <any>{passive:false});
        }

        this.dragSources.push({
            dragSource: params,
            mouseDownListener: mouseListener,
            touchStartListener: touchListener,
            touchEnabled: includeTouch
        });
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {

        this.currentDragParams = params;
        this.dragging = false;

        let touch = touchEvent.touches[0];

        this.touchLastTime = touch;
        this.touchStart = touch;

        touchEvent.preventDefault();

        // we temporally add these listeners, for the duration of the drag, they
        // are removed in touch end handling.
        params.eElement.addEventListener('touchmove', this.onTouchMoveListener, <any>{passive:true});
        params.eElement.addEventListener('touchend', this.onTouchEndListener, <any>{passive:true});
        params.eElement.addEventListener('touchcancel', this.onTouchEndListener, <any>{passive:true});

        this.dragEndFunctions.push( ()=> {
            params.eElement.removeEventListener('touchmove', this.onTouchMoveListener, <any>{passive:true});
            params.eElement.removeEventListener('touchend', this.onTouchEndListener, <any>{passive:true});
            params.eElement.removeEventListener('touchcancel', this.onTouchEndListener, <any>{passive:true});
        });

        // see if we want to start dragging straight away
        if (params.dragStartPixels===0) {
            this.onCommonMove(touch, this.touchStart);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {

        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if ((<any>mouseEvent)._alreadyProcessedByDragService) { return; }
        (<any>mouseEvent)._alreadyProcessedByDragService = true;

        // only interested in left button clicks
        if (mouseEvent.button!==0) { return; }

        this.currentDragParams = params;
        this.dragging = false;

        this.mouseEventLastTime = mouseEvent;
        this.mouseStartEvent = mouseEvent;

        let usrDocument = this.gridOptionsWrapper.getDocument();

        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.

        usrDocument.addEventListener('mousemove', this.onMouseMoveListener);
        usrDocument.addEventListener('mouseup', this.onMouseUpListener);

        this.dragEndFunctions.push( ()=> {
            usrDocument.removeEventListener('mousemove', this.onMouseMoveListener);
            usrDocument.removeEventListener('mouseup', this.onMouseUpListener);
        });

        // see if we want to start dragging straight away
        if (params.dragStartPixels===0) {
            this.onMouseMove(mouseEvent);
        }
    }

    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    private isEventNearStartEvent(currentEvent: MouseEvent|Touch, startEvent: MouseEvent|Touch): boolean {
        // by default, we wait 4 pixels before starting the drag
        let requiredPixelDiff = _.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
        return _.areEventsNear(currentEvent, startEvent, requiredPixelDiff);
    }

    private getFirstActiveTouch(touchList: TouchList): Touch {
        for (let i = 0; i<touchList.length; i++) {
            let matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }

        return null;
    }

    private onCommonMove(currentEvent: MouseEvent|Touch, startEvent: MouseEvent|Touch): void {

        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            let toEarlyToDrag = !this.dragging && this.isEventNearStartEvent(currentEvent, startEvent);
            if (toEarlyToDrag) {
                return;
            } else {
                // alert(`started`);
                this.dragging = true;
                let event: DragStartedEvent = {
                    type: Events.EVENT_DRAG_STARTED,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
                this.currentDragParams.onDragStart(startEvent);
                this.setNoSelectToBody(true);
            }
        }

        this.currentDragParams.onDragging(currentEvent);
    }

    private onTouchMove(touchEvent: TouchEvent): void {

        let touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) { return; }

        // this.___statusBar.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');

        // if we don't preview default, then the browser will try and do it's own touch stuff,
        // like do 'back button' (chrome does this) or scroll the page (eg drag column could  be confused
        // with scroll page in the app)
        // touchEvent.preventDefault();

        this.onCommonMove(touch, this.touchStart);
    }

    // only gets called after a mouse down - as this is only added after mouseDown
    // and is removed when mouseUp happens
    private onMouseMove(mouseEvent: MouseEvent): void {
        this.onCommonMove(mouseEvent, this.mouseStartEvent);
    }

    public onTouchUp(touchEvent: TouchEvent): void {
        let touch = this.getFirstActiveTouch(touchEvent.targetTouches);

        // i haven't worked this out yet, but there is no matching touch
        // when we get the touch up event. to get around this, we swap in
        // the last touch. this is a hack to 'get it working' while we
        // figure out what's going on, why we are not getting a touch in
        // current event.
        if (!touch) {
            touch = this.touchLastTime;
        }

        // if mouse was left up before we started to move, then this is a tap.
        // we check this before onUpCommon as onUpCommon resets the dragging
        // let tap = !this.dragging;
        // let tapTarget = this.currentDragParams.eElement;

        this.onUpCommon(touch);

        // if tap, tell user
        // console.log(`${Math.random()} tap = ${tap}`);
        // if (tap) {
        //     tapTarget.click();
        // }
    }

    public onMouseUp(mouseEvent: MouseEvent): void {
        this.onUpCommon(mouseEvent);
    }

    public onUpCommon(eventOrTouch: MouseEvent|Touch): void {

        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(eventOrTouch);
            let event: DragStoppedEvent = {
                type: Events.EVENT_DRAG_STOPPED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }

        this.setNoSelectToBody(false);

        this.mouseStartEvent = null;
        this.mouseEventLastTime = null;
        this.touchStart = null;
        this.touchLastTime = null;
        this.currentDragParams = null;

        this.dragEndFunctions.forEach( func => func() );
        this.dragEndFunctions.length = 0;
    }
}

interface DragSourceAndListener {
    dragSource: DragListenerParams;
    mouseDownListener: (mouseEvent: MouseEvent)=>void;
    touchEnabled: boolean;
    touchStartListener: (touchEvent: TouchEvent)=>void;
}

export interface DragListenerParams {
    /** Used in the dragStarted and dragStopped events */
    type: string;
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: HTMLElement;
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent|Touch) => void;
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent|Touch) => void;
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent|Touch) => void;
}