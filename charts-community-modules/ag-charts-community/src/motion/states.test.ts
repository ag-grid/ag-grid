import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { StateMachine } from './states';

describe('Animation States', () => {
    let state;
    let initialEventNext;
    let initialOnExit;
    let nextOnEnter;

    beforeEach(() => {
        initialEventNext = jest.fn();
        initialOnExit = jest.fn();
        nextOnEnter = jest.fn();
        state = new StateMachine<'initial' | 'next', 'event'>('initial', {
            initial: {
                actions: {
                    onExit: initialOnExit,
                },
                on: {
                    event: {
                        target: 'next',
                        action: initialEventNext,
                    },
                },
            },
            next: {
                actions: {
                    onEnter: nextOnEnter,
                },
            },
        });
    });

    it('should initialise to the given initial state', () => {
        expect(state.state).toBe('initial');
    });

    it('should transition between two states', () => {
        state.transition('event');
        expect(state.state).toBe('next');
    });

    it('should call the transition action', () => {
        state.transition('event');
        expect(initialEventNext).toHaveBeenCalledTimes(1);
    });

    it("should call a state's onExit action", () => {
        state.transition('event');
        expect(initialOnExit).toHaveBeenCalledTimes(1);
    });

    it("should call a state's onEnter action", () => {
        state.transition('event');
        expect(nextOnEnter).toHaveBeenCalledTimes(1);
    });
});
