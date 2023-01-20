import { cubicSegmentIntersections, segmentIntersection } from './intersection';

export class Path2D {
    // The methods of this class will likely be called many times per animation frame,
    // and any allocation can trigger a GC cycle during animation, so we attempt
    // to minimize the number of allocations.

    private xy?: [number, number];
    private previousCommands: string[] = [];
    private previousParams: number[] = [];
    private previousClosedPath: boolean = false;
    commands: string[] = [];
    params: number[] = [];

    isDirty() {
        if (this._closedPath !== this.previousClosedPath) {
            return true;
        }
        if (this.previousCommands.length !== this.commands.length) {
            return true;
        }
        if (this.previousParams.length !== this.params.length) {
            return true;
        }

        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i] !== this.previousCommands[i]) {
                return true;
            }
        }

        for (let i = 0; i < this.params.length; i++) {
            if (this.params[i] !== this.previousParams[i]) {
                return true;
            }
        }

        return false;
    }

    draw(ctx: CanvasDrawPath & CanvasPath) {
        const commands = this.commands;
        const params = this.params;
        let j = 0;

        ctx.beginPath();
        for (const command of commands) {
            switch (command) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                    break;
                case 'A':
                    ctx.arc(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++] === 1);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }

        if (commands.length === 0) {
            ctx.closePath();
        }
    }

    moveTo(x: number, y: number) {
        if (this.xy) {
            this.xy[0] = x;
            this.xy[1] = y;
        } else {
            this.xy = [x, y];
        }

        this.commands.push('M');
        this.params.push(x, y);
    }

    lineTo(x: number, y: number) {
        if (this.xy) {
            this.commands.push('L');
            this.params.push(x, y);
            this.xy[0] = x;
            this.xy[1] = y;
        } else {
            this.moveTo(x, y);
        }
    }

    rect(x: number, y: number, width: number, height: number) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
    }

    arc(x: number, y: number, r: number, sAngle: number, eAngle: number, antiClockwise = false) {
        const endX = x + r * Math.cos(eAngle);
        const endY = y + r * Math.sin(eAngle);

        if (this.xy) {
            this.xy[0] = endX;
            this.xy[1] = endY;
        } else {
            this.xy = [endX, endY];
        }

        this.commands.push('A');
        this.params.push(x, y, r, sAngle, eAngle, antiClockwise ? 1 : 0);
    }

    cubicCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push('C');
        this.params.push(cx1, cy1, cx2, cy2, x, y);
        this.xy![0] = x;
        this.xy![1] = y;
    }

    private _closedPath: boolean = false;
    get closedPath(): boolean {
        return this._closedPath;
    }

    closePath() {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    }

    clear({ trackChanges } = { trackChanges: false }) {
        if (trackChanges) {
            this.previousCommands = this.commands;
            this.previousParams = this.params;
            this.previousClosedPath = this._closedPath;
            this.commands = [];
            this.params = [];
        } else {
            this.commands.length = 0;
            this.params.length = 0;
        }
        this.xy = undefined;
        this._closedPath = false;
    }

    isPointInPath(x: number, y: number): boolean {
        const commands = this.commands;
        const params = this.params;
        const cn = commands.length;
        // Hit testing using ray casting method, where the ray's origin is some point
        // outside the path. In this case, an offscreen point that is remote enough, so that
        // even if the path itself is large and is partially offscreen, the ray's origin
        // will likely be outside the path anyway. To test if the given point is inside the
        // path or not, we cast a ray from the origin to the given point and check the number
        // of intersections of this segment with the path. If the number of intersections is
        // even, then the ray both entered and exited the path an equal number of times,
        // therefore the point is outside the path, and inside the path, if the number of
        // intersections is odd. Since the path is compound, we check if the ray segment
        // intersects with each of the path's segments, which can be either a line segment
        // (one or no intersection points) or a Bézier curve segment (up to 3 intersection
        // points).
        const ox = -10000;
        const oy = -10000;
        // the starting point of the  current path
        let sx: number = NaN;
        let sy: number = NaN;
        // the previous point of the current path
        let px = 0;
        let py = 0;
        let intersectionCount = 0;

        for (let ci = 0, pi = 0; ci < cn; ci++) {
            switch (commands[ci]) {
                case 'M':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    px = params[pi++];
                    sx = px;
                    py = params[pi++];
                    sy = py;
                    break;
                case 'L':
                    if (segmentIntersection(px, py, params[pi++], params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case 'C':
                    intersectionCount += cubicSegmentIntersections(
                        px,
                        py,
                        params[pi++],
                        params[pi++],
                        params[pi++],
                        params[pi++],
                        params[pi++],
                        params[pi++],
                        ox,
                        oy,
                        x,
                        y
                    ).length;
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case 'Z':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    break;
            }
        }

        return intersectionCount % 2 === 1;
    }
}
