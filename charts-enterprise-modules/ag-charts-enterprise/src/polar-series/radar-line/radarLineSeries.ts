import { RadarSeries } from '../radar/radarSeries';

export class RadarLineSeries extends RadarSeries {
    static className = 'RadarLineSeries';
    static type = 'radar-line' as const;

    protected updatePathSelections() {
        this.lineSelection.update(this.visible ? [true] : []);
    }
}
