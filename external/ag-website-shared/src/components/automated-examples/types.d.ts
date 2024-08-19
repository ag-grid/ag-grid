import { type ScriptDebugger } from './lib/scriptDebugger';
import { type RunScriptState } from './lib/scriptRunner';

export interface AutomatedExample {
    start: () => void;
    stop: () => void;
    inactive: () => void;
    currentState: () => RunScriptState;
    isInViewport: () => boolean;
    getDebugger: () => ScriptDebugger | undefined;
    updateDarkMode?: (darkMode: boolean) => void;
}
