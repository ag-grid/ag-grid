import { FOCUS_MANAGED_CLASS, _findFocusableElements, _focusIntoTabbableFirst } from './focus';

describe('_focusIntoTabbableFirst', () => {
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
});

describe('_findFocusableElements radio groups', () => {
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

    function createRadio(name: string, checked = false): HTMLInputElement {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.checked = checked;
        return radio;
    }

    test('keeps only the checked radio of each named group, per form', () => {
        const root = document.createElement('div');
        const form = document.createElement('form');
        const a1 = createRadio('a');
        const a2 = createRadio('a', true);
        const formA1 = createRadio('a', true);
        const formA2 = createRadio('a');
        const unnamed1 = createRadio('');
        const unnamed2 = createRadio('', true);

        form.append(formA1, formA2);
        root.append(a1, a2, form, unnamed1, unnamed2);
        document.body.appendChild(root);

        expect(_findFocusableElements(root)).toEqual([a2, formA1, unnamed1, unnamed2]);
        root.remove();
    });

    test('keeps every radio of a group with nothing checked', () => {
        const root = document.createElement('div');
        const b1 = createRadio('b');
        const b2 = createRadio('b');

        root.append(b1, b2);
        document.body.appendChild(root);

        expect(_findFocusableElements(root)).toEqual([b1, b2]);
        root.remove();
    });

    test("a focused unchecked radio is its group's stop instead of the checked one", () => {
        const root = document.createElement('div');
        const c1 = createRadio('c');
        const c2 = createRadio('c', true);

        root.append(c1, c2);
        document.body.appendChild(root);
        c1.focus();

        expect(_findFocusableElements(root)).toEqual([c1]);
        root.remove();
    });
});
