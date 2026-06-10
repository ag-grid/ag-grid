import type { Framework } from '@ag-grid-types';
import CodeShiki from '@ag-website-shared/components/code/CodeShiki';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { LinkIcon } from '@ag-website-shared/components/link-icon/LinkIcon';
import styles from '@ag-website-shared/components/reference-documentation/ApiReference.module.scss';
import { useScrollToAnchor } from '@ag-website-shared/utils/navigation';
import { useStore } from '@nanostores/react';
import { $codeData, $interfaceLookup } from '@stores/referenceDataStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ChildDocEntry, Config, PropertyDisplayData } from '../types';
import { getTypeUrl, inferType, removeDefaultValue } from '../utils/documentation-helpers';
import { getDefinitionType } from '../utils/getDefinitionType';
import { getDetailsCode } from '../utils/getDetailsCode';
import { formatJson, getInterfaceName } from '../utils/interface-helpers';
import legacyStyles from './LegacyApiReference.module.scss';
import { PropertyModules } from './PropertyModules';

function getDisplayNameSplit({ name, definition }: { name: string; definition: ChildDocEntry }) {
    let displayName = name;
    if (definition.isRequired) {
        displayName += `&nbsp;<span class="${styles.required}">required</span>`;
    }

    if (definition.strikeThrough) {
        displayName = `<span style='text-decoration: line-through'>${displayName}</span>`;
    }

    const { isRequired, strikeThrough } = definition;
    if (isRequired || strikeThrough) {
        return displayName;
    }

    return displayName
        .split(/(?=[A-Z])/)
        .reverse()
        .reduce((acc, cv) => `${cv}<wbr />` + acc);
}

function getDetailsId(id: string) {
    return `${id}-details`;
}

function CollapsibleButton({ name, isExpanded, onClick }: { name: string; isExpanded?: boolean; onClick: () => void }) {
    return (
        <button
            className={classnames(styles.seeMore, 'button-tertiary', {
                [styles.isExpanded]: isExpanded,
            })}
            onClick={onClick}
            aria-label={`See more details about ${name}`}
        >
            <Icon className={`${styles.chevron} ${isExpanded ? 'expandedIcon' : ''}`} name="chevronDown" />
        </button>
    );
}

