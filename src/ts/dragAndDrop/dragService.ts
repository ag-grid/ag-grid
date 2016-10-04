import {Bean, PreDestroy, Autowired, PostConstruct, Optional} from "../context/context";
import {LoggerFactory, Logger} from "../logger";
import {Utils as _} from "../utils";
import {EventService} from "../eventService";
import {Events} from "../events";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Component} from "../widgets/component";

/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
@Bean('dragService')
export class DragService {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('eGridDiv') private _TempGridDiv: HTMLElement;
    @Optional('statusBar') private statusBar: any;

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

    private destroyFunctions: (()=>void)[] = [];

    private eBody: HTMLElement;

    private dragSources: DragSourceAndListener[] = [];

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('DragService');
        this.eBody = <HTMLElement> document.querySelector('body');
    }

    private playWithTouch(): void {
        var firstTouch: Touch;

        // see if we can add the drag to the body, and listen on that instead

        this._TempGridDiv.addEventListener('touchstart', (e: TouchEvent)=> {
            // e.preventDefault();
            console.log('touchstart', e);
            firstTouch = e.touches[0];
            // this.statusBar.setInfoText(Math.random() + ' touchStart length=' + e.touches.length + ' ' + firstTouch.identifier + ' ' + firstTouch.clientY);
        });

        this._TempGridDiv.addEventListener('touchmove', (e: TouchEvent)=> {
            console.log('touchmove', e);
            // e.preventDefault();
            var touch: Touch;
            for (var i = 0; i<e.touches.length; i++) {
                if (e.touches[i].identifier === firstTouch.identifier) {
                    touch = e.touches[i];
                }
            }
            if (touch) {
                // this.statusBar.setInfoText(Math.random() + ' touchmove ' + '(' + touch.clientX + ',' + touch.clientY + ')');
            }
        });

        this._TempGridDiv.addEventListener('touchend', (e: TouchEvent)=> {
            console.log('touchend', e);
            // this.statusBar.setInfoText(Math.random() + ' touchend');
        });

        this._TempGridDiv.addEventListener('touchcancel', (e: TouchEvent)=> {
            console.log('touchcancel', e);
            // this.statusBar.setInfoText(Math.random() + ' touchcancel');
        });
    }

    @PreDestroy
    private destroy(): void {
        this.destroyFunctions.forEach( func => func() );

        this.dragSources.forEach( this.removeListener.bind(this) );

        this.dragSources.length = 0;
    }

    private removeListener(dragSourceAndListener: DragSourceAndListener): void {
        var element = dragSourceAndListener.dragSource.eElement;
        var mouseDownListener = dragSourceAndListener.mouseDownListener;
        element.removeEventListener('mousedown', mouseDownListener);
    }

    public removeDragSource(params: DragListenerParams): void {
        let dragSourceAndListener = _.find( this.dragSources, item => item.dragSource === params);

        if (!dragSourceAndListener) { return; }

        this.removeListener(dragSourceAndListener);
        _.removeFromArray(this.dragSources, dragSourceAndListener);
    }

    private setNoSelectToBody(noSelect: boolean): void {
        if (_.exists(this.eBody)) {
            _.addOrRemoveCssClass(this.eBody, 'ag-body-no-select', noSelect);
        }
    }

    public addDragSource(params: DragListenerParams, includeTouch: boolean = false): void {

        var mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);
        this.destroyFunctions.push( ()=>  params.eElement.removeEventListener('mousedown', mouseListener));

        let touchListener: (touchEvent: TouchEvent)=>void = null;

        if (includeTouch && this.gridOptionsWrapper.isEnableTouch()) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener);
            this.destroyFunctions.push( ()=>  params.eElement.removeEventListener('touchstart', touchListener));
        }

        this.dragSources.push({
            dragSource: params,
            mouseDownListener: mouseListener
        });

        console.log(`count is ${this.dragSources.length}`);
    }

    // gets called whenever mouse down on any drag source
    private onTouchStart(params: DragListenerParams, touchEvent: TouchEvent): void {

        touchEvent.preventDefault();

        this.currentDragParams = params;
        this.dragging = false;

        let touch: Touch = touchEvent.targetTouches[0];
        this.touchLastTime = touch;
        this.touchStart = touch;

        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        document.addEventListener('touchmove', this.onTouchMoveListener);
        document.addEventListener('touchend', this.onTouchEndListener);
        document.addEventListener('touchcancel', this.onTouchEndListener);

        // see if we want to start dragging straight away
        if (params.dragStartPixels===0) {
            this.onTouchMove(touchEvent);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        // only interested in left button clicks
        if (mouseEvent.button!==0) { return; }

        this.currentDragParams = params;
        this.dragging = false;

        this.mouseEventLastTime = mouseEvent;
        this.mouseStartEvent = mouseEvent;

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
    private isEventNearStartEvent(currentEvent: MouseEvent|Touch, startEvent: MouseEvent|Touch): boolean {
        // by default, we wait 4 pixels before starting the drag
        var requiredPixelDiff = _.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
        if (requiredPixelDiff===0) {
            return false;
        }
        var diffX = Math.abs(currentEvent.clientX - startEvent.clientX);
        var diffY = Math.abs(currentEvent.clientY - startEvent.clientY);

        return Math.max(diffX, diffY) <= requiredPixelDiff;
    }

    private getFirstActiveTouch(touchList: TouchList): Touch {
        for (var i = 0; i<touchList.length; i++) {
            var matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }

        return null;
    }

    private onCommonMove(currentEvent: MouseEvent|Touch, startEvent: MouseEvent|Touch): void {

        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            var toEarlyToDrag = !this.dragging && this.isEventNearStartEvent(currentEvent, startEvent);
            if (toEarlyToDrag) {
                return;
            } else {
                // alert(`started`);
                this.dragging = true;
                this.eventService.dispatchEvent(Events.EVENT_DRAG_STARTED);
                this.currentDragParams.onDragStart(startEvent);
                this.setNoSelectToBody(true);
            }
        }

        this.currentDragParams.onDragging(currentEvent);
    }

    private onTouchMove(touchEvent: TouchEvent): void {

        let touch = this.getFirstActiveTouch(touchEvent.changedTouches);
        if (!touch) { return; }

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

        document.removeEventListener('touchmove', this.onTouchMoveListener);
        document.removeEventListener('touchend', this.onTouchEndListener);
        document.removeEventListener('touchcancel', this.onTouchEndListener);

        this.onUpCommon(touch);
    }

    public onMouseUp(mouseEvent: MouseEvent): void {

        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);

        this.onUpCommon(mouseEvent);
    }

    public onUpCommon(mouseEvent: MouseEvent|Touch): void {
        this.setNoSelectToBody(false);
        this.mouseStartEvent = null;
        this.mouseEventLastTime = null;

        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(mouseEvent);
            this.eventService.dispatchEvent(Events.EVENT_DRAG_STOPPED);
        }
    }
}

interface DragSourceAndListener {
    dragSource: DragListenerParams;
    mouseDownListener: (mouseEvent: MouseEvent)=>void;
    // touchStartListener: (touchEvent: TouchEvent)=>void;
}

export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number,
    /** Dom element to add the drag handling to */
    eElement: HTMLElement,
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent|Touch)=>void,
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent|Touch)=>void,
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent|Touch)=>void
}