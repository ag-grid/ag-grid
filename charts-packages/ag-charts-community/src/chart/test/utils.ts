import { Chart } from "../chart";

export function repeat<T>(value: T, count: number): T[] {
    const result = new Array(count);
    for (let idx = 0; idx < count; idx++) {
        result[idx] = value;
    }
    return result;
}

export async function waitForChartStability(chart: Chart, timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        let retryMs = 10;
        let startMs = Date.now();
        const cb = () => {
            if (!chart.layoutPending && !chart.dataPending && !chart.scene.dirty) {
                resolve();
            }

            const timeMs = Date.now() - startMs;
            if (timeMs >= timeoutMs) {
                reject('timeout reached');
            }

            retryMs *= 2;
            setTimeout(cb, retryMs);
        };

        cb();
    });
}

export function mouseMoveEvent({ offsetX, offsetY }: { offsetX: number, offsetY: number}): MouseEvent {
    const event = new MouseEvent('mousemove');
    Object.assign(event, { offsetX, offsetY, pageX: offsetX, pageY: offsetY });
    return event;
}
