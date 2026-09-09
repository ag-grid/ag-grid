import * as agStack from 'ag-stack';
import type { Mock, MockInstance } from 'vitest';

import { ViewportSizeFeature } from './viewportSizeFeature';

// Spies, not `vi.mock`: a module mock only lands when this file owns its module graph, which is not
// guaranteed — another file in the same worker may already have imported `ag-stack` unmocked. Spying
// replaces the live binding the subject reads through, so it holds either way.
let _observeResize: MockInstance;
let _requestAnimationFrame: MockInstance;

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
        _observeResize = vi.spyOn(agStack, '_observeResize').mockImplementation(() => () => undefined);
        _requestAnimationFrame = vi
            .spyOn(agStack, '_requestAnimationFrame')
            .mockImplementation((_beans: any, callback: () => void) => callback());
    });

    afterEach(() => {
        vi.restoreAllMocks();
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
