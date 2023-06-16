import { _ModuleSupport, _Scale, _Scene, _Util } from 'ag-charts-community';

const { ChartAxisDirection } = _ModuleSupport;
const { BandScale } = _Scale;
const { isNumberEqual } = _Util;

export class AngleCategoryAxis extends _ModuleSupport.PolarAxis {
    static className = 'AngleCategoryAxis';
    static type = 'polar-angle-category' as const;

    constructor(moduleCtx: _ModuleSupport.ModuleContext) {
        super(moduleCtx, new BandScale());
    }

    get direction() {
        return ChartAxisDirection.X;
    }

    update() {
        this.updateScale();
        const ticks = this.scale.domain;
        this.updatePosition();
        this.updateGridLines();
        this.updateTickLines();
        this.updateLabels();
        return ticks.length;
    }

    updatePosition() {
        const { translation, axisGroup, gridGroup } = this;
        const translationX = Math.floor(translation.x);
        const translationY = Math.floor(translation.y);

        axisGroup.translationX = translationX;
        axisGroup.translationY = translationY;

        gridGroup.translationX = translationX;
        gridGroup.translationY = translationY;
    }

    protected updateGridLines() {
        const { scale, gridLength: radius, gridStyle, tick } = this;
        if (!(gridStyle && radius > 0)) {
            return;
        }

        const ticks = scale.ticks?.() ?? [];
        this.gridLineGroupSelection.update(ticks).each((line, value, index) => {
            const style = gridStyle[index % gridStyle.length];
            const angle = scale.convert(value);
            line.x1 = 0;
            line.y1 = 0;
            line.x2 = radius * Math.cos(angle);
            line.y2 = radius * Math.sin(angle);
            line.stroke = style.stroke;
            line.strokeWidth = tick.width;
            line.lineDash = style.lineDash;
            line.fill = undefined;
        });
    }

    protected updateLabels() {
        const { label, tickLabelGroupSelection, scale, gridLength: radius, tick } = this;

        const ticks = scale.ticks?.() || [];
        tickLabelGroupSelection.update(ticks).each((node, value) => {
            node.setFont(label);
            node.fill = label.color;
            node.text = String(value);

            const distance = radius + label.padding + tick.size;
            const angle = scale.convert(value);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            node.x = distance * cos;
            node.y = distance * sin;
            node.textAlign = isNumberEqual(cos, 0) ? 'center' : cos > 0 ? 'left' : 'right';
            node.textBaseline = isNumberEqual(sin, 0) ? 'middle' : sin > 0 ? 'top' : 'bottom';
        });
    }

    protected updateTickLines() {
        const { scale, gridLength: radius, tick, tickLineGroupSelection } = this;

        const ticks = scale.ticks?.() || [];
        tickLineGroupSelection.update(ticks).each((line, value) => {
            const angle = scale.convert(value);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            line.x1 = radius * cos;
            line.y1 = radius * sin;
            line.x2 = (radius + tick.size) * cos;
            line.y2 = (radius + tick.size) * sin;
            line.stroke = tick.color;
            line.strokeWidth = tick.width;
        });
    }

    computeLabelsBBox() {
        const { label, gridLength: radius, scale, tick } = this;
        if (!label.enabled) {
            return null;
        }

        const ticks = scale.ticks?.() || [];
        if (ticks.length === 0) {
            return null;
        }

        const tempText = new _Scene.Text();
        const textBoxes = ticks.map((value) => {
            const distance = radius + label.padding + tick.size;
            const angle = scale.convert(value);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            tempText.text = String(value);
            tempText.x = distance * cos;
            tempText.y = distance * sin;
            tempText.setFont(label);
            tempText.textAlign = isNumberEqual(cos, 0) ? 'center' : cos > 0 ? 'left' : 'right';
            tempText.textBaseline = isNumberEqual(sin, 0) ? 'middle' : sin > 0 ? 'top' : 'bottom';

            return tempText.computeBBox();
        });

        return _Scene.BBox.merge(textBoxes);
    }
}
