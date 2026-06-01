import { BasePopupService } from './basePopupService';

// Concrete subclass for testing
class TestPopupService extends BasePopupService<any, any, any, any, any, any> {
    protected getDefaultPopupParent(): HTMLElement {
        return document.body;
    }
    protected isStopPropagation(): boolean {
        return false;
    }
    public callPostProcessPopup(): void {
        // no-op for testing
    }
}

function createMockElement(
    rect?: Partial<DOMRect>,
    size?: { offsetWidth?: number; offsetHeight?: number; clientWidth?: number; clientHeight?: number }
): HTMLElement {
    const el = document.createElement('div');

    if (rect) {
        el.getBoundingClientRect = () =>
            ({
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                toJSON() {},
                ...rect,
            }) as DOMRect;
    }

    if (size) {
        if (size.offsetWidth !== undefined) {
            Object.defineProperty(el, 'offsetWidth', { value: size.offsetWidth });
        }
        if (size.offsetHeight !== undefined) {
            Object.defineProperty(el, 'offsetHeight', { value: size.offsetHeight });
        }
        if (size.clientWidth !== undefined) {
            Object.defineProperty(el, 'clientWidth', { value: size.clientWidth });
        }
        if (size.clientHeight !== undefined) {
            Object.defineProperty(el, 'clientHeight', { value: size.clientHeight });
        }
    }

    return el;
}

function createService(
    parentRect: { top: number; left: number; right: number; bottom: number },
    enableRtl = false
): TestPopupService {
    const svc = Object.create(TestPopupService.prototype) as TestPopupService;
    (svc as any).popupList = [];

    vi.spyOn(svc, 'getParentRect').mockReturnValue(parentRect);
    (svc as any).gos = {
        get: vi.fn((key: string) => (key === 'enableRtl' ? enableRtl : undefined)),
        getCallback: vi.fn(() => undefined),
    };

    return svc;
}

