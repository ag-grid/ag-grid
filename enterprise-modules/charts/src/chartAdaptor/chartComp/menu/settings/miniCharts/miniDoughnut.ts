import {ChartType} from "@ag-grid-community/core";
import {MiniChart} from "./miniChart";
import {Sector, toRadians} from "ag-charts-community";

export class MiniDoughnut extends MiniChart {
    static chartType = ChartType.Doughnut;

    private readonly sectors: Sector[];

    constructor(parent: HTMLElement, fills: string[], strokes: string[], centerRadiusScaler = 0.6, tooltipName = "doughnutTooltip") {
        super(parent, tooltipName);

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
            const sector = new Sector();
            sector.centerX = center;
            sector.centerY = center;
            sector.innerRadius = radius * centerRadiusScaler;
            sector.outerRadius = radius;
            sector.startAngle = startAngle;
            sector.endAngle = endAngle;
            sector.stroke = undefined;
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
