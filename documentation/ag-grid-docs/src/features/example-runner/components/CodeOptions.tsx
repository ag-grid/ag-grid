import type { ImportType, InternalFramework } from '@ag-grid-types';
import { USE_PACKAGES } from '@constants';
import { setImportType, setInternalFramework } from '@stores/frameworkStore';
import { isReactInternalFramework } from '@utils/framework';
import { useImportType } from '@utils/hooks/useImportType';
import { useCallback } from 'react';

import styles from './CodeOptions.module.scss';

type SelectorType = 'typescript' | 'react';
interface SelectorConfig {
    label: string;
    labelValues: Record<string, string>;
}

const SELECTOR_CONFIG: Record<SelectorType, SelectorConfig> = {
    typescript: {
        label: 'Language',
        labelValues: {
            TypeScript: 'typescript',
        },
    },
    react: {
        label: 'Language',
        labelValues: {
            JavaScript: 'reactFunctional',
            TypeScript: 'reactFunctionalTs',
        },
    },
};
const IMPORT_TYPE_CONFIG: Record<ImportType, string> = {
    modules: 'Modules',
    packages: 'Packages',
};

if (USE_PACKAGES) {
    SELECTOR_CONFIG.typescript.labelValues['JavaScript'] = 'vanilla';
}

function CodeOptionSelector({
    id,
    type,
    internalFramework,
    tracking,
}: {
    id: string;
    type: SelectorType;
    internalFramework: InternalFramework;
    tracking?: (value: string) => void;
}) {
    const formId = `${id}-${type}-style-selector`;
    const config = SELECTOR_CONFIG[type];
    const onChange = useCallback(
        (event) => {
            const value = event.target.value;
            if (value === internalFramework) {
                return;
            }
            setInternalFramework(value);
        },
        [internalFramework]
    );

    return (
        <div>
            <label className="text-sm" htmlFor={formId}>
                {config.label}:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={internalFramework}
                onChange={(event) => {
                    onChange(event);
                    tracking && tracking(event.target.value);
                }}
                onBlur={onChange}
            >
                {Object.keys(config.labelValues).map((label) => {
                    return (
                        <option key={label} value={config.labelValues[label]}>
                            {label}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

function ImportTypeSelector({
    id,
    tracking,
    supportedImportTypes,
}: {
    id: string;
    tracking?: (value: string) => void;
    supportedImportTypes: ImportType[];
}) {
    const formId = `${id}-import-selector`;
    const importType = useImportType();

    const onChange = useCallback(
        (event) => {
            const value = event.target.value;
            if (value === importType) {
                return;
            }
            setImportType(value);
        },
        [importType]
    );

    const importTypes: ImportType[] = supportedImportTypes?.length > 0 ? supportedImportTypes : ['modules', 'packages'];
    return (
        <div>
            <label className="text-sm" htmlFor={formId}>
                Import type:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={importType}
                onChange={(event) => {
                    onChange(event);
                    tracking && tracking(event.target.value);
                }}
                onBlur={onChange}
            >
                {importTypes.map((i) => (
                    <option key={i} value={i}>
                        {IMPORT_TYPE_CONFIG[i]}
                    </option>
                ))}
            </select>
        </div>
    );
}

export const CodeOptions = ({
    id,
    internalFramework,
    supportedFrameworks,
    supportedImportTypes,
}: {
    id: string;
    internalFramework: InternalFramework;
    supportedFrameworks: InternalFramework[];
    supportedImportTypes: ImportType[];
}) => {
    let showTypescriptSelector = internalFramework === 'vanilla' || internalFramework === 'typescript';
    const showReactSelector = isReactInternalFramework(internalFramework);

    if (supportedFrameworks?.length > 0) {
        showTypescriptSelector = showTypescriptSelector && supportedFrameworks.includes('vanilla');
    }

    return (
        <div className={styles.outer}>
            {showTypescriptSelector && (
                <CodeOptionSelector id={id} type="typescript" internalFramework={internalFramework} />
            )}
            {showReactSelector && <CodeOptionSelector id={id} type="react" internalFramework={internalFramework} />}

            {internalFramework !== 'vanilla' && (
                <ImportTypeSelector id={id} supportedImportTypes={supportedImportTypes} />
            )}
        </div>
    );
};
