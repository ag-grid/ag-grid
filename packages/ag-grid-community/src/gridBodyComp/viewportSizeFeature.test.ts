import * as agStack from 'ag-stack';
import type { Mock, MockInstance } from 'vitest';

import { ViewportSizeFeature } from './viewportSizeFeature';

// Spies, not `vi.mock`: a module mock only lands when this file owns its module graph, which is not
// guaranteed — another file in the same worker may already have imported `ag-stack` unmocked. Spying
// replaces the live binding the subject reads through, so it holds either way.
let _observeResize: MockInstance;

function createFakeFeature(params: {
    centerContainer: HTMLDivElement;
    centerViewport: HTMLDivElement;
    registerViewportResizeListener: Mock;
    scheduleCenterViewportResize: Mock;
    scheduleScrollVisibilityRefresh: Mock;
}): ViewportSizeFeature & { beans: object } {
    // The schedulers are deliberately distinct from the handlers they wrap, so registering an unthrottled
    // handler instead of its scheduler fails here rather than passing on an alias.
    return Object.assign(Object.create(ViewportSizeFeature.prototype), {
        beans: {},
        scrollVisibleSvc: {
            refresh: vi.fn(),
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
        scheduleCenterViewportResize: params.scheduleCenterViewportResize,
        scheduleScrollVisibilityRefresh: params.scheduleScrollVisibilityRefresh,
    });
}

describe('ViewportSizeFeature', () => {
    beforeEach(() => {
        _observeResize = vi.spyOn(agStack, '_observeResize').mockImplementation(() => () => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('registers the frame-coalesced schedulers, not the handlers underneath them', () => {
        (_observeResize as Mock).mockImplementation(() => vi.fn());

        const scheduleCenterViewportResize = vi.fn();
        const scheduleScrollVisibilityRefresh = vi.fn();
        const registerViewportResizeListener = vi.fn();

        const centerContainer = document.createElement('div');
        const centerViewport = document.createElement('div');

        const fakeFeature = createFakeFeature({
            centerContainer,
            centerViewport,
            registerViewportResizeListener,
            scheduleCenterViewportResize,
            scheduleScrollVisibilityRefresh,
        });

        (ViewportSizeFeature.prototype as unknown as { listenForResize: () => void }).listenForResize.call(fakeFeature);

        // A resize observer that calls the handler directly re-enters on its own writes.
        expect(registerViewportResizeListener).toHaveBeenCalledWith(scheduleCenterViewportResize);
        expect(_observeResize).toHaveBeenCalledWith(
            fakeFeature.beans,
            centerContainer,
            scheduleScrollVisibilityRefresh
        );
    });
});
