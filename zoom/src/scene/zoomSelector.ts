import { _ModuleSupport, _Scene } from 'ag-charts-community';
import { ZoomRect } from './zoomRect';

export type ZoomCoords = { x1: number; y1: number; x2: number; y2: number };

export class ZoomSelector extends _Scene.Group {
    static className = 'Zoom';

    private coords?: ZoomCoords;
    private rect = new ZoomRect();

    onSelectionChange: (coords: ZoomCoords) => void;

    constructor(onSelectionChange: (coords: ZoomCoords) => void) {
        super({ name: 'zoomSelectorGroup' });

        this.isContainerNode = true;
        this.onSelectionChange = onSelectionChange;

        this.rect.visible = false;
    }

    update(x: number, y: number): void {
        this.updateCoords(x, y);
        this.updateRect();
    }

    stop(): void {
        if (this.coords) {
            this.updateRect();
            this.onSelectionChange(this.coords);
        }

        this.resetCoords();
    }

    reset(): void {
        this.resetCoords();
    }

    render(renderCtx: _Scene.RenderContext) {
        const { ctx, stats } = renderCtx;

        if (this.rect) {
            // ctx.save();
            this.rect.render({ ...renderCtx, ctx });
            // ctx.restore();
        }

        if (stats) stats.nodesRendered++;
    }

    private updateCoords(x: number, y: number): void {
        if (!this.coords) {
            this.coords = { x1: x, y1: y, x2: x, y2: y };
        } else {
            this.coords.x2 = x;
            this.coords.y2 = y;
        }
    }

    private updateRect(): void {
        const bbox = this.getBBox();

        this.rect.x = bbox.x;
        this.rect.y = bbox.y;
        this.rect.width = bbox.width;
        this.rect.height = bbox.height;

        this.markDirty(this, _Scene.RedrawType.MAJOR);
    }

    private resetCoords(): void {
        this.coords = undefined;
    }

    private getBBox(): _Scene.BBox {
        const x1 = this.coords?.x1 ?? 0;
        const y1 = this.coords?.y1 ?? 0;
        const x2 = this.coords?.x2 ?? 0;
        const y2 = this.coords?.y2 ?? 0;

        // Ensure we create a bounding box starting at the top left corner
        const x = x1 <= x2 ? x1 : x2;
        const y = y1 <= y2 ? y1 : y2;
        const width = x1 <= x2 ? x2 - x1 : x1 - x2;
        const height = y1 <= y2 ? y2 - y1 : y1 - y2;

        return new _Scene.BBox(x, y, width, height);
    }
}
