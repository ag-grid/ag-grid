import { _ModuleSupport, _Scene } from 'ag-charts-community';

export class ZoomRect extends _Scene.Rect {
    static className = 'ZoomRect';

    // @_ModuleSupport.Validate(COLOR_STRING)
    public fill = '#999999';

    // @_ModuleSupport.Validate(NUMBER(0, 1))
    public fillOpacity = 0.2;
}
