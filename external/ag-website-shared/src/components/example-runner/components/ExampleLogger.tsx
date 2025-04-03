import { type FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './ExampleLogger.module.scss';

type LogObject = {
    __consoleLogObject: true;
    isLoggable: boolean;
    argType: string;
    safeString: string;
};
type LogData = string | number | undefined | null | LogObject;

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

const SEE_DEV_CONSOLE_MESSAGE = '[Object] - see developer console';
const IGNORED_MESSAGES = ['Angular is running in development mode.'];

function containsIgnoredMessage(log: Log) {
    return log.data.some((message) =>
        IGNORED_MESSAGES.some((ignoredMessage) => typeof message === 'string' && message.includes(ignoredMessage))
    );
}

function getLoggableData(data: LogData[]) {
    const isLoggable = data.every((logItem: LogData) => {
        const consoleLogObject = logItem as LogObject;
        return consoleLogObject?.__consoleLogObject ? consoleLogObject.isLoggable : true;
    });

    return isLoggable
        ? data.map((logItem: LogData) => {
              const consoleLogObject = logItem as LogObject;
              if (logItem && consoleLogObject.__consoleLogObject) {
                  return consoleLogObject.safeString;
              } else if (logItem === null) {
                  return 'null';
              } else if (logItem === undefined) {
                  return 'undefined';
              } else {
                  return logItem;
              }
          })
        : [SEE_DEV_CONSOLE_MESSAGE];
}

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
                    <div key={i}>{log.data.join(' ')}</div>
                ))}
            </pre>
        </div>
    );
};
