// ag-grid-enterprise v20.2.0
"use strict";
// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
Object.defineProperty(exports, "__esModule", { value: true });
function isPointInBBox(bbox, x, y) {
    return x >= bbox.x && x <= (bbox.x + bbox.width)
        && y >= bbox.y && y <= (bbox.y + bbox.height);
}
exports.isPointInBBox = isPointInBBox;
function renderBBox(ctx, bbox) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
    ctx.restore();
}
exports.renderBBox = renderBBox;
