import DocumentationLink from 'components/DocumentationLink';
import { useGlobalContext } from 'components/GlobalContext';
import { Icon } from 'components/Icon';
import React from 'react';
import isServerSideRendering from 'utils/is-server-side-rendering';
import styles from '@design-system/modules/CodeOptions.module.scss';
import { trackExampleRunnerEvent } from './track-example-runner-event';

const isGeneratedExample = (type) => ['generated', 'mixed', 'typescript'].includes(type);

const ImportTypeSelector = ({ id, tracking }) => {
    const formId = `${id}-import-style-selector`;
    const { exampleImportType, set } = useGlobalContext();

    return isServerSideRendering() ? null : (
        <>
            <label className="text-sm" htmlFor={formId}>
                Import type:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={exampleImportType}
                onChange={(event) => {
                    const value = event.target.value;
                    set({ exampleImportType: value });
                    tracking(value);
                }}
                onBlur={(event) => set({ exampleImportType: event.target.value })}
            >
                {['packages', 'modules'].map((type) => (
                    <option key={type} value={type}>
                        {type[0].toUpperCase()}
                        {type.substring(1)}
                    </option>
                ))}
            </select>
        </>
    );
};

const ReactStyleSelector = ({ id, tracking }) => {
    const formId = `${id}-react-style-selector`;
    const { useTypescript, set } = useGlobalContext();
    
    const onChange = (event) => {
        const value = event.target.value;
        switch (value) {
            case 'hooks':
                set({ useTypescript: false });
                break;
            case 'hooksTs':
                set({ useTypescript: true });
                break;
            default:
                set({ useTypescript: true });
                break;
        }
    };

    return isServerSideRendering() ? null : (
        <>
            <label className="text-sm" htmlFor={formId}>
                Language:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={useTypescript ? 'hooksTs' : 'hooks'}
                onChange={(event) => {
                    onChange(event);
                    tracking(event.target.value);
                }}
                onBlur={onChange}
            >
                <option value="hooks">Javascript</option>
                <option value="hooksTs">Typescript</option>
            </select>
        </>
    );
};

const VueStyleSelector = ({ id, tracking }) => {
    const formId = `${id}-vue-style-selector`;
    const { useVue3, set } = useGlobalContext();

    return isServerSideRendering() ? null : (
        <>
            <label className="text-sm" htmlFor={formId}>
                Version:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={JSON.stringify(useVue3)}
                onChange={(event) => {
                    const value = event.target.value;
                    set({ useVue3: JSON.parse(value) });
                    tracking(value);
                }}
                onBlur={(event) => set({ useVue3: JSON.parse(event.target.value) })}
            >
                <option value="false">Vue 2</option>
                <option value="true">Vue 3</option>
            </select>
        </>
    );
};

const TypescriptStyleSelector = ({ id, tracking }) => {
    const formId = `${id}-typescript-style-selector`;
    const { useTypescript, set } = useGlobalContext();

    return isServerSideRendering() ? null : (
        <>
            <label className="text-sm" htmlFor={formId}>
                Language:
            </label>{' '}
            <select
                className={styles.simpleSelect}
                id={formId}
                value={JSON.stringify(useTypescript)}
                onChange={(event) => {
                    const value = event.target.value;
                    set({ useTypescript: JSON.parse(value) });
                    tracking(value);
                }}
                onBlur={(event) => set({ useTypescript: JSON.parse(event.target.value) })}
            >
                <option value="false">Javascript</option>
                <option value="true">Typescript</option>
            </select>
        </>
    );
};

const CodeOptions = ({ exampleInfo }) => {
    const isGenerated = isGeneratedExample(exampleInfo.type);
    const { enableVue3 } = useGlobalContext();

    return (
        <div className={styles.outer}>
            {exampleInfo.framework === 'javascript' &&
                (isGenerated || exampleInfo.type === 'multi') &&
                (exampleInfo.internalFramework === 'vanilla' || exampleInfo.internalFramework === 'typescript') && (
                    <div>
                        <TypescriptStyleSelector
                            id={`${exampleInfo.linkId}-typescript-style-selector`}
                            useTypescript={exampleInfo.useTypescript}
                            tracking={(value) => {
                                trackExampleRunnerEvent({
                                    type: 'typescriptSelect',
                                    exampleInfo,
                                    extraProps: {
                                        value,
                                    },
                                });
                            }}
                        />
                    </div>
                )}

            {/* perversely we don't show the hook/class when the type is react as the example provided will be displayed "as is" */}
            {exampleInfo.framework === 'react' && exampleInfo.type !== 'react' && (
                <div>
                    <ReactStyleSelector
                        id={exampleInfo.linkId}
                        useTypescript={exampleInfo.useTypescript}
                        tracking={(value) => {
                            trackExampleRunnerEvent({
                                type: 'reactSelect',
                                exampleInfo,
                                extraProps: {
                                    value,
                                },
                            });
                        }}
                    />
                </div>
            )}

            {exampleInfo.framework === 'vue' && enableVue3 &&
                (
                    <div>
                        <VueStyleSelector
                            id={exampleInfo.linkId}
                            useVue3={exampleInfo.useVue3}
                            tracking={(value) => {
                                trackExampleRunnerEvent({
                                    type: 'vue3Select',
                                    exampleInfo,
                                    extraProps: {
                                        value,
                                    },
                                });
                            }}
                        />
                    </div>
                )
            }

            {exampleInfo.library === 'grid' &&
                (exampleInfo.framework !== 'javascript' || exampleInfo.internalFramework === 'typescript') &&
                isGenerated && (
                    <div>
                        <ImportTypeSelector
                            id={exampleInfo.linkId}
                            tracking={(value) => {
                                trackExampleRunnerEvent({
                                    type: 'importTypeSelect',
                                    exampleInfo,
                                    extraProps: {
                                        value,
                                    },
                                });
                            }}
                        />
                        <DocumentationLink
                            className={styles.importInfoIcon}
                            framework={exampleInfo.framework}
                            target="_blank"
                            href={`/packages-modules`}
                            role="tooltip"
                            title={
                                exampleInfo.importType === 'packages'
                                    ? 'Example is using AG Grid packages where all the grid features are included by default. Click for more info.'
                                    : 'Example is using AG Grid modules to minimise application bundle size and only includes the modules required to demonstrate the given feature. Click for more info.'
                            }
                        >
                            <Icon name="info" />
                        </DocumentationLink>
                    </div>
                )}
        </div>
    );
};

export default CodeOptions;
