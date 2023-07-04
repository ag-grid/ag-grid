import { _ModuleSupport, _Scale, _Scene, _Util } from 'ag-charts-community';
import { PolarCrossLine } from '../polarCrossLine';

const { ChartAxisDirection } = _ModuleSupport;
const { Path, Sector } = _Scene;

export class AngleCrossLine extends PolarCrossLine {
    static className = 'AngleCrossLine';

    direction: _ModuleSupport.ChartAxisDirection = ChartAxisDirection.X;

    private polygonNode = new Path();
    private sectorNode = new Sector();
    private lineNode = new Path();

    constructor() {
        super();

        this.group.append(this.polygonNode);
        this.group.append(this.sectorNode);
        this.group.append(this.lineNode);
    }

    update(visible: boolean) {
        this.updateLineNode(visible);
        this.updatePolygonNode(visible);
        this.updateSectorNode(visible);
    }

    private updateLineNode(visible: boolean) {
        const { scale, shape, type, value, lineNode: line } = this;
        let angle: number;
        if (!visible || type !== 'line' || shape !== 'polygon' || !scale || isNaN((angle = scale.convert(value)))) {
            line.visible = false;
            return;
        }

        const radius = this.gridLength;

        line.visible = true;
        line.stroke = this.stroke;
        line.strokeOpacity = this.strokeOpacity ?? 1;
        line.strokeWidth = this.strokeWidth ?? 1;
        line.fill = undefined;
        line.lineDash = this.lineDash;

        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        line.path.clear({ trackChanges: true });
        line.path.moveTo(0, 0);
        line.path.lineTo(x, y);

        this.group.zIndex = AngleCrossLine.LINE_LAYER_ZINDEX;
    }

    private updateFill(area: _Scene.Path | _Scene.Sector) {
        area.fill = this.fill;
        area.fillOpacity = this.fillOpacity ?? 1;
        area.stroke = this.stroke;
        area.strokeOpacity = this.strokeOpacity ?? 1;
        area.strokeWidth = this.strokeWidth ?? 1;
    }

    private updatePolygonNode(visible: boolean) {
        const { polygonNode: polygon, range, scale, shape, type } = this;
        let ticks: any[] | undefined;
        if (!visible || type !== 'range' || shape !== 'polygon' || !scale || !range || !(ticks = scale.ticks?.())) {
            polygon.visible = false;
            return;
        }

        const radius = this.gridLength;
        const startIndex = ticks.indexOf(range[0]);
        const endIndex = ticks.indexOf(range[1]);
        const stops =
            startIndex <= endIndex
                ? ticks.slice(startIndex, endIndex + 1)
                : ticks.slice(startIndex).concat(ticks.slice(0, endIndex + 1));
        const angles = stops.map((value) => scale.convert(value));

        polygon.visible = true;
        this.updateFill(polygon);

        polygon.path.clear({ trackChanges: true });
        polygon.path.moveTo(0, 0);
        angles.forEach((angle) => {
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            polygon.path.lineTo(x, y);
        });
        polygon.path.closePath();

        this.group.zIndex = AngleCrossLine.RANGE_LAYER_ZINDEX;
    }

    private updateSectorNode(visible: boolean) {
        const { sectorNode: sector, range, scale, shape, type } = this;
        if (!visible || type !== 'range' || shape !== 'circle' || !scale || !range) {
            sector.visible = false;
            return;
        }

        const radius = this.gridLength;
        const angles = range.map((value) => scale.convert(value));

        sector.visible = true;
        this.updateFill(sector);

        sector.centerX = 0;
        sector.centerY = 0;
        sector.innerRadius = 0;
        sector.outerRadius = radius;
        sector.startAngle = angles[0];
        sector.endAngle = angles[1];

        this.group.zIndex = AngleCrossLine.RANGE_LAYER_ZINDEX;
    }
}
