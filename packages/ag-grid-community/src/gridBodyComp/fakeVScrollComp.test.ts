import { FakeVScrollComp } from './fakeVScrollComp';

describe('FakeVScrollComp', () => {
    test('positions vertical scrollbar between header rows and horizontal scrollbar', () => {
        const eGui = document.createElement('div');
        const eViewport = document.createElement('div');
        const eContainer = document.createElement('div');
        eGui.appendChild(eViewport);
        eViewport.appendChild(eContainer);

        const eSpacer = document.createElement('div');

        const fakeComp = {
            gos: {
                get: (key: string) => (key === 'enableRtl' ? false : undefined),
            },
            beans: {
                scrollVisibleSvc: {
                    verticalScrollShowing: true,
                    getScrollbarWidth: () => 11,
                },
                ctrlsSvc: {
                    getGridBodyCtrl: () => ({
                        getVerticalScrollbarWidth: () => 13,
                        getHorizontalScrollbarHeight: () => 17,
                        getHeaderRowsOffset: () => 41,
                    }),
                },
            },
            enableRtl: false,
            invisibleScrollbar: false,
            eSpacer,
            eViewport,
            eContainer,
            getGui: () => eGui,
            toggleCss: vi.fn(),
            setDisplayed: vi.fn(),
            queueContainerHeightSync: vi.fn(),
        } as unknown as FakeVScrollComp;

        (FakeVScrollComp.prototype as unknown as { setScrollVisible: () => void }).setScrollVisible.call(fakeComp);

        expect(eSpacer.style.height).toBe('41px');
        expect(eGui.style.bottom).toBe('17px');
        expect(eGui.style.right).toBe('');
        expect(eGui.style.left).toBe('');
        expect(eGui.style.width).toBe('13px');
        expect(eViewport.style.width).toBe('13px');
        expect(eContainer.style.width).toBe('13px');
    });
});
