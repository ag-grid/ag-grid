import { Bean, PreDestroy, Autowired, PostConstruct } from "../context/context";
import { LoggerFactory, Logger } from "../logger";
import { EventService } from "../eventService";
import { DragStartedEvent, DragStoppedEvent, Events } from "../events";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { _ } from "../utils";

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
        this.dragSources.forEach(this.removeListener.bind(this));
        this.dragSources.length = 0;
    }

    private removeListener(dragSourceAndListener: DragSourceAndListener): void {
        const element = dragSourceAndListener.dragSource.eElement;
        const mouseDownListener = dragSourceAndListener.mouseDownListener;
        element.removeEventListener('mousedown', mouseDownListener);

        // remove touch listener only if it exists
        if (dragSourceAndListener.touchEnabled) {
            const touchStartListener = dragSourceAndListener.touchStartListener;
            element.removeEventListener('touchstart', touchStartListener, {passive:true} as any);
        }
    }

    public removeDragSource(params: DragListenerParams): void {
        const dragSourceAndListener = _.find(this.dragSources, item => item.dragSource === params);

        if (!dragSourceAndListener) { return; }

        this.removeListener(dragSourceAndListener);
        _.removeFromArray(this.dragSources, dragSourceAndListener);
    }

    private setNoSelectToBody(noSelect: boolean): void {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const eBody = eDocument.querySelector('body') as HTMLElement;
        if (_.exists(eBody)) {
            // when we drag the mouse in ag-Grid, this class gets added / removed from the body, so that
            // the mouse isn't selecting text when dragging.
            _.addOrRemoveCssClass(eBody, 'ag-unselectable', noSelect);
        }
    }

    public addDragSource(params: DragListenerParams, includeTouch: boolean = false): void {
        const mouseListener = this.onMouseDown.bind(this, params);
        params.eElement.addEventListener('mousedown', mouseListener);

        let touchListener: (touchEvent: TouchEvent) => void = null;

        const suppressTouch = this.gridOptionsWrapper.isSuppressTouch();

        if (includeTouch && !suppressTouch) {
            touchListener = this.onTouchStart.bind(this, params);
            params.eElement.addEventListener('touchstart', touchListener, { passive:false } as any);
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

        const touch = touchEvent.touches[0];

        this.touchLastTime = touch;
        this.touchStart = touch;

        touchEvent.preventDefault();

        // we temporally add these listeners, for the duration of the drag, they
        // are removed in touch end handling.
        params.eElement.addEventListener('touchmove', this.onTouchMoveListener, {passive:true} as any);
        params.eElement.addEventListener('touchend', this.onTouchEndListener, {passive:true} as any);
        params.eElement.addEventListener('touchcancel', this.onTouchEndListener, {passive:true} as any);

        this.dragEndFunctions.push(() => {
            params.eElement.removeEventListener('touchmove', this.onTouchMoveListener, {passive:true} as any);
            params.eElement.removeEventListener('touchend', this.onTouchEndListener, {passive:true} as any);
            params.eElement.removeEventListener('touchcancel', this.onTouchEndListener, {passive:true} as any);
        });

        // see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onCommonMove(touch, this.touchStart);
        }
    }

    // gets called whenever mouse down on any drag source
    private onMouseDown(params: DragListenerParams, mouseEvent: MouseEvent): void {
        // we ignore when shift key is pressed. this is for the range selection, as when
        // user shift-clicks a cell, this should not be interpreted as the start of a drag.
        // if (mouseEvent.shiftKey) { return; }
        if (params.skipMouseEvent) {
            if (params.skipMouseEvent(mouseEvent)) { return; }
        }

        // if there are two elements with parent / child relationship, and both are draggable,
        // when we drag the child, we should NOT drag the parent. an example of this is row moving
        // and range selection - row moving should get preference when use drags the rowDrag component.
        if ((mouseEvent as any)._alreadyProcessedByDragService) { return; }
        (mouseEvent as any)._alreadyProcessedByDragService = true;

        // only interested in left button clicks
        if (mouseEvent.button !== 0) { return; }

        this.currentDragParams = params;
        this.dragging = false;

        this.mouseStartEvent = mouseEvent;

        const eDocument = this.gridOptionsWrapper.getDocument();

        this.setNoSelectToBody(true);
        // we temporally add these listeners, for the duration of the drag, they
        // are removed in mouseup handling.
        eDocument.addEventListener('mousemove', this.onMouseMoveListener);
        eDocument.addEventListener('mouseup', this.onMouseUpListener);

        this.dragEndFunctions.push(() => {
            eDocument.removeEventListener('mousemove', this.onMouseMoveListener);
            eDocument.removeEventListener('mouseup', this.onMouseUpListener);
        });

        //see if we want to start dragging straight away
        if (params.dragStartPixels === 0) {
            this.onMouseMove(mouseEvent);
        }
    }

    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    private isEventNearStartEvent(currentEvent: MouseEvent | Touch, startEvent: MouseEvent | Touch): boolean {
        // by default, we wait 4 pixels before starting the drag
        const {dragStartPixels} = this.currentDragParams;
        const requiredPixelDiff = _.exists(dragStartPixels) ? dragStartPixels : 4;
        return _.areEventsNear(currentEvent, startEvent, requiredPixelDiff);
    }

    private getFirstActiveTouch(touchList: TouchList): Touch {
        for (let i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === this.touchStart.identifier) {
                return touchList[i];
            }
        }
        return null;
    }

    private onCommonMove(currentEvent: MouseEvent | Touch, startEvent: MouseEvent | Touch): void {
        if (!this.dragging) {
            // if mouse hasn't travelled from the start position enough, do nothing
            if (!this.dragging && this.isEventNearStartEvent(currentEvent, startEvent)) { return; }

            this.dragging = true;
            const event: DragStartedEvent = {
                type: Events.EVENT_DRAG_STARTED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
            this.currentDragParams.onDragStart(startEvent);
        }

        this.currentDragParams.onDragging(currentEvent);
    }

    private onTouchMove(touchEvent: TouchEvent): void {
        const touch = this.getFirstActiveTouch(touchEvent.touches);
        if (!touch) { return; }

        // this.___statusPanel.setInfoText(Math.random() + ' onTouchMove preventDefault stopPropagation');

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
        let touch = this.getFirstActiveTouch(touchEvent.changedTouches);

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

    public onUpCommon(eventOrTouch: MouseEvent | Touch): void {
        if (this.dragging) {
            this.dragging = false;
            this.currentDragParams.onDragStop(eventOrTouch);
            const event: DragStoppedEvent = {
                type: Events.EVENT_DRAG_STOPPED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }

        this.setNoSelectToBody(false);

        this.mouseStartEvent = null;
        this.touchStart = null;
        this.touchLastTime = null;
        this.currentDragParams = null;

        this.dragEndFunctions.forEach(func => func());
        this.dragEndFunctions.length = 0;
    }
}

interface DragSourceAndListener {
    dragSource: DragListenerParams;
    mouseDownListener: (mouseEvent: MouseEvent) => void;
    touchEnabled: boolean;
    touchStartListener: (touchEvent: TouchEvent) => void;
}

export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: HTMLElement;
    /** Some places may wish to ignore certain events, eg range selection ignores shift clicks */
    skipMouseEvent?: (mouseEvent: MouseEvent) => boolean;
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent | Touch) => void;
}