export const Property: FunctionComponent<{
    id: string;
    name: string;
    framework: Framework;
    definition: ChildDocEntry;
    displayData: PropertyDisplayData;
    showAdditionalDetails: boolean;
    isEvent?: boolean;
    propertyType: string;
    config: Config;
}> = ({ id, name, framework, definition, displayData, showAdditionalDetails, isEvent, propertyType, config }) => {
    const idName = `reference-${id}-${name}`;
    const displayNameSplit = getDisplayNameSplit({ name, definition });

    const { description, isObject, fallbackTypeStr, formattedDefaultValue, isInitial, modules } = displayData;

    // Compute typeUrl from pre-computed display data; id and framework are available here
    const rawType = definition.type ?? fallbackTypeStr ?? inferType(definition.default);
    const typeUrl = isObject
        ? `#reference-${id}.${name}`
        : propertyType !== 'Function'
          ? getTypeUrl(rawType, framework)
          : null;

    const { more } = definition;

    const propertyRef = useRef<HTMLTableRowElement>(null);
    const [isExpanded, setExpanded] = useState(config.defaultExpand);
    const scrollToAnchor = useScrollToAnchor();

    useEffect(() => {
        const hashId = location.hash.slice(1);
        if (idName === hashId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- expand property when URL hash matches
            setExpanded(true);
            propertyRef.current?.scrollIntoView();
        }
    }, [idName]);

    const onCollapseClick = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    const interfaceLookup = useStore($interfaceLookup);
    const codeData = useStore($codeData);

    const detailsCode = useMemo(() => {
        if (!isExpanded || !showAdditionalDetails || !interfaceLookup) return null;

        // codeData is undefined until the island calls loadCodeLookup (even with no sources).
        // Once set (to {} or populated), we can proceed.
        if (codeData === undefined) return null;

        // Resolve gridOpProp from any loaded code file.
        // api-docs files are flat: fileData[name]
        // interface-docs files are two-level: fileData[id][name] (id = interface name)
        let gridOpProp: any;
        for (const fileData of Object.values(codeData)) {
            const entry = fileData?.[id]?.[name] ?? fileData?.[name];
            if (entry) {
                gridOpProp = entry;
                break;
            }
        }

        const { type } = getDefinitionType({
            name,
            definition,
            gridOpProp,
            interfaceLookup,
            isEvent: isEvent ?? false,
            config,
        });

        return getDetailsCode({
            framework,
            name,
            type,
            gridOpProp,
            interfaceLookup,
            interfaceHierarchyOverrides: definition.interfaceHierarchyOverrides,
            isApi: config.isApi,
        });
    }, [
        isExpanded,
        showAdditionalDetails,
        interfaceLookup,
        codeData,
        id,
        name,
        definition,
        isEvent,
        config,
        framework,
    ]);

    return (
        <tr ref={propertyRef} className={legacyStyles.tableRow}>
            <td className={legacyStyles.propertyNameDescription}>
                <div className={classnames(styles.propertyRow)} data-api-property>
                    <div className={styles.leftColumn}>
                        <div
                            id={idName}
                            className={classnames(styles.name, 'side-menu-exclude')}
                            data-api-property-name
                        >
                            <span dangerouslySetInnerHTML={{ __html: displayNameSplit }}></span>
                            <LinkIcon
                                href={`#${idName}`}
                                onClick={scrollToAnchor}
                                className={styles.linkIcon}
                                aria-label={`Link to ${name} property`}
                            />
                        </div>

                        <div className={styles.metaItem}>
                            <div className={styles.metaRow}>
                                {showAdditionalDetails && (
                                    <CollapsibleButton
                                        name={more?.name ?? name}
                                        isExpanded={isExpanded}
                                        onClick={onCollapseClick}
                                    />
                                )}
                                {typeUrl ? (
                                    <a
                                        className={styles.metaValue}
                                        href={typeUrl}
                                        target={typeUrl.startsWith('http') ? '_blank' : '_self'}
                                        rel="noreferrer"
                                    >
                                        {isObject ? getInterfaceName(name) : propertyType}
                                    </a>
                                ) : (
                                    <span
                                        onClick={onCollapseClick}
                                        className={classnames(styles.metaValue, {
                                            [styles.isExpandable]: showAdditionalDetails,
                                        })}
                                    >
                                        {propertyType}
                                    </span>
                                )}
                            </div>

                            {formattedDefaultValue != null && (
                                <div className={styles.metaItem}>
                                    <span className={classnames(styles.metaValue, styles.defaultValue)}>
                                        <span className={styles.defaultLabel}>default: </span>
                                        {formattedDefaultValue}
                                    </span>
                                </div>
                            )}

                            {isInitial && (
                                <div className={classnames(styles.metaItem, styles.initialItem)}>
                                    <a
                                        className={classnames(styles.metaValue)}
                                        href={urlWithPrefix({
                                            url: config?.initialLink ?? './grid-interface/#initial-grid-options',
                                            framework,
                                        })}
                                    >
                                        Initial
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div
                            role="presentation"
                            className={styles.description}
                            data-api-property-description
                            dangerouslySetInnerHTML={{ __html: removeDefaultValue(description) }}
                        ></div>

                        <div className={styles.actions}>
                            {isObject && (
                                <div>
                                    See <a href={`#reference-${id}.${name}`}>{name}</a> for more details.
                                </div>
                            )}

                            {definition.options != null && (
                                <div>
                                    Options:{' '}
                                    {definition.options.map((o, i) => (
                                        <Fragment key={o}>
                                            {i > 0 ? ', ' : ''}
                                            <code>{formatJson(o)}</code>
                                        </Fragment>
                                    ))}
                                </div>
                            )}

                            {more != null && more.url && !config.hideMore && (
                                <a
                                    className={styles.docLink}
                                    href={urlWithPrefix({
                                        url: more.url,
                                        framework,
                                    })}
                                >
                                    {more.name}
                                    <Icon name="newTab" />
                                </a>
                            )}

                            {modules[0] && <PropertyModules modules={modules} framework={framework} />}
                        </div>
                    </div>

                    {showAdditionalDetails && isExpanded && (
                        <div id={getDetailsId(idName)} className={styles.expandedContent}>
                            {detailsCode && <CodeShiki code={detailsCode} keepMarkup={true} />}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};
