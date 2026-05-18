import { CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl } from './gridBodyCtrl';

function createCtrl(alwaysShowVerticalScroll: boolean) {
    const setAlwaysVerticalScrollClass = vi.fn();

    const ctrl = {
        gos: {
            get: (key: string) => (key === 'alwaysShowVerticalScroll' ? alwaysShowVerticalScroll : undefined),
        },
        comp: {
            setAlwaysVerticalScrollClass,
        },
    } as unknown as GridBodyCtrl;

    return { ctrl, setAlwaysVerticalScrollClass };
}

describe('GridBodyCtrl', () => {
    test('adds the forced vertical scroll class when alwaysShowVerticalScroll is enabled', () => {
        const { ctrl, setAlwaysVerticalScrollClass } = createCtrl(true);

        (
            GridBodyCtrl.prototype as unknown as {
                syncAlwaysVerticalScrollClass: () => void;
            }
        ).syncAlwaysVerticalScrollClass.call(ctrl);

        expect(setAlwaysVerticalScrollClass).toHaveBeenCalledWith(CSS_CLASS_FORCE_VERTICAL_SCROLL, true);
    });

    test('removes the forced vertical scroll class when alwaysShowVerticalScroll is disabled', () => {
        const { ctrl, setAlwaysVerticalScrollClass } = createCtrl(false);

        (
            GridBodyCtrl.prototype as unknown as {
                syncAlwaysVerticalScrollClass: () => void;
            }
        ).syncAlwaysVerticalScrollClass.call(ctrl);

        expect(setAlwaysVerticalScrollClass).toHaveBeenCalledWith(CSS_CLASS_FORCE_VERTICAL_SCROLL, false);
    });
});
