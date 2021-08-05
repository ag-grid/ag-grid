import { Constants } from "../constants/constants";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { RowGroupOpenedEvent } from "../events";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IRowModel } from "../interfaces/iRowModel";
import { AnimationFrameService } from "../misc/animationFrameService";

@Bean('rowNodeEventThrottle')
export class RowNodeEventThrottle extends BeanStub {

    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('rowModel') private rowModel: IRowModel;

    private clientSideRowModel: IClientSideRowModel;

    private events: RowGroupOpenedEvent[] | undefined;

    @PostConstruct
    private postConstruct(): void {
        if (this.rowModel.getType()==Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
    }

    // because the user can call rowNode.setExpanded() many times in one VM turn,
    // we throttle the calls to ClientSideRowModel using animationFrameService. this means for 100
    // row nodes getting expanded, we only update the CSRM once, and then we fire all events after
    // CSRM has updated.
    // 
    // if we did not do this, then the user could call setExpanded on 100+ rows, causing the grid
    // to re-render 100+ times, which would be a performance lag.
    //    
    // we use animationFrameService
    // rather than _.debounce() so this will get done if anyone flushes the animationFrameService
    // (eg user calls api.ensureRowVisible(), which in turn flushes ).
    public dispatchExpanded(event: RowGroupOpenedEvent): void {

        const doingThrottle = this.animationFrameService.isOn() && this.clientSideRowModel;

        if (!doingThrottle) {
            if (this.clientSideRowModel) {
                this.clientSideRowModel.onRowGroupOpened();
            }
            this.eventService.dispatchEvent(event);
            return; 
        }

        if (!this.events) {
            this.events = [];
            this.animationFrameService.addDestroyTask(this.flushEvents.bind(this));
        }

        this.events.push(event);
    }

    private flushEvents(): void {
        this.clientSideRowModel.onRowGroupOpened();
        if (!this.events) { return; }
        this.events.forEach( e => this.eventService.dispatchEvent(e) );
        this.events = undefined;
    }
}