import { _observeResize, _requestAnimationFrame } from 'ag-stack';
import type { Mock } from 'vitest';

import { ViewportSizeFeature } from './viewportSizeFeature';

vi.mock('ag-stack', async () => {
    const actual = await vi.importActual('ag-stack');
    return {
        ...actual,
        _observeResize: vi.fn(),
        _requestAnimationFrame: vi.fn((_beans: unknown, callback: () => void) => callback()),
    };
});

function createFakeFeature(params: {
    centerContainer: HTMLDivElement;
    centerViewport: HTMLDivElement;
    registerViewportResizeListener: Mock;
    onCenterViewportResized: Mock;
    refreshScrollVisible: Mock;
}): ViewportSizeFeature & { beans: object } {
    return Object.assign(Object.create(ViewportSizeFeature.prototype), {
        beans: {},
        scrollVisibleSvc: {
            refresh: params.refreshScrollVisible,
        },
        centerContainerCtrl: {
            eContainer: params.centerContainer,
            eViewport: params.centerViewport,
            registerViewportResizeListener: params.registerViewportResizeListener,
        },
        gridBodyCtrl: {
            eGridViewport: params.centerViewport,
        },
        addDestroyFunc: vi.fn(),
        onCenterViewportResized: params.onCenterViewportResized,
        centerViewportResizeQueued: false,
        scrollVisibilityRefreshQueued: false,
    });
}

describe('ViewportSizeFeature', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('listens to center container resize and refreshes scroll visibility', () => {
        let resizeCallback: (() => void) | undefined;

        (_observeResize as Mock).mockImplementation((_beans: unknown, _element: Element, callback: () => void) => {
            resizeCallback = callback;
            return vi.fn();
        });

        const onCenterViewportResized = vi.fn();
        const refreshScrollVisible = vi.fn();
        const registerViewportResizeListener = vi.fn();

        const centerContainer = document.createElement('div');
        const centerViewport = document.createElement('div');

        const fakeFeature = createFakeFeature({
            centerContainer,
            centerViewport,
            registerViewportResizeListener,
            onCenterViewportResized,
            refreshScrollVisible,
        });

        (ViewportSizeFeature.prototype as unknown as { listenForResize: () => void }).listenForResize.call(fakeFeature);

        expect(registerViewportResizeListener).toHaveBeenCalledTimes(1);
        expect(_observeResize).toHaveBeenCalledWith(fakeFeature.beans, centerContainer, expect.any(Function));

        const viewportResizeListener = registerViewportResizeListener.mock.calls[0][0] as () => void;
        viewportResizeListener();
        expect(onCenterViewportResized).toHaveBeenCalledTimes(1);

        resizeCallback?.();
        expect(refreshScrollVisible).toHaveBeenCalledTimes(1);
        expect(_requestAnimationFrame).toHaveBeenCalled();
    });
});
