/**
 * `True` if the event is close to the original event by X pixels either vertically or horizontally.
 * we only start dragging after X pixels so this allows us to know if we should start dragging yet.
 * @param {MouseEvent | TouchEvent} e1
 * @param {MouseEvent | TouchEvent} e2
 * @param {number} pixelCount
 * @returns {boolean}
 */
export function areEventsNear(e1: MouseEvent | Touch, e2: MouseEvent | Touch, pixelCount: number): boolean {
    // by default, we wait 4 pixels before starting the drag
    if (pixelCount === 0) { return false; }

    const diffX = Math.abs(e1.clientX - e2.clientX);
    const diffY = Math.abs(e1.clientY - e2.clientY);

    return Math.max(diffX, diffY) <= pixelCount;
}
