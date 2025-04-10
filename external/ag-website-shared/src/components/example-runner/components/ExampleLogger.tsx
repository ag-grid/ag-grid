import { getType } from '@ag-website-shared/components/example-runner/utils/getType';
import ReactJsonView from '@microlink/react-json-view';
import { type FunctionComponent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    collapsed: true,
    name: null,
    enableClipboard: false,
    displayDataTypes: false,
    displayObjectSize: false,
    displayArrayKey: false,
};
const IGNORED_MESSAGES = ['Angular is running in development mode.'];

// Styles using base16: https://github.com/chriskempson/base16/blob/main/styling.md
const JSON_VIEWER_THEME = {
    base00: 'rgba(0, 0, 0, 0)',
    base01: 'rgb(245, 245, 245)',
    // Selection Background
    base02: 'rgba(0, 0, 0, 0)',
    base03: '#93a1a1',
    base04: 'rgba(0, 0, 0, 0.3)',
    base05: '#586e75',
    base06: '#073642',
    base07: 'var(--color-code-punctuation)',
    base08: '#d33682',
    // Integers, Boolean, Constants, XML Attributes, Markup Link Url
    base09: 'var(--color-code-string)',
    // Classes, Markup Bold, Search Text Background
    base0A: 'var(--color-code-keyword)',
    // Strings, Inherited Class, Markup Code, Diff Inserted
    base0B: 'var(--color-code-string)',
    // Support, Regular Expressions, Escape Characters, Markup Quotes
    base0C: 'var(--color-code-property)',
    base0D: '#586e75',
    // Keywords, Storage, Selector, Markup Italic, Diff Changed
    base0E: 'var(--color-code-symbol)',
    // Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
    base0F: 'var(--color-code-symbol)',
};

const MATCH_TYPE_REGEXP = /\[TYPE:([^\]]+)]/g;
const REPLACEMENT_TYPES_MAP: Record<string, any> = {
    undefined: undefined,
    nan: NaN,
    infinity: Infinity,
    negativeInfinity: -Infinity,
};

function containsIgnoredMessage(log: Log) {
    return log.data.some((message) =>
        IGNORED_MESSAGES.some((ignoredMessage) => typeof message === 'string' && message.includes(ignoredMessage))
    );
}

function getLoggableData(data: LogData[]) {
    return data.map((logItem: LogData) => {
        const consoleLogObject = logItem as LogObject;
        if (logItem && consoleLogObject.__consoleLogObject) {
            const parsedObject = JSON.parse(consoleLogObject.safeString);
            return updateWithTypeValues(parsedObject);
        } else {
            return logItem;
        }
    });
}

function getReplacementType(typeValue: string) {
    const [replacementType] = Array.from(typeValue.matchAll(MATCH_TYPE_REGEXP), (m) => m[1]);
    return replacementType;
}

/**
 * Recursively update the values of an object or array with their replacement types.
 *
 * Due to the limitations of `JSON.stringify`, we need to store some values as special strings
 * in the form `[TYPE:<type>]`, where `<type>` is a type that can't be deserialised. This
 * needs to be extracted and converted back to the original value.
 */
function updateWithTypeValues(value: any) {
    const valueType = getType(value);

    if (valueType === 'string') {
        const replacementType = getReplacementType(value);

        const output = replacementType ? REPLACEMENT_TYPES_MAP[replacementType] : value;
        return output;
    } else if (valueType === 'array') {
        return value.map((item: any) => updateWithTypeValues(item));
    } else if (valueType === 'object') {
        const obj = { ...value };
        for (const key in value) {
            obj[key] = updateWithTypeValues(value[key]);
        }

        const sortedKeys = Object.keys(obj).sort();
        const sortedObj = Object.fromEntries(
            sortedKeys.map((key) => {
                return [key, obj[key]];
            })
        );
        return sortedObj;
    } else {
        return value;
    }
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
                        <ReactJsonView
                            key={i}
                            src={value as object}
                            theme={JSON_VIEWER_THEME}
                            {...REACT_JSON_VIEW_CONFIG}
                        />
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

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

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
            <div className={styles.loggerHeader}>
                <div>Console</div>
                <button className={`button-secondary ${styles.clearButton}`} onClick={clearLogs}>
                    Clear
                </button>
            </div>
            <pre ref={containerRef} className={styles.loggerPre}>
                {logs.length === 0 && <div>Console logs from the example shown here...</div>}
                {logs.map((log, i) => (
                    <DataItem key={i} data={log.data}></DataItem>
                ))}
            </pre>
        </div>
    );
};
