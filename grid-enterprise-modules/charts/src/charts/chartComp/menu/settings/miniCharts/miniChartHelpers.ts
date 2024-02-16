import { _Scene } from 'ag-charts-community';

export interface CreateColumnRectsParams {
    stacked: boolean;
    root: _Scene.Group;
    data: any;
    size: number;
    padding: number;
    xScaleDomain: number[];
    yScaleDomain: number[];
    xScalePadding: number;
}

export function createColumnRects(params: CreateColumnRectsParams) {
    const { stacked, size, padding, xScalePadding, xScaleDomain, yScaleDomain } = params;

    const xScale = new _Scene.BandScale<number>();
    xScale.domain = xScaleDomain;
    xScale.range = [padding, size - padding];
    xScale.paddingInner = xScalePadding;
    xScale.paddingOuter = xScalePadding;

    const yScale = new _Scene.LinearScale();
    yScale.domain = yScaleDomain;
    yScale.range = [size - padding, padding];

    const createBars = (series: number[], xScale: _Scene.BandScale<number>, yScale: _Scene.LinearScale) => {
        return series.map((datum: number, i: number) => {
            const top = yScale.convert(datum);
            const rect = new _Scene.Rect();
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = xScale.bandwidth;
            rect.height = yScale.convert(0) - top;
            rect.strokeWidth = 0;
            rect.crisp = true;

            return rect;
        });
    };

    if (stacked) {
        return params.data.map((d: number[]) => createBars(d, xScale, yScale));
    }

    return createBars(params.data, xScale, yScale);
}

export function createLinePaths(root: _Scene.Group, data: number[][], size: number, padding: number): _Scene.Path[] {
    const xScale = new _Scene.LinearScale();
    xScale.domain = [0, 4];
    xScale.range = [padding, size - padding];

    const yScale = new _Scene.LinearScale();
    yScale.domain = [0, 10];
    yScale.range = [size - padding, padding];

    const lines: _Scene.Path[] = data.map((series) => {
        const line = new _Scene.Path();
        line.strokeWidth = 3;
        line.lineCap = 'round';
        line.fill = undefined;
        series.forEach((datum: number, i: number) => {
            line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
        });

        return line;
    });

    const linesGroup = new _Scene.Group();
    linesGroup.setClipRectInGroupCoordinateSpace(
        new _Scene.BBox(padding, padding, size - padding * 2, size - padding * 2)
    );
    linesGroup.append(lines);
    root.append(linesGroup);

    return lines;
}

export function createPolarPaths(
    root: _Scene.Group,
    data: number[][],
    size: number,
    radius: number,
    innerRadius: number,
    markerSize: number = 0
): { paths: _Scene.Path[]; markers: _Scene.Circle[] } {
    const angleScale = new _Scene.LinearScale();
    angleScale.domain = [0, 7];
    angleScale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);

    const radiusScale = new _Scene.LinearScale();
    radiusScale.domain = [0, 10];
    radiusScale.range = [radius, innerRadius];

    const markers: _Scene.Circle[] = [];

    const paths: _Scene.Path[] = data.map((series) => {
        const path = new _Scene.Path();
        path.strokeWidth = 1;
        path.strokeOpacity = 0.5;
        path.lineCap = 'round';
        path.fill = undefined;
        path.fillOpacity = 0.8;
        series.forEach((datum: number, i: number) => {
            const angle = angleScale.convert(i);
            const r = radius + innerRadius - radiusScale.convert(datum);

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            path.path[i > 0 ? 'lineTo' : 'moveTo'](x, y);

            if (markerSize > 0) {
                const marker = new _Scene.Circle();
                marker.x = x;
                marker.y = y;
                marker.size = markerSize;
                markers.push(marker);
            }
        });

        path.path.closePath();
        return path;
    });

    const group = new _Scene.Group();

    const center = size / 2;
    group.translationX = center;
    group.translationY = center;

    group.append([...paths, ...markers]);
    root.append(group);

    return { paths, markers };
}

export function accumulateData(data: number[][]): { processedData: number[][]; min: number; max: number } {
    let [min, max] = [Infinity, -Infinity];
    const processedData = data.reduce((acc, curr, currIndex) => {
        const previous = currIndex > 0 ? acc[currIndex - 1] : undefined;
        acc[currIndex] ??= [];
        const current = acc[currIndex];
        curr.forEach((datum, datumIndex) => {
            if (previous) {
                datum += previous[datumIndex];
            }

            current[datumIndex] = datum;

            if (current[datumIndex] < min) {
                min = current[datumIndex];
            }

            if (current[datumIndex] > max) {
                max = current[datumIndex];
            }
        });
        return acc;
    }, [] as number[][]);

    return { processedData, min, max };
}
