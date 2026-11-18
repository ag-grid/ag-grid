import { _SpaceKeyAction } from './keyboard';

function keyEvent(type: 'keydown' | 'keyup', target: EventTarget, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent(type, { key: ' ', cancelable: true, ...init });
    Object.defineProperty(event, 'target', { value: target });
    return event;
}

describe('_SpaceKeyAction', () => {
    const element = document.createElement('div');
    const otherElement = document.createElement('div');

    test('acts on keyup, not keydown, and prevents both defaults', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        const keydown = keyEvent('keydown', element);
        spaceKeyAction.arm(keydown, action);
        expect(action).not.toHaveBeenCalled();
        expect(keydown.defaultPrevented).toBe(true);

        const keyup = keyEvent('keyup', element);
        spaceKeyAction.onKeyUp(keyup);
        expect(action).toHaveBeenCalledTimes(1);
        expect(keyup.defaultPrevented).toBe(true);
    });

    test('acts once when Space is held, and prevents the default of every repeat', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        spaceKeyAction.arm(keyEvent('keydown', element), action);
        const repeats = [
            keyEvent('keydown', element, { repeat: true }),
            keyEvent('keydown', element, { repeat: true }),
        ];
        for (const repeat of repeats) {
            spaceKeyAction.arm(repeat, action);
        }
        expect(repeats.every((repeat) => repeat.defaultPrevented)).toBe(true);

        spaceKeyAction.onKeyUp(keyEvent('keyup', element));
        spaceKeyAction.onKeyUp(keyEvent('keyup', element));
        expect(action).toHaveBeenCalledTimes(1);
    });

    test('does not act when Space is released on another element', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        spaceKeyAction.arm(keyEvent('keydown', element), action);
        spaceKeyAction.onKeyUp(keyEvent('keyup', otherElement));
        // released on the other element, so a later keyup without a fresh keydown must not act either
        spaceKeyAction.onKeyUp(keyEvent('keyup', element));

        expect(action).not.toHaveBeenCalled();
    });

    test('does not act on a repeat keydown that was never armed by a first keydown', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        spaceKeyAction.arm(keyEvent('keydown', element, { repeat: true }), action);
        spaceKeyAction.onKeyUp(keyEvent('keyup', element));

        expect(action).not.toHaveBeenCalled();
    });

    test('stays armed while another key is released', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        spaceKeyAction.arm(keyEvent('keydown', element, { shiftKey: true }), action);
        spaceKeyAction.onKeyUp(keyEvent('keyup', element, { key: 'Shift' }));
        expect(action).not.toHaveBeenCalled();

        spaceKeyAction.onKeyUp(keyEvent('keyup', element));
        expect(action).toHaveBeenCalledTimes(1);
    });

    test('does not act after being disarmed', () => {
        const spaceKeyAction = new _SpaceKeyAction();
        const action = vi.fn();

        spaceKeyAction.arm(keyEvent('keydown', element), action);
        spaceKeyAction.disarm();
        spaceKeyAction.onKeyUp(keyEvent('keyup', element));

        expect(action).not.toHaveBeenCalled();
    });
});
