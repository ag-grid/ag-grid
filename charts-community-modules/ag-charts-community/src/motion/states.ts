import { Logger } from '../util/logger';

interface StateDefinition<State extends string> {
    actions?: {
        onEnter?: () => void;
        onExit?: () => void;
    };
    on: {
        [key: string]: {
            target: State;
            action: () => void;
        };
    };
}

export class StateMachine<State extends string, Event extends string> {
    private states: Record<State, StateDefinition<State>>;
    private state: State;

    debug = true;

    constructor(initialState: State, states: Record<State, StateDefinition<State>>) {
        this.state = initialState;
        this.states = states;

        if (this.debug) Logger.debug(`%c${this.constructor.name} | init -> ${initialState}`, 'color: green');
    }

    transition(event: Event) {
        const currentStateConfig = this.states[this.state];
        const destinationTransition = currentStateConfig?.on[event];

        if (!destinationTransition) {
            if (this.debug)
                Logger.debug(`%c${this.constructor.name} | ${this.state} -> ${event} -> ${this.state}`, 'color: grey');
            return;
        }

        const destinationState = destinationTransition.target;
        const destinationStateConfig = this.states[destinationState];

        if (this.debug)
            Logger.debug(
                `%c${this.constructor.name} | ${this.state} -> ${event} -> ${destinationState}`,
                'color: green'
            );

        destinationTransition.action();
        currentStateConfig?.actions?.onExit?.();
        destinationStateConfig?.actions?.onEnter?.();

        this.state = destinationState;

        return this.state;
    }
}
