import { _addFocusableContainerListener } from 'ag-grid-community';

import { AgSideBarSelector } from './agSideBar';

function createFocusableButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = 0;
    return button;
}

describe('AgSideBar focus overrides', () => {
    test.each<boolean | undefined>([false, undefined])(
        'tab with no open panel evaluates next grid container once when focus result is %s',
        (focusResult) => {
            const sideBarGui = document.createElement('div');
            const sideBarButton = createFocusableButton();
            sideBarGui.appendChild(sideBarButton);

            const rootDiv = document.createElement('div');
            try {
                rootDiv.appendChild(sideBarGui);
                document.body.appendChild(rootDiv);
                sideBarButton.focus();

                const gridCtrl = {
                    focusNextInnerContainer: vi.fn((_backwards: boolean) => focusResult),
                    forceFocusOutOfContainer: vi.fn(),
                    isDetailGrid: vi.fn(() => false),
                    isFocusInsideGridBody: vi.fn(() => true),
                };

                const beans = {
                    eRootDiv: rootDiv,
                    ctrlsSvc: {
                        get: vi.fn(() => gridCtrl),
                    },
                };

                const sideBarContext = {
                    beans,
                    sideBarButtons: {
                        getGui: () => sideBarGui,
                    },
                    getGui: () => sideBarGui,
                    addManagedElementListeners: (
                        element: HTMLElement,
                        listeners: { keydown?: (e: KeyboardEvent) => void }
                    ) => {
                        if (listeners.keydown) {
                            element.addEventListener('keydown', listeners.keydown as EventListener);
                        }
                    },
                };

                const onTabKeyDown = (AgSideBarSelector.component as any).prototype.onTabKeyDown;

                // replicate enterprise sidebar wiring: managed focus listener + focusable container listener
                sideBarContext.addManagedElementListeners(sideBarGui, {
                    keydown: (e: KeyboardEvent) => onTabKeyDown.call(sideBarContext, e),
                });
                _addFocusableContainerListener(beans as any, sideBarContext as any, sideBarGui);

                sideBarButton.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
                );

                expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            } finally {
                rootDiv.remove();
            }
        }
    );
});
