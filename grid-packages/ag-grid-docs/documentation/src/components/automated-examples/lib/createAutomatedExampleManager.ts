import { AutomatedExample } from '../types';

export function createAutomatedExampleManager() {
    const automatedExamples = {};

    const add = ({ id, automatedExample }: { id: string; automatedExample: AutomatedExample }) => {
        automatedExamples[id] = automatedExample;
    };

    const start = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        if (automatedExample.currentState() !== 'playing') {
            automatedExample.start();
        }
    };

    const stop = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        automatedExample.stop();
    };

    const inactive = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        automatedExample.inactive();
    };

    return {
        add,
        start,
        stop,
        inactive,
    };
}
