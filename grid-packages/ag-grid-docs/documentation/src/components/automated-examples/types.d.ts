import { RunScriptState } from './lib/scriptRunner';

export interface AutomatedExample {
    start: () => void;
    stop: () => void;
    inactive: () => void;
    currentState: () => RunScriptState;
    isInViewport: () => boolean;
}
