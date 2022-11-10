import { MiniChart } from "../miniChart";
import { _Scene } from "ag-charts-community";
import { ChartType } from "@ag-grid-community/core";

const toRadians = _Scene.toRadians;
export class MiniDoughnut extends MiniChart {

    static chartType: ChartType = 'doughnut';
    private readonly sectors: _Scene.Sector[];

    constructor(container: HTMLElement, fills: string[], strokes: string[], centerRadiusScaler = 0.6, tooltipName = "doughnutTooltip") {
        super(container, tooltipName);

        const radius = (this.size - this.padding * 2) / 2;
        const center = radius + this.padding;
        const angles = [
            [toRadians(-90), toRadians(30)],
            [toRadians(30), toRadians(120)],
            [toRadians(120), toRadians(180)],
            [toRadians(180), toRadians(210)],
            [toRadians(210), toRadians(240)],
            [toRadians(240), toRadians(270)]
        ];

        this.sectors = angles.map(([startAngle, endAngle]) => {
            const sector = new _Scene.Sector();
            sector.centerX = center;
            sector.centerY = center;
            sector.innerRadius = radius * centerRadiusScaler;
            sector.outerRadius = radius;
            sector.startAngle = startAngle;
            sector.endAngle = endAngle;
            sector.stroke = undefined;
            sector.strokeWidth = 1;
            return sector;
        });

        this.updateColors(fills, strokes);
        this.root.append(this.sectors);
    }

    updateColors(fills: string[], strokes: string[]) {
        this.sectors.forEach((sector, i) => {
            sector.fill = fills[i % fills.length];
            sector.stroke = strokes[i % strokes.length];
        });
    }
}
