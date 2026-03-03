import { CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl } from './gridBodyCtrl';

type TestParams = {
    alwaysShowVerticalScroll?: boolean;
    domLayout?: 'normal' | 'autoHeight' | 'print';
    bodyViewportHeight?: number;
    rowContainerHeight?: number | null;
};

function createCtrl(params: TestParams = {}) {
    const setAlwaysVerticalScrollClass = jest.fn();
    const {
        alwaysShowVerticalScroll = false,
        domLayout = 'normal',
        bodyViewportHeight = 500,
        rowContainerHeight = 0,
    } = params;

    const ctrl = {
        gos: {
            get: (key: string) => {
                if (key === 'alwaysShowVerticalScroll') {
                    return alwaysShowVerticalScroll;
                }
                if (key === 'domLayout') {
                    return domLayout;
                }
                return undefined;
            },
        },
        comp: {
            setAlwaysVerticalScrollClass,
        },
        eGridViewport: {
            clientHeight: bodyViewportHeight,
        },
        getBodyViewportHeight: () => bodyViewportHeight,
        beans: {
            rowContainerHeight: {
                uiContainerHeight: rowContainerHeight,
            },
        },
    } as unknown as GridBodyCtrl;

    return { ctrl, setAlwaysVerticalScrollClass };
}

describe('GridBodyCtrl', () => {
    test('shows vertical scrollbar when alwaysShowVerticalScroll is enabled', () => {
        const { ctrl, setAlwaysVerticalScrollClass } = createCtrl({ alwaysShowVerticalScroll: true });

        const result = (
            GridBodyCtrl.prototype as unknown as { isVerticalScrollShowing: () => boolean }
        ).isVerticalScrollShowing.call(ctrl);

        expect(result).toBe(true);
        expect(setAlwaysVerticalScrollClass).toHaveBeenCalledWith(CSS_CLASS_FORCE_VERTICAL_SCROLL, true);
    });

    test('hides vertical scrollbar when row container fits body viewport', () => {
        const { ctrl, setAlwaysVerticalScrollClass } = createCtrl({
            bodyViewportHeight: 500,
            rowContainerHeight: 1,
        });

        const result = (
            GridBodyCtrl.prototype as unknown as { isVerticalScrollShowing: () => boolean }
        ).isVerticalScrollShowing.call(ctrl);

        expect(result).toBe(false);
        expect(setAlwaysVerticalScrollClass).toHaveBeenCalledWith(null, false);
    });

    test('shows vertical scrollbar when row container exceeds body viewport', () => {
        const { ctrl } = createCtrl({
            bodyViewportHeight: 500,
            rowContainerHeight: 900,
        });

        const result = (
            GridBodyCtrl.prototype as unknown as { isVerticalScrollShowing: () => boolean }
        ).isVerticalScrollShowing.call(ctrl);

        expect(result).toBe(true);
    });

    test('hides vertical scrollbar when domLayout is not normal', () => {
        const { ctrl } = createCtrl({
            domLayout: 'autoHeight',
            bodyViewportHeight: 500,
            rowContainerHeight: 900,
        });

        const result = (
            GridBodyCtrl.prototype as unknown as { isVerticalScrollShowing: () => boolean }
        ).isVerticalScrollShowing.call(ctrl);

        expect(result).toBe(false);
    });
});