describe('BasePopupService', () => {
    // 800×600 parent at the viewport origin
    const parentRect = { top: 0, left: 0, right: 800, bottom: 600 };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('positionPopupByComponent', () => {
        /**
         * Calls positionPopupByComponent, captures the updatePosition callback
         * via a spy on positionPopup, and returns its result. This tests the
         * alignment-selection logic without DOM side-effects.
         */
        function getComponentPosition(params: {
            sourceRect: Partial<DOMRect>;
            popupWidth: number;
            popupHeight: number;
            position?: 'over' | 'under';
            alignSide?: 'left' | 'right';
            nudgeY?: number;
            parentRect?: { top: number; left: number; right: number; bottom: number };
        }): { x: number; y: number } {
            const pRect = params.parentRect ?? parentRect;
            const svc = createService(pRect);

            const eventSource = createMockElement(params.sourceRect);
            const ePopup = createMockElement({}, { offsetWidth: params.popupWidth, offsetHeight: params.popupHeight });

            const spy = vi.spyOn(svc, 'positionPopup').mockImplementation(() => {});

            svc.positionPopupByComponent({
                ePopup,
                eventSource,
                position: params.position ?? 'over',
                alignSide: params.alignSide ?? 'left',
                type: 'test',
                nudgeY: params.nudgeY,
            });

            return spy.mock.calls[0][0].updatePosition!();
        }

        // Reference source element: 100×40 at (300,200)
        const sourceRect = { top: 200, left: 300, right: 400, bottom: 240 };
        const popupWidth = 200;
        const popupHeight = 150;

        describe('position=over', () => {
            it('aligns top-left of popup to top-left of source (alignSide=left)', () => {
                const pos = getComponentPosition({
                    sourceRect,
                    popupWidth,
                    popupHeight,
                    position: 'over',
                    alignSide: 'left',
                });
                expect(pos).toEqual({ x: 300, y: 200 });
            });

            it('aligns top-right of popup to top-right of source (alignSide=right)', () => {
                const pos = getComponentPosition({
                    sourceRect,
                    popupWidth,
                    popupHeight,
                    position: 'over',
                    alignSide: 'right',
                });
                // tr-tr: x = source.right - popupWidth = 400 - 200
                expect(pos).toEqual({ x: 200, y: 200 });
            });
        });

        describe('position=under, enough space below', () => {
            it('places below source, left-aligned', () => {
                // spaceUnder = 600 - 240 = 360 > 150 → 'under'
                const pos = getComponentPosition({
                    sourceRect,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    alignSide: 'left',
                });
                // tl-bl: popup tl at source bl
                expect(pos).toEqual({ x: 300, y: 240 });
            });

            it('places below source, right-aligned', () => {
                const pos = getComponentPosition({
                    sourceRect,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    alignSide: 'right',
                });
                // tr-br: x = source.right - popupWidth = 200
                expect(pos).toEqual({ x: 200, y: 240 });
            });
        });

        describe('position=under, more space above', () => {
            // Source near the bottom edge
            const bottomSource = { top: 500, left: 300, right: 400, bottom: 540 };

            it('places above source, left-aligned', () => {
                // spaceUnder = 600 - 540 = 60 < 150
                // spaceAbove = 500 > 60 → 'above'
                const pos = getComponentPosition({
                    sourceRect: bottomSource,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    alignSide: 'left',
                });
                // bl-tl: y = source.top - popupHeight = 500 - 150
                expect(pos).toEqual({ x: 300, y: 350 });
            });

            it('places above source, right-aligned', () => {
                const pos = getComponentPosition({
                    sourceRect: bottomSource,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    alignSide: 'right',
                });
                // br-tr: x = source.right - popupWidth = 200
                expect(pos).toEqual({ x: 200, y: 350 });
            });

            it('deducts double nudgeY when placing above', () => {
                const pos = getComponentPosition({
                    sourceRect: bottomSource,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    alignSide: 'left',
                    nudgeY: 8,
                });
                // bl-tl y = 350, then y -= 8 * 2 → 334
                expect(pos.y).toBe(334);
            });
        });

        describe('shouldRenderUnderOrAbove edge cases', () => {
            it('prefers under when space below is sufficient', () => {
                const pos = getComponentPosition({
                    sourceRect,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                });
                expect(pos.y).toBe(240); // below source
            });

            it('prefers above when neither fits but above has more space', () => {
                // Parent 0-200, source 140-180
                // spaceUnder = 20, spaceAbove = 140, both < 150 but above > under
                const tinyParent = { top: 0, left: 0, right: 800, bottom: 200 };
                const lowSource = { top: 140, left: 300, right: 400, bottom: 180 };
                const pos = getComponentPosition({
                    sourceRect: lowSource,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    parentRect: tinyParent,
                });
                // bl-tl: y = 140 - 150 = -10 (raw; keepWithinBounds would clamp later)
                expect(pos.y).toBe(-10);
            });

            it('falls back to under when equal space above and below', () => {
                // Parent 0-200, source 80-120
                // spaceUnder = 80, spaceAbove = 80, both < 150, above !> under → 'under'
                const tinyParent = { top: 0, left: 0, right: 800, bottom: 200 };
                const midSource = { top: 80, left: 300, right: 400, bottom: 120 };
                const pos = getComponentPosition({
                    sourceRect: midSource,
                    popupWidth,
                    popupHeight,
                    position: 'under',
                    parentRect: tinyParent,
                });
                expect(pos.y).toBe(120); // under: y = source.bottom
            });
        });

        describe('with non-zero parent offset', () => {
            it('converts source coordinates to parent-relative before alignment', () => {
                const offsetParent = { top: 50, left: 100, right: 900, bottom: 650 };
                // Absolute source: (400,250)-(500,290)
                // Relative: (300,200)-(400,240) — same geometry as sourceRect
                const absoluteSource = { top: 250, left: 400, right: 500, bottom: 290 };

                const pos = getComponentPosition({
                    sourceRect: absoluteSource,
                    popupWidth,
                    popupHeight,
                    position: 'over',
                    alignSide: 'left',
                    parentRect: offsetParent,
                });
                expect(pos).toEqual({ x: 300, y: 200 });
            });
        });
    });

    describe('positionPopupForMenu', () => {
        function getMenuPosition(params: {
            sourceRect: Partial<DOMRect>;
            popupWidth: number;
            popupHeight: number;
            enableRtl?: boolean;
        }): { x: number; y: number } {
            const svc = createService(parentRect, params.enableRtl);

            const eventSource = createMockElement(params.sourceRect);
            const ePopup = createMockElement(
                {},
                {
                    offsetWidth: params.popupWidth,
                    offsetHeight: params.popupHeight,
                    clientWidth: params.popupWidth,
                    clientHeight: params.popupHeight,
                }
            );

            // keepXYWithinBounds is DOM-heavy; passthrough for y
            vi.spyOn(svc as any, 'keepXYWithinBounds').mockImplementation((_el: HTMLElement, pos: number) => pos);

            const spy = vi.spyOn(svc, 'positionPopup').mockImplementation(() => {});

            svc.positionPopupForMenu({ ePopup, eventSource });

            return spy.mock.calls[0][0].updatePosition!();
        }

        const sourceRect = { top: 200, left: 300, right: 400, bottom: 240 };

        describe('LTR', () => {
            it('places menu to the right of source with -2px offset', () => {
                // rightX = source.right - 2 = 398
                const pos = getMenuPosition({ sourceRect, popupWidth: 200, popupHeight: 300 });
                expect(pos.x).toBe(398);
            });

            it('falls back to left when right exceeds parent width', () => {
                const rightSource = { top: 200, left: 600, right: 700, bottom: 240 };
                // rightX = 698 > maxX (600) → leftX = 600 - 200 = 400
                const pos = getMenuPosition({ sourceRect: rightSource, popupWidth: 200, popupHeight: 300 });
                expect(pos.x).toBe(400);
            });

            it('clamps to 0 when both sides overflow', () => {
                const wideSource = { top: 200, left: 50, right: 750, bottom: 240 };
                // rightX = 748 > 600 → leftX = 50 - 200 = -150 < 0 → x = 0
                const pos = getMenuPosition({ sourceRect: wideSource, popupWidth: 200, popupHeight: 300 });
                expect(pos.x).toBe(0);
            });
        });

        describe('RTL', () => {
            it('places menu to the left of source', () => {
                // leftX = source.left - popupWidth = 300 - 200 = 100
                const pos = getMenuPosition({ sourceRect, popupWidth: 200, popupHeight: 300, enableRtl: true });
                expect(pos.x).toBe(100);
            });

            it('falls back to right when left goes negative', () => {
                const leftSource = { top: 200, left: 50, right: 150, bottom: 240 };
                // leftX = 50 - 200 = -150 < 0 → rightX = 150 - 2 = 148
                const pos = getMenuPosition({
                    sourceRect: leftSource,
                    popupWidth: 200,
                    popupHeight: 300,
                    enableRtl: true,
                });
                expect(pos.x).toBe(148);
            });

            it('clamps to 0 when both sides overflow', () => {
                const wideSource = { top: 200, left: 50, right: 750, bottom: 240 };
                // leftX = -150 < 0 → rightX = 748 > maxX (600) → x = 0
                const pos = getMenuPosition({
                    sourceRect: wideSource,
                    popupWidth: 200,
                    popupHeight: 300,
                    enableRtl: true,
                });
                expect(pos.x).toBe(0);
            });
        });

        it('uses relativeRect.top as the vertical position', () => {
            const pos = getMenuPosition({ sourceRect, popupWidth: 200, popupHeight: 300 });
            // y = relativeRect.top = 200 (parent at 0,0)
            expect(pos.y).toBe(200);
        });
    });
});
