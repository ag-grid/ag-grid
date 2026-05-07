import { getType } from '@ag-website-shared/components/example-runner/utils/getType';
import { type FunctionComponent, useCallback, useEffect, useRef } from 'react';

import styles from './ExampleLogger.module.scss';

// High-frequency loggers (e.g. onRowDragMove during a drag) can post several batches per
// frame. Coalesce them into one DOM update at this cadence so the panel stays live but
// doesn't trigger a per-batch reflow.
const COMMIT_INTERVAL_MS = 200;

type LogObject = {
    __consoleLogObject: true;
    isLoggable: boolean;
    argType: string;
    safeString: string;
};
type SimpleValue = string | number | boolean | null | undefined;
type LogData = SimpleValue | LogObject;

interface IncomingLog {
    type: string;
    data: LogData[];
}

interface RenderedLog {
    rawData: LogData[];
    element: HTMLElement;
    countEl: HTMLElement;
    count: number;
}

interface Props {
    exampleName: string;
    bufferSize?: number;
}

const IGNORED_MESSAGES = [
    'Angular is running in development mode.',
    '[vite] server connection lost. Polling for restart...',
];

function containsIgnoredMessage(data: LogData[]) {
    return data.some((message) =>
        IGNORED_MESSAGES.some((ignored) => typeof message === 'string' && message.includes(ignored))
    );
}

function isRepeatedRawData(prev: LogData[], next: LogData[]) {
    if (prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i++) {
        const a = prev[i];
        const b = next[i];
        if ((a as LogObject)?.__consoleLogObject) {
            if ((a as LogObject).safeString !== (b as LogObject)?.safeString) return false;
        } else if (a !== b && !(Number.isNaN(a) && Number.isNaN(b))) {
            return false;
        }
    }
    return true;
}

function buildSimpleValue(value: SimpleValue): HTMLElement {
    const valueType = getType(value);
    const span = document.createElement('span');
    const cls = styles[`type-${valueType}`];
    if (cls) span.className = cls;
    if (valueType === 'null' || valueType === 'undefined') {
        span.textContent = valueType;
    } else {
        span.textContent = String(value);
    }
    return span;
}

// Build an empty <details> with a toggle listener that lazy-populates the <pre> on first
// expand. Per-commit cost is just createElement + addEventListener — the JSON.parse +
// JSON.stringify(_, null, 2) only runs when the user actually clicks to view the object.
function buildObjectPreview(safeString: string): HTMLElement {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = safeString.charCodeAt(0) === 91 /* '[' */ ? 'Array' : 'Object';
    details.appendChild(summary);

    const pre = document.createElement('pre');
    pre.className = styles.objectPreview;
    details.appendChild(pre);

    let populated = false;
    details.addEventListener('toggle', () => {
        if (!details.open || populated) return;
        populated = true;
        try {
            pre.textContent = JSON.stringify(JSON.parse(safeString), null, 2);
        } catch {
            pre.textContent = safeString;
        }
    });

    return details;
}

function buildLogElement(rawData: LogData[]): { element: HTMLElement; countEl: HTMLElement } {
    const item = document.createElement('div');
    item.className = styles.logItem;

    const countEl = document.createElement('div');
    countEl.className = styles.count;
    countEl.style.display = 'none';
    countEl.textContent = '1';
    item.appendChild(countEl);

    const dataItem = document.createElement('div');
    dataItem.className = styles.dataItem;
    for (const value of rawData) {
        const obj = value as LogObject;
        if (value && obj.__consoleLogObject) {
            dataItem.appendChild(buildObjectPreview(obj.safeString));
        } else {
            dataItem.appendChild(buildSimpleValue(value as SimpleValue));
        }
    }
    item.appendChild(dataItem);

    return { element: item, countEl };
}

export const ExampleLogger: FunctionComponent<Props> = ({ exampleName, bufferSize = 20 }) => {
    const containerRef = useRef<HTMLPreElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const clearRef = useRef<() => void>(() => {});

    const clearLogs = useCallback(() => clearRef.current(), []);

    useEffect(() => {
        const container = containerRef.current;
        const placeholder = placeholderRef.current;
        if (!container) return;

        // All log state lives here in closures — no React state, no per-commit reconcile.
        const logs: RenderedLog[] = [];
        const pending: IncomingLog[] = [];
        let commitTimer: ReturnType<typeof setTimeout> | null = null;

        const setPlaceholderVisible = (visible: boolean) => {
            if (placeholder) placeholder.style.display = visible ? '' : 'none';
        };

        const commit = () => {
            commitTimer = null;
            if (pending.length === 0) return;
            const batch = pending.splice(0, pending.length);

            const fragment = document.createDocumentFragment();
            for (const entry of batch) {
                const last = logs[logs.length - 1];
                if (last && isRepeatedRawData(last.rawData, entry.data)) {
                    last.count++;
                    last.countEl.style.display = '';
                    last.countEl.textContent = String(last.count);
                    continue;
                }
                const { element, countEl } = buildLogElement(entry.data);
                logs.push({ rawData: entry.data, element, countEl, count: 1 });
                fragment.appendChild(element);
            }

            if (logs.length > 0) setPlaceholderVisible(false);
            if (fragment.childNodes.length > 0) container.appendChild(fragment);

            while (logs.length > bufferSize) {
                const removed = logs.shift();
                if (removed && removed.element.parentNode === container) {
                    container.removeChild(removed.element);
                }
            }

            container.scrollTop = container.scrollHeight;
        };

        const scheduleCommit = () => {
            if (commitTimer !== null) return;
            commitTimer = setTimeout(commit, COMMIT_INTERVAL_MS);
        };

        const handleMessage = (event: MessageEvent) => {
            const envelope = event.data;
            if (!envelope?.type?.startsWith('console-') || envelope.exampleName !== exampleName) return;

            if (envelope.type === 'console-batch') {
                const entries: IncomingLog[] = envelope.logs ?? [];
                for (const entry of entries) {
                    if (!containsIgnoredMessage(entry.data)) pending.push(entry);
                }
            } else {
                if (containsIgnoredMessage(envelope.data ?? [])) return;
                pending.push({ type: envelope.type, data: envelope.data ?? [] });
            }
            if (pending.length > 0) scheduleCommit();
        };

        clearRef.current = () => {
            pending.length = 0;
            if (commitTimer !== null) {
                clearTimeout(commitTimer);
                commitTimer = null;
            }
            for (const entry of logs) {
                if (entry.element.parentNode === container) {
                    container.removeChild(entry.element);
                }
            }
            logs.length = 0;
            setPlaceholderVisible(true);
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (commitTimer !== null) clearTimeout(commitTimer);
            clearRef.current = () => {};
            for (const entry of logs) {
                if (entry.element.parentNode === container) {
                    container.removeChild(entry.element);
                }
            }
            logs.length = 0;
            setPlaceholderVisible(true);
        };
    }, [exampleName, bufferSize]);

    return (
        <div className={styles.loggerOuter}>
            <div className={styles.loggerHeader}>
                <div>Console</div>
                <button className={`button-secondary ${styles.clearButton}`} onClick={clearLogs}>
                    Clear
                </button>
            </div>
            <pre ref={containerRef} className={styles.loggerPre}>
                <div ref={placeholderRef} className={styles.placeholder}>
                    Console logs from the example shown here...
                </div>
            </pre>
        </div>
    );
};
