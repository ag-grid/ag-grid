import { FOCUS_MANAGED_CLASS, _findFocusableElements, _focusInto, _focusIntoTabbableFirst } from './focus';

const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');

beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get() {
            return this.parentNode;
        },
    });
});

afterAll(() => {
    if (originalOffsetParent) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
    } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent');
    }
});

describe('_focusIntoTabbableFirst', () => {
    test('prefers tabbable elements over managed ones in either direction', () => {
        const root = document.createElement('div');
        const managedButton = document.createElement('button');
        const tabbableButton = document.createElement('button');
        const trailingManagedButton = document.createElement('button');

        managedButton.tabIndex = -1;
        trailingManagedButton.tabIndex = -1;
        root.append(managedButton, tabbableButton, trailingManagedButton);
        document.body.appendChild(root);

        expect(_focusIntoTabbableFirst(root)).toBe(true);
        expect(document.activeElement).toBe(tabbableButton);
        expect(_focusIntoTabbableFirst(root, true)).toBe(true);
        expect(document.activeElement).toBe(tabbableButton);
        root.remove();
    });

    test('falls back to managed content owned by a managed-focus wrapper inside the container', () => {
        const root = document.createElement('div');
        const managedButton = document.createElement('button');

        root.classList.add(FOCUS_MANAGED_CLASS);
        managedButton.tabIndex = -1;
        root.appendChild(managedButton);
        document.body.appendChild(root);

        expect(_focusIntoTabbableFirst(root)).toBe(true);
        expect(document.activeElement).toBe(managedButton);
        root.remove();
    });

    test('refuses managed content whose managed-focus wrapper is outside the container', () => {
        const managedAncestor = document.createElement('div');
        const root = document.createElement('div');
        const managedButton = document.createElement('button');

        managedAncestor.classList.add(FOCUS_MANAGED_CLASS);
        managedButton.tabIndex = -1;
        root.appendChild(managedButton);
        managedAncestor.appendChild(root);
        document.body.appendChild(managedAncestor);

        expect(_focusIntoTabbableFirst(root)).toBe(false);
        expect(document.activeElement).not.toBe(managedButton);
        managedAncestor.remove();
    });

    test('does not let a checked radio with tabindex="-1" exclude a tabbable radio', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <input type="radio" name="choice">
            <input type="radio" name="choice" checked tabindex="-1">
            <button>Next</button>
        `;
        document.body.appendChild(root);

        expect(_focusIntoTabbableFirst(root)).toBe(true);
        expect(document.activeElement).toBe(root.querySelector('input'));
        root.remove();
    });
});

describe.each([
    { name: '_focusInto', focus: _focusInto },
    { name: '_focusIntoTabbableFirst', focus: _focusIntoTabbableFirst },
])('$name radio groups', ({ focus }) => {
    function createRadio(name: string, checked = false): HTMLInputElement {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.checked = checked;
        return radio;
    }

    test('focuses the checked radio of each named group, per form', () => {
        const root = document.createElement('div');
        const form = document.createElement('form');
        const a1 = createRadio('a');
        const a2 = createRadio('a', true);
        const formA1 = createRadio('a', true);
        const formA2 = createRadio('a');
        form.append(formA1, formA2);
        root.append(a1, a2, form);
        document.body.appendChild(root);

        expect(_findFocusableElements(root)).toEqual([a1, a2, formA1, formA2]);
        expect(focus(root)).toBe(true);
        expect(document.activeElement).toBe(a2);
        expect(focus(root, true)).toBe(true);
        expect(document.activeElement).toBe(formA1);
        root.remove();
    });

    test.each(['', 'choice'])('enters an unchecked group named "%s" from either end', (name) => {
        const root = document.createElement('div');
        const b1 = createRadio(name);
        const b2 = createRadio(name);

        root.append(b1, b2);
        document.body.appendChild(root);

        expect(focus(root)).toBe(true);
        expect(document.activeElement).toBe(b1);
        b1.blur();
        expect(focus(root, true)).toBe(true);
        expect(document.activeElement).toBe(b2);
        root.remove();
    });

    test('does not combine unnamed radios into a group', () => {
        const root = document.createElement('div');
        const first = createRadio('');
        const last = createRadio('', true);
        root.append(first, last);
        document.body.appendChild(root);

        expect(focus(root)).toBe(true);
        expect(document.activeElement).toBe(first);
        expect(focus(root, true)).toBe(true);
        expect(document.activeElement).toBe(last);
        root.remove();
    });

    test("a focused unchecked radio is its group's stop instead of the checked one", () => {
        const root = document.createElement('div');
        const c1 = createRadio('c');
        const c2 = createRadio('c', true);

        root.append(c1, c2);
        document.body.appendChild(root);
        c1.focus();

        expect(focus(root, true)).toBe(true);
        expect(document.activeElement).toBe(c1);
        root.remove();
    });
});
