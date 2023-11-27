type StateDefinition<State extends string, Event extends string> = {
    [key in Event]?: StateTransition<State> | StateTransitionAction | State;
};
type StateTransition<State> = {
    target: State;
    action?: StateTransitionAction;
};
type StateTransitionAction = (data?: any) => void;
export declare class StateMachine<State extends string, Event extends string> {
    private readonly states;
    private readonly preTransitionCb?;
    private readonly debug;
    private state;
    constructor(initialState: State, states: Record<State, StateDefinition<State, Event>>, preTransitionCb?: ((from: State, to: State) => void) | undefined);
    transition(event: Event, data?: any): State | undefined;
}
export {};
