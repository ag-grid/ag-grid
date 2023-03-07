import { Point } from './geometry';

export interface CreateDrawerParams {
    canvas: HTMLCanvasElement;
    backgroundColor?: string;
    width: number;
    height: number;
}

export type DrawPoint = (point: Point, radius?: number, color?: string) => void;

export interface Drawer {
    drawPoint: DrawPoint;
    clear: () => void;
}

const DEFAULT_COLOR = 'rgba(255,0,0,0.5)';

export function createDrawer({ canvas, backgroundColor, width, height }: CreateDrawerParams): Drawer | undefined {
    if (!canvas || !canvas.getContext) {
        console.error('Not a valid canvas:', canvas);
        return;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = DEFAULT_COLOR;

    // Fill background
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = DEFAULT_COLOR;
    }

    const drawPoint: DrawPoint = (point, radius = 5, color) => {
        const initialColor = ctx.fillStyle;
        if (color) {
            ctx.fillStyle = color;
        }
        const circle = new Path2D();
        circle.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill(circle);

        ctx.fillStyle = initialColor;
    };

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return {
        drawPoint,
        clear,
    };
}
