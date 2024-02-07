import { MiniChartWithPolarAxes } from '../miniChartWithPolarAxes';
import { _Scene } from 'ag-charts-community';
import { ChartType } from '@ag-grid-community/core';

export class MiniSunburst extends MiniChartWithPolarAxes {
    static chartType: ChartType = 'sunburst';
    private readonly series: _Scene.Group[];

    // Hierarchical data using multidimensional array
    private data = [
        [
            [
                [[], [[]]],
                [[[]], []],
            ],
            [],
            [[]],
            [[]],
        ],
        [[[[[]], []]], [[]], []],
        [[], []],
    ];

    constructor(container: HTMLElement, fills: string[], strokes: string[]) {
        super(container, 'sunburstTooltip');

        this.showRadiusAxisLine = false;
        
        const { data, size, padding } = this;

        const radius = (size - padding * 2) / 2;
        const innerRadiusRatio = 0.3;

        const angleRange = [0, 2 * Math.PI];
        const angleExtent = Math.abs(angleRange[1] - angleRange[0]);

        const radiusRange = [radius * innerRadiusRatio, radius];
        const radiusExtent = Math.abs(radiusRange[1] - radiusRange[0]);
        
        let maxDepth = 0;
        const findMaxDepth = (data: any[], parentDepth: number) => {
            data.forEach((child) => {
                const depth = parentDepth + 1;
                maxDepth = Math.max(maxDepth, depth);
                findMaxDepth(child, depth);
            });
        };

        findMaxDepth(data, 0);

        const radiusRatio = radiusExtent / maxDepth;
        const center = this.size / 2;
        const startAngle = angleRange[0];
        
        this.series = [];

        const createSectors = (
            data: any[],
            depth: number,
            startAngle: number,
            availableAngle: number,
            group?: _Scene.Group
        ) => {
            const isArray = Array.isArray(data);

            if (!isArray) {
                return;
            }

            const childDepth = depth + 1;
            const children = data.length;
            const parts = (children * (children + 1)) / 2;

            let previousAngle = startAngle;

            data.forEach((child, childIndex) => {
                let childGroup = group;
                if (!childGroup) {
                    childGroup = new _Scene.Group();
                    this.series.push(childGroup);
                }

                const innerRadius = radiusRange[0] + depth * radiusRatio;
                const outerRadius = radiusRange[0] + childDepth * radiusRatio;

                const angleRatio = (children - childIndex) / parts;
                const start = previousAngle;
                const end = start + availableAngle * angleRatio;

                const sector = new _Scene.Sector();
                sector.centerX = center;
                sector.centerY = center;
                sector.innerRadius = innerRadius;
                sector.outerRadius = outerRadius;
                sector.startAngle = start;
                sector.endAngle = end;
                sector.stroke = undefined;
                sector.strokeWidth = 1;

                previousAngle = end;

                childGroup.append(sector);

                createSectors(child, childDepth, start, Math.abs(end - start), childGroup);
            });
        };

        createSectors(data, 0, startAngle, angleExtent);

        this.root.append(this.series);

        this.updateColors(fills, strokes);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.series.forEach((group, i) => {
            group.children?.forEach((sector: _Scene.Sector) => {
                sector.fill = fills[i % fills.length];
                sector.stroke = strokes[i % strokes.length];
            });
        });
    }
}
