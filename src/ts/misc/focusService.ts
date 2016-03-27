import {Bean, PostConstruct, Autowired, PreDestroy} from "../context/context";
import {Utils as _} from '../utils';

// because FireFox doesn't implement focusout event, we have to hack
// it in using this service.

@Bean('focusService')
export class FocusService {

    private destroyMethods: Function[] = [];
    
    private listeners: ((focusEvent: FocusEvent)=>void)[] = [];

    public addListener(listener: (focusEvent: FocusEvent)=>void): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: (focusEvent: FocusEvent)=>void): void {
        _.removeFromArray(this.listeners, listener);
    }
    
    @PostConstruct
    private init(): void {
        var that = this;
        var focusListener = function(focusEvent: FocusEvent) {
            that.informListeners(focusEvent);
        };
        document.body.addEventListener('focus', focusListener, true);
        this.destroyMethods.push( () => {
            document.body.removeEventListener('focus', focusListener);
        });
    }

    private informListeners(focusEvent: FocusEvent): void {
        this.listeners.forEach( listener => listener(focusEvent) );
    }

    @PreDestroy
    private destroy(): void {
        this.destroyMethods.forEach( destroyMethod => destroyMethod() );
    }

}
