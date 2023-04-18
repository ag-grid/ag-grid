import { AutomatedExample } from '../types';
import { createScriptDebuggerManager } from './scriptDebugger';

export type AutomatedExampleManager = ReturnType<typeof createAutomatedExampleManager>;

interface Params {
    debugCanvasClassname: string;
    debugPanelClassname: string;
}

export function createAutomatedExampleManager({ debugCanvasClassname, debugPanelClassname }: Params) {
    const exampleDebuggerManager = createScriptDebuggerManager({
        canvasClassname: debugCanvasClassname,
        panelClassname: debugPanelClassname,
    });

    const automatedExamples: Record<string, AutomatedExample> = {};
    const automatedExamplesEnabled: Record<string, boolean> = {};
    let lastPlayingExample;

    const add = ({
        id,
        automatedExample,
        isDisabled,
    }: {
        id: string;
        automatedExample: AutomatedExample;
        isDisabled?: boolean;
    }) => {
        automatedExamples[id] = automatedExample;
        automatedExamplesEnabled[id] = !isDisabled;
    };

    const start = (id: string) => {
        const automatedExample = automatedExamples[id];
        const isEnabled = automatedExamplesEnabled[id];

        if (!automatedExample) {
            console.error('Automated example not found:', id);
            return;
        } else if (!isEnabled) {
            return;
        }

        // Start example if it's not playing and also not inactive
        // Inactive examples are only started with there is only one example on the viewport.
        if (automatedExample.currentState() !== 'playing' && automatedExample.currentState() !== 'inactive') {
            // Stop last playing example, since we are going to start another one.
            if (lastPlayingExample !== automatedExample) {
                // Note, not setting to inactive, so that it can start again in this if statement
                lastPlayingExample?.stop();
            }

            lastPlayingExample = automatedExample;
            automatedExample.start();
        }
        // Initial condition when page is loaded and grid was not on the page
        else if (automatedExample.currentState() === 'inactive' && !lastPlayingExample) {
            lastPlayingExample = automatedExample;
            automatedExample.start();
        }
    };

    const stop = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        lastPlayingExample = undefined;
        automatedExample.stop();
    };

    const inactive = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        lastPlayingExample = undefined;
        automatedExample.inactive();

        // If there is another example in the viewport, play it
        const otherExampleKey = Object.keys(automatedExamples).find((key) => {
            const example = automatedExamples[key];
            const isEnabled = automatedExamplesEnabled[key];
            return example !== automatedExample && isEnabled && example?.isInViewport();
        });
        otherExampleKey && automatedExamples[otherExampleKey]?.start();
    };

    const setEnabled = ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
        automatedExamplesEnabled[id] = isEnabled;
    };

    const getEnabled = (id: string) => automatedExamplesEnabled[id];

    const setDebugEnabled = (enabled: boolean) => {
        exampleDebuggerManager.setEnabled(enabled);
    };

    const setDebugInitialDraw = (shouldDraw: boolean) => {
        exampleDebuggerManager.setInitialDraw(shouldDraw);
    };

    const getDebuggerManager = () => {
        return exampleDebuggerManager;
    };

    return {
        add,
        start,
        stop,
        inactive,
        setEnabled,
        getEnabled,
        setDebugEnabled,
        setDebugInitialDraw,
        getDebuggerManager,
    };
}
