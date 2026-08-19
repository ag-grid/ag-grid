import { FOCUS_MANAGED_CLASS, _focusIntoTabbableFirst } from './focus';

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
