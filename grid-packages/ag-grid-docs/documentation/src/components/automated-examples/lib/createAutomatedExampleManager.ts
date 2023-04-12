import { AutomatedExample } from '../types';

export function createAutomatedExampleManager() {
    const automatedExamples: Record<string, AutomatedExample> = {};
    let lastPlayingExample;

    const add = ({ id, automatedExample }: { id: string; automatedExample: AutomatedExample }) => {
        automatedExamples[id] = automatedExample;
    };

    const start = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
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
        const otherExample = Object.values(automatedExamples).find((example) => {
            return example !== automatedExample && example?.isInViewport();
        });
        otherExample?.start();
    };

    return {
        add,
        start,
        stop,
        inactive,
    };
}
