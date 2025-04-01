import { getType } from '@ag-website-shared/components/example-runner/utils/getType';
import ReactJsonView from '@microlink/react-json-view';
import { type FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './ExampleLogger.module.scss';

type LogObject = {
    __consoleLogObject: true;
    isLoggable: boolean;
    argType: string;
    safeString: string;
};
type SimpleValue = string | number | boolean | null | undefined;
type LogData = SimpleValue | LogObject;

interface Log {
    type: 'console-log';
    pageName?: string;
    exampleName: string;
    data: LogData[];
}

interface Props {
    exampleName: string;
    bufferSize?: number;
}

const REACT_JSON_VIEW_CONFIG = {
    collapsed: 1,
    name: null,
    enableClipboard: false,
    displayDataTypes: false,
    displayObjectSize: false,
    displayArrayKey: false,
};
const IGNORED_MESSAGES = ['Angular is running in development mode.'];

function containsIgnoredMessage(log: Log) {
    return log.data.some((message) =>
        IGNORED_MESSAGES.some((ignoredMessage) => typeof message === 'string' && message.includes(ignoredMessage))
    );
}

function getLoggableData(data: LogData[]) {
    return data.map((logItem: LogData) => {
        const consoleLogObject = logItem as LogObject;
        if (logItem && consoleLogObject.__consoleLogObject) {
            return JSON.parse(consoleLogObject.safeString);
        } else {
            return logItem;
        }
    });
}

const SimpleValueDisplay = ({ value }: { value: SimpleValue }) => {
    const valueType = getType(value);
    let displayValue = value;
    if (['null', 'undefined'].includes(valueType)) {
        displayValue = valueType;
    }

    return <span className={styles[`type-${valueType}`]}>{displayValue?.toString()}</span>;
};

const DataItem = ({ data }: { data: LogData[] }) => {
    return (
        <>
            <div>
                {data.map((value, i) => {
                    const isJSonViewable = ['object', 'array'].includes(getType(value));
                    return isJSonViewable ? (
                        <ReactJsonView key={i} src={value as object} {...REACT_JSON_VIEW_CONFIG} />
                    ) : (
                        <SimpleValueDisplay key={i} value={value as SimpleValue} />
                    );
                })}
            </div>
        </>
    );
};

export const ExampleLogger: FunctionComponent<Props> = ({ exampleName, bufferSize = 20 }) => {
    const containerRef = useRef<HTMLPreElement>(null);
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const updateLogs = (event: MessageEvent) => {
            const log = event.data;
            if (log?.type === 'console-log' && log.exampleName === exampleName && !containsIgnoredMessage(log)) {
                setLogs((prevLogs) => {
                    const bufferedLogs = prevLogs.length >= bufferSize ? prevLogs.slice(1) : prevLogs;

                    const newLog = {
                        ...log,
                        data: getLoggableData(log.data),
                    };
                    return [...bufferedLogs, newLog];
                });
            }
        };

        window.addEventListener('message', updateLogs);

        return () => {
            window.removeEventListener('message', updateLogs);
        };
    }, []);

    useLayoutEffect(() => {
        // Scroll to the bottom of the logs, when new logs are added
        containerRef.current!.scrollTo({ top: containerRef.current!.scrollHeight });
    }, [logs]);

    return (
        <div className={styles.loggerOuter}>
            <div className={styles.loggerHeader}>Console</div>
            <pre ref={containerRef} className={styles.loggerPre}>
                {logs.length === 0 && <div>Console logs from the example shown here...</div>}
                {logs.map((log, i) => (
                    <DataItem key={i} data={log.data}></DataItem>
                ))}
            </pre>
        </div>
    );
};
