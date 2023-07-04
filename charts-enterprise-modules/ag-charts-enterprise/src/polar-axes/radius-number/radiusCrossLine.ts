import { _ModuleSupport, _Scale, _Scene, _Util } from 'ag-charts-community';
import { PolarCrossLine } from '../polarCrossLine';

const { ChartAxisDirection } = _ModuleSupport;
const { Path, Sector } = _Scene;

export class RadiusCrossLine extends PolarCrossLine {
    static className = 'RadiusCrossLine';

    direction: _ModuleSupport.ChartAxisDirection = ChartAxisDirection.Y;
    gridAngles?: number[];

    private polygonNode = new Path();
    private sectorNode = new Sector();

    constructor() {
        super();

        this.group.append(this.polygonNode);
        this.group.append(this.sectorNode);
    }

    update(visible: boolean) {
        this.updatePolygonNode(visible);
        this.updateSectorNode(visible);
        this.group.translationY = this.getRadius();
        this.group.zIndex =
            this.type === 'line' ? RadiusCrossLine.LINE_LAYER_ZINDEX : RadiusCrossLine.RANGE_LAYER_ZINDEX;
    }

    private colorizeNode(node: _Scene.Path) {
        if (this.type === 'range') {
            node.fill = this.fill;
            node.fillOpacity = this.fillOpacity ?? 1;
        } else {
            node.fill = undefined;
        }
        node.stroke = this.stroke;
        node.strokeOpacity = this.strokeOpacity ?? 1;
        node.strokeWidth = this.strokeWidth ?? 1;
    }

    private getRadius() {
        return this.scale?.range[0] ?? 0;
    }

    private getRadii() {
        const { range, scale, type } = this;
        const radius = this.getRadius();
        const outerRadius = radius - scale!.convert(type === 'line' ? this.value : Math.max(...range!));
        const innerRadius = radius - (type === 'line' ? 0 : scale!.convert(Math.min(...range!)));
        return { innerRadius, outerRadius };
    }

    private drawPolygon(radius: number, angles: number[], polygon: _Scene.Path) {
        angles.forEach((angle, index) => {
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (index === 0) {
                polygon.path.moveTo(x, y);
            } else {
                polygon.path.lineTo(x, y);
            }
        });
        polygon.path.closePath();
    }

    private updatePolygonNode(visible: boolean) {
        const { gridAngles, polygonNode: polygon, range, scale, shape, type } = this;
        if (!visible || shape !== 'polygon' || !scale || !gridAngles || (type === 'range' && !range)) {
            polygon.visible = false;
            return;
        }

        const { innerRadius, outerRadius } = this.getRadii();

        polygon.visible = true;

        polygon.path.clear({ trackChanges: true });
        this.drawPolygon(outerRadius, gridAngles, polygon);

        if (type === 'range') {
            const reversedAngles = gridAngles.slice().reverse();
            this.drawPolygon(innerRadius!, reversedAngles, polygon);
        }

        this.colorizeNode(polygon);
    }

    private updateSectorNode(visible: boolean) {
        const { gridAngles, range, scale, sectorNode: sector, shape, type } = this;
        if (!visible || shape !== 'circle' || !scale || !gridAngles || (type === 'range' && !range)) {
            sector.visible = false;
            return;
        }

        const { innerRadius, outerRadius } = this.getRadii();

        sector.visible = true;

        sector.startAngle = 0;
        sector.endAngle = 2 * Math.PI;

        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;

        this.colorizeNode(sector);
    }
}
