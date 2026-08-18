const log = console.log;
const info = console.info;

export { log, info };

/** Resolves after the next animation frame — use to wait for an animation-frame-driven re-render to settle. */
export function nextAnimationFrame(): Promise<number> {
    return new Promise(requestAnimationFrame);
}
