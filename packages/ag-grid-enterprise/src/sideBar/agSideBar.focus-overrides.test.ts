import { AgSideBarSelector } from './agSideBar';

function createFocusableButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = 0;
    return button;
}

describe('AgSideBar focus overrides', () => {
    test('tab with no open panel evaluates next grid container once when callback returns false', () => {
        const sideBarGui = document.createElement('div');
        const sideBarButton = createFocusableButton();
        sideBarGui.appendChild(sideBarButton);

        const rootDiv = document.createElement('div');
        try {
            rootDiv.appendChild(sideBarGui);
            document.body.appendChild(rootDiv);
            sideBarButton.focus();

            const gridCtrl = {
                focusNextInnerContainer: jest.fn(() => false),
                forceFocusOutOfContainer: jest.fn(),
                isDetailGrid: jest.fn(() => false),
                isFocusInsideGridBody: jest.fn(() => true),
            };

            const sideBarContext = {
                beans: {
                    eRootDiv: rootDiv,
                    ctrlsSvc: {
                        get: jest.fn(() => gridCtrl),
                    },
                },
                sideBarButtons: {
                    getGui: () => sideBarGui,
                },
                getGui: () => sideBarGui,
            };

            const onTabKeyDown = (AgSideBarSelector.component as any).prototype.onTabKeyDown;
            onTabKeyDown.call(sideBarContext, new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));

            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
        } finally {
            rootDiv.remove();
        }
    });
});
