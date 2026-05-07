// Plain JS FPS monitor. No framework dependencies — safe to dynamically import
// from any product website.

const CONTAINER_ID = 'ag-fps-monitor';
const SAMPLE_WINDOW_MS = 1000;
const HISTORY_LENGTH = 60;

let activeStop = null;

export function startFpsMonitor() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return () => {};
    }

    if (document.getElementById(CONTAINER_ID)) {
        return activeStop ?? (() => {});
    }

    const container = document.createElement('div');
    container.id = CONTAINER_ID;
    Object.assign(container.style, {
        position: 'fixed',
        bottom: '8px',
        right: '8px',
        zIndex: '2147483647',
        padding: '6px 8px',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        font: '11px/1.3 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        borderRadius: '4px',
        pointerEvents: 'none',
        userSelect: 'none',
        minWidth: '92px',
    });

    const currentEl = document.createElement('div');
    currentEl.textContent = 'FPS: --';

    const minMaxEl = document.createElement('div');
    minMaxEl.style.opacity = '0.75';
    minMaxEl.textContent = 'min -- · max --';

    const graphCanvas = document.createElement('canvas');
    graphCanvas.width = 92;
    graphCanvas.height = 24;
    Object.assign(graphCanvas.style, {
        width: '92px',
        height: '24px',
        marginTop: '4px',
        display: 'block',
    });

    container.appendChild(currentEl);
    container.appendChild(minMaxEl);
    container.appendChild(graphCanvas);
    document.body.appendChild(container);

    const ctx = graphCanvas.getContext('2d');
    const history = [];

    let frames = 0;
    let windowStart = performance.now();
    let minFps = Infinity;
    let maxFps = 0;
    let rafId = 0;
    let running = true;

    const drawGraph = () => {
        if (!ctx) return;
        const w = graphCanvas.width;
        const h = graphCanvas.height;
        ctx.clearRect(0, 0, w, h);

        if (history.length < 2) return;

        const max = Math.max(60, ...history);
        const step = w / (HISTORY_LENGTH - 1);

        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
            const x = i * step;
            const y = h - (history[i] / max) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#7CFC9D';
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const tick = () => {
        if (!running) return;
        frames++;
        const now = performance.now();
        const elapsed = now - windowStart;
        if (elapsed >= SAMPLE_WINDOW_MS) {
            const fps = Math.round((frames * 1000) / elapsed);
            if (fps < minFps) minFps = fps;
            if (fps > maxFps) maxFps = fps;

            currentEl.textContent = `FPS: ${fps}`;
            minMaxEl.textContent = `min ${minFps === Infinity ? '--' : minFps} · max ${maxFps}`;

            history.push(fps);
            if (history.length > HISTORY_LENGTH) history.shift();
            drawGraph();

            frames = 0;
            windowStart = now;
        }
        rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    activeStop = function stopFpsMonitor() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        container.remove();
        activeStop = null;
    };

    return activeStop;
}
