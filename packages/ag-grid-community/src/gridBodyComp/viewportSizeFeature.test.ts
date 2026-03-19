import { _observeResize, _requestAnimationFrame } from '../agStack/utils/dom';
import { ViewportSizeFeature } from './viewportSizeFeature';

jest.mock('../agStack/utils/dom', () => {
    const actual = jest.requireActual('../agStack/utils/dom');
    return {
        ...actual,
        _observeResize: jest.fn(),
        _requestAnimationFrame: jest.fn((_beans: unknown, callback: () => void) => callback()),
    };
});

describe('ViewportSizeFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function createFakeFeature(params: {
        centerContainer: HTMLDivElement;
        centerViewport: HTMLDivElement;
        registerViewportResizeListener: jest.Mock;
        onCenterViewportResized: jest.Mock;
        refreshScrollVisible: jest.Mock;
    }): ViewportSizeFeature {
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
            addDestroyFunc: jest.fn(),
            onCenterViewportResized: params.onCenterViewportResized,
            centerViewportResizeQueued: false,
            scrollVisibilityRefreshQueued: false,
        }) as ViewportSizeFeature;
    }

    test('listens to center container resize and refreshes scroll visibility', () => {
        let resizeCallback: (() => void) | undefined;

        (_observeResize as jest.Mock).mockImplementation((_beans: unknown, _element: Element, callback: () => void) => {
            resizeCallback = callback;
            return jest.fn();
        });

        const onCenterViewportResized = jest.fn();
        const refreshScrollVisible = jest.fn();
        const registerViewportResizeListener = jest.fn();

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
