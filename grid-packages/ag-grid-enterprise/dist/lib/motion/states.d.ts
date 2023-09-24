interface StateDefinition<State extends string, Event extends string> {
    actions?: {
        onEnter?: () => void;
        onExit?: () => void;
    };
    on?: {
        [key in Event]?: {
            target: State;
            action: (data?: any) => void;
        };
    };
}
export declare class StateMachine<State extends string, Event extends string> {
    static DEBUG: () => boolean;
    private states;
    private state;
    constructor(initialState: State, states: Record<State, StateDefinition<State, Event>>);
    transition(event: Event, data?: any): State | undefined;
}
export {};
//# sourceMappingURL=states.d.ts.map