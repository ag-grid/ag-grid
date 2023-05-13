"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layers = void 0;
/**
 * Constants to declare the expected nominal zIndex for all types of layer in chart rendering.
 */
var Layers;
(function (Layers) {
    Layers[Layers["SERIES_BACKGROUND_ZINDEX"] = -10] = "SERIES_BACKGROUND_ZINDEX";
    Layers[Layers["AXIS_GRID_ZINDEX"] = 0] = "AXIS_GRID_ZINDEX";
    Layers[Layers["AXIS_ZINDEX"] = 20] = "AXIS_ZINDEX";
    Layers[Layers["SERIES_CROSSLINE_RANGE_ZINDEX"] = 30] = "SERIES_CROSSLINE_RANGE_ZINDEX";
    Layers[Layers["SERIES_LAYER_ZINDEX"] = 500] = "SERIES_LAYER_ZINDEX";
    Layers[Layers["SERIES_CROSSHAIR_ZINDEX"] = 1000] = "SERIES_CROSSHAIR_ZINDEX";
    Layers[Layers["SERIES_LABEL_ZINDEX"] = 1500] = "SERIES_LABEL_ZINDEX";
    Layers[Layers["SERIES_CROSSLINE_LINE_ZINDEX"] = 2500] = "SERIES_CROSSLINE_LINE_ZINDEX";
    Layers[Layers["LEGEND_ZINDEX"] = 3000] = "LEGEND_ZINDEX";
})(Layers = exports.Layers || (exports.Layers = {}));
//# sourceMappingURL=layers.js.map