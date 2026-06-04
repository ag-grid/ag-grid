/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AutoScrollService {
    private tickingInterval: number | null = null;

    private readonly scrollHorizontally: boolean;
    private readonly scrollVertically: boolean;

    private tickLeft: boolean;
    private tickRight: boolean;
    private tickUp: boolean;
    private tickDown: boolean;

    private readonly scrollContainer: HTMLElement;
    private readonly scrollByTick: number;

    private readonly getVerticalPosition: () => number;
    private readonly setVerticalPosition: (position: number) => void;

    private readonly getHorizontalPosition: () => number;
    private readonly setHorizontalPosition: (position: number) => void;

    private readonly shouldSkipVerticalScroll: () => boolean;
    private readonly shouldSkipHorizontalScroll: () => boolean;

    private readonly getTopOffset: () => number;
    private readonly getBottomOffset: () => number;

    private readonly onScrollCallback: (() => void) | null = null;

    private tickCount: number;

    /** True while auto-scrolling */
    public get scrolling(): boolean {
        return this.tickingInterval !== null;
    }

    constructor(params: {
        scrollContainer: HTMLElement;
        scrollAxis: 'x' | 'y' | 'xy';
        scrollByTick?: number;
        getVerticalPosition?: () => number;
        setVerticalPosition?: (position: number) => void;
        getHorizontalPosition?: () => number;
        setHorizontalPosition?: (position: number) => void;
        shouldSkipVerticalScroll?: () => boolean;
        shouldSkipHorizontalScroll?: () => boolean;
        // offset from the top of the scroll container to the start of the scrollable row area.
        getTopOffset?: () => number;
        // offset from the bottom of the scroll container to the end of the scrollable row area.
        getBottomOffset?: () => number;
        onScrollCallback?: () => void;
    }) {
        this.scrollContainer = params.scrollContainer;
        this.scrollHorizontally = params.scrollAxis.includes('x');
        this.scrollVertically = params.scrollAxis.includes('y');

        this.scrollByTick = params.scrollByTick ?? 20;

        if (params.onScrollCallback) {
            this.onScrollCallback = params.onScrollCallback;
        }

        if (this.scrollVertically) {
            this.getVerticalPosition = params.getVerticalPosition!;
            this.setVerticalPosition = params.setVerticalPosition!;
        }

        if (this.scrollHorizontally) {
            this.getHorizontalPosition = params.getHorizontalPosition!;
            this.setHorizontalPosition = params.setHorizontalPosition!;
        }

        this.shouldSkipVerticalScroll = params.shouldSkipVerticalScroll || (() => false);
        this.shouldSkipHorizontalScroll = params.shouldSkipHorizontalScroll || (() => false);
        this.getTopOffset = params.getTopOffset || (() => 0);
        this.getBottomOffset = params.getBottomOffset || (() => 0);
    }

    public check(mouseEvent: MouseEvent | Touch, forceSkipVerticalScroll: boolean = false): void {
        const skipVerticalScroll = !this.scrollVertically || forceSkipVerticalScroll || this.shouldSkipVerticalScroll();
        const skipHorizontalScroll = !this.scrollHorizontally || this.shouldSkipHorizontalScroll();

        if (skipVerticalScroll && skipHorizontalScroll) {
            return;
        }

        const rect = this.scrollContainer.getBoundingClientRect();
        const scrollTick = this.scrollByTick;
        const topOffset = this.getTopOffset();
        const bottomOffset = this.getBottomOffset();

        this.tickLeft = !skipHorizontalScroll && mouseEvent.clientX < rect.left + scrollTick;
        this.tickRight = !skipHorizontalScroll && mouseEvent.clientX > rect.right - scrollTick;
        this.tickUp = !skipVerticalScroll && mouseEvent.clientY < rect.top + topOffset + scrollTick;
        this.tickDown = !skipVerticalScroll && mouseEvent.clientY > rect.bottom - bottomOffset - scrollTick;

        if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
            this.ensureTickingStarted();
        } else {
            this.ensureCleared();
        }
    }

    private ensureTickingStarted(): void {
        if (this.tickingInterval === null) {
            this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    }

    private doTick(): void {
        this.tickCount++;

        const tickAmount = this.tickCount > 20 ? 200 : this.tickCount > 10 ? 80 : 40;

        if (this.scrollVertically) {
            const vScrollPosition = this.getVerticalPosition();
            if (this.tickUp) {
                this.setVerticalPosition(vScrollPosition - tickAmount);
            }

            if (this.tickDown) {
                this.setVerticalPosition(vScrollPosition + tickAmount);
            }
        }

        if (this.scrollHorizontally) {
            const hScrollPosition = this.getHorizontalPosition();
            if (this.tickLeft) {
                this.setHorizontalPosition(hScrollPosition - tickAmount);
            }

            if (this.tickRight) {
                this.setHorizontalPosition(hScrollPosition + tickAmount);
            }
        }

        if (this.onScrollCallback) {
            this.onScrollCallback();
        }
    }

    public ensureCleared(): void {
        if (this.tickingInterval) {
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    }
}
