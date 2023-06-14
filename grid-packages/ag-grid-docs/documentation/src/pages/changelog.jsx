import classnames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from '../components/alert/Alert';
import ChevronButtonCellRenderer from '../components/grid/ChevronButtonRenderer';
import DetailCellRenderer from '../components/grid/DetailCellRendererComponent';
import Grid from '../components/grid/Grid';
import IssueTypeCellRenderer from '../components/grid/IssueTypeRenderer';
import PaddingCellRenderer from '../components/grid/PaddingCellRenderer';
import VersionDropdownMenu from '../components/grid/VersionDropdownMenu';
import ReleaseVersionNotes from '../components/release-notes/ReleaseVersionNotes.jsx';
import styles from './pipelineChangelog.module.scss';

const COLUMN_DEFS = [
    {
        field: 'key',
        headerName: 'Issue',
        width: 135,
        resizable: false,
        cellRendererSelector: (params) => {
            if (
                params.node.data.moreInformation ||
                params.node.data.deprecationNotes ||
                params.node.data.breakingChangesNotes
            ) {
                return {
                    component: 'chevronButtonCellRenderer',
                };
            }
            return {
                component: 'paddingCellRenderer',
            };
        },
    },
    {
        field: 'versions',
        headerName: 'Version',
        width: 95,
        resizable: false,
        filter: true,
    },
    {
        field: 'summary',
        tooltipField: 'summary',
        flex: 1,
    },
    {
        field: 'issueType',
        valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
        filterParams: {
            valueFormatter: (params) => params.colDef.valueFormatter(params),
        },
        cellRenderer: 'issueTypeCellRenderer',
        width: 180,
        filter: true,
    },
    {
        field: 'status',
        valueGetter: (params) => {
            return params.data.resolution;
        },
        width: 110,
    },
    {
        field: 'features',
        headerName: 'Feature',
        valueFormatter: (params) => (!!params.value ? params.value.toString().replaceAll('_', ' ') : undefined),
        tooltipValueGetter: (params) => params.colDef.valueFormatter(params),
        filterParams: {
            valueFormatter: (params) => params.colDef.valueFormatter(params),
        },
        width: 140,
    },
    {
        field: 'deprecated',
        headerName: 'Deprecation',
        headerTooltip: 'Deprecation',
        cellDataType: 'boolean',
        valueGetter: (params) => !!params.node.data.deprecationNotes,
        width: 140,
        minWidth: 140,
    },
    {
        field: 'breakingChange',
        headerTooltip: 'Breaking Change',
        cellDataType: 'boolean',
        valueGetter: (params) => !!params.node.data.breakingChangesNotes,
        width: 110,
        minWidth: 110,
        resizable: false,
    },
];

const defaultColDef = {
    sortable: true,
    resizable: true,
    cellClass: styles.fontClass,
    headerClass: styles.fontClass,
    autoHeaderHeight: true,
    wrapHeaderText: true,
    suppressMenu: true,
    suppressKeyboardEvent: (params) => {
        if (params.event.key === 'Enter' && params.node.master && params.event.type === 'keydown') {
            params.api.getCellRendererInstances({ rowNodes: [params.node] })[0].clickHandlerFunc();
            return true;
        }
        return false;
    },
    cellDataType: false,
};

const detailCellRendererParams = (params) => {
    function produceHTML(fieldName, fieldInfo) {
        return fieldName !== 'Link to Documentation'
            ? `<strong>${fieldName}:</strong><br> ${fieldInfo}<br><br>`
            : `<strong>${fieldName}:</strong><br> ${fieldInfo}`;
    }

    const moreInfo = params.data.moreInformation ? produceHTML('More Information', params.data.moreInformation) : '';
    const deprecationNotes = params.data.deprecationNotes
        ? produceHTML('Deprecation Notes', params.data.deprecationNotes)
        : '';
    const breakingChangesNotes = params.data.breakingChangesNotes
        ? produceHTML('Breaking Changes', params.data.breakingChangesNotes)
        : '';
    const linkToDocumentation = params.data.documentationUrl
        ? produceHTML('Link to Documentation', params.data.documentationUrl)
        : '';

    function makeLinksFunctional(message) {
        let msgArr = message.split(' ');
        const linkStrIdx = msgArr.findIndex((word) => word.includes('https://'));
        if (linkStrIdx > 0) {
            msgArr = msgArr.map((element) => {
                if (element.includes('https://')) {
                    const beginningIndex = element.indexOf('http');
                    const endIndex = element.indexOf('<', beginningIndex);
                    const isEndIndex = endIndex >= 0;
                    let length = 0;
                    if (isEndIndex) {
                        length = endIndex - beginningIndex;
                    }

                    const link = length
                        ? element.substr(element.indexOf('http'), length)
                        : element.substr(element.indexOf('http'));
                    const htmlLink = isEndIndex
                        ? `<a class=${styles.link} href="${link}"
             target="_blank">${link}</a>${element.substr(endIndex)}`
                        : `<a class=${styles.link} target="_blank" href="${link}">${link}</a>`;
                    return element.substr(0, beginningIndex) + htmlLink;
                }
                return element;
            });
            message = msgArr.join(' ');
        }
        return message;
    }

    const message = makeLinksFunctional(
        (moreInfo + deprecationNotes + breakingChangesNotes + linkToDocumentation)
            .replaceAll('\n\r', '<br>')
            .replaceAll('\n', '<br>')
            .replaceAll('\r', '<br>')
    );
    return {
        message: message,
    };
};

const ALL_FIX_VERSIONS = 'All Versions';

const extractFixVersionParameter = (location) => {
    const fixVersionParam = new URLSearchParams(location.search).get('fixVersion');

    return location && location.search && fixVersionParam ? fixVersionParam : ALL_FIX_VERSIONS;
};

const extractFilterTerm = (location) =>
    location && location.search ? new URLSearchParams(location.search).get('searchQuery') : '';

const IS_SSR = typeof window === 'undefined';

const Changelog = ({ location }) => {
    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [versions, setVersions] = useState([]);
    const [allReleaseNotes, setAllReleaseNotes] = useState(null);
    const [currentReleaseNotes, setCurrentReleaseNotes] = useState(null);
    const [markdownContent, setMarkdownContent] = useState(undefined);
    const [fixVersion, setFixVersion] = useState(extractFixVersionParameter(location));
    const [filterState, setFilterState] = useState({ deprecated: false, breakingChange: false });
    const searchBarEl = useRef(null);
    const URLFilterItemKey = useState(extractFilterTerm(location))[0];

    const components = useMemo(() => {
        return {
            myDetailCellRenderer: DetailCellRenderer,
            paddingCellRenderer: PaddingCellRenderer,
            chevronButtonCellRenderer: ChevronButtonCellRenderer,
            issueTypeCellRenderer: IssueTypeCellRenderer,
        };
    }, []);

    const applyFixVersionFilter = useCallback(() => {
        if (gridApi && fixVersion) {
            const versionsFilterComponent = gridApi.getFilterInstance('versions');
            if (versionsFilterComponent) {
                const newModel = {
                    values: fixVersion === ALL_FIX_VERSIONS ? versions : [fixVersion],
                    filterType: 'set',
                };
                versionsFilterComponent?.setModel(newModel);
                gridApi.onFilterChanged();
            }
        }
    }, [gridApi, fixVersion, versions]);

    useEffect(() => {
        fetch('/changelog/changelog.json')
            .then((response) => response.json())
            .then((data) => {
                const gridVersions = [ALL_FIX_VERSIONS, ...data.map((row) => row.versions[0])];
                setVersions([...new Set(gridVersions)]);
                setRowData(data);
            });
        fetch('/changelog/releaseVersionNotes.json')
            .then((response) => response.json())
            .then((data) => {
                setAllReleaseNotes(data);
            });
    }, []);

    useEffect(() => {
        applyFixVersionFilter();
    }, [gridApi, fixVersion, versions, applyFixVersionFilter]);

    useEffect(() => {
        let releaseNotesVersion = fixVersion;
        if (releaseNotesVersion === ALL_FIX_VERSIONS) {
            // Find the latest release notes version
            releaseNotesVersion = allReleaseNotes?.find((element) => !!element['release version'])?.['release version'];
        }

        if (releaseNotesVersion && allReleaseNotes) {
            const releaseNotes = allReleaseNotes.find((element) =>
                element['release version'].includes(releaseNotesVersion)
            );

            let currentReleaseNotesHtml = null;
            if (releaseNotes) {
                if (releaseNotes['markdown']) {
                    fetch('/changelog/' + releaseNotes['markdown'])
                        .then((response) => response.text())
                        .then((markdownContent) => {
                            setMarkdownContent(markdownContent);
                        })
                        .catch((error) => {
                            console.error('Error fetching Markdown content:', error);
                        });
                } else {
                    currentReleaseNotesHtml = Object.keys(releaseNotes)
                        .map((element) => releaseNotes[element])
                        .join(' ');
                    setMarkdownContent(undefined);
                }
            }
            setCurrentReleaseNotes(currentReleaseNotesHtml);
        }
    }, [fixVersion, allReleaseNotes]);

    const gridReady = useCallback((params) => {
        setGridApi(params.api);
        searchBarEl.current.value = URLFilterItemKey;
        params.api.setQuickFilter(URLFilterItemKey);
        params.api.sizeColumnsToFit();
    }, []);

    const onQuickFilterChange = useCallback(
        (event) => {
            gridApi.setQuickFilter(event.target.value);
        },
        [gridApi]
    );

    const isRowMaster = useCallback((params) => {
        return params.moreInformation || params.deprecationNotes || params.breakingChangesNotes;
    }, []);

    const filterOnDepsAndBreaking = (field, changed) => {
        setFilterState((prevState) => {
            return {
                ...prevState,
                [field]: changed,
            };
        });
        setTimeout(() => {
            gridApi?.onFilterChanged();
        }, 10);
    };

    const onCheckboxChange = (event, filterTerm) => {
        function setTheFilter(column, filterValue, shouldFilter) {
            gridApi.getFilterInstance(column, (filterInstance) => {
                const currentFilterModel = filterInstance.getModel();
                const isCurrentFilterModel = !!currentFilterModel;
                let newValues = undefined;

                if (!shouldFilter && !isCurrentFilterModel) {
                    newValues = [...filterInstance.getValues()];
                    newValues.splice(newValues.indexOf(filterValue), 1);
                } else if (!shouldFilter && isCurrentFilterModel) {
                    newValues = [...currentFilterModel.values];
                    const filterIdx = newValues.indexOf(filterValue);
                    if (filterIdx > -1) newValues.splice(filterIdx, 1);
                } else if (shouldFilter && isCurrentFilterModel) {
                    newValues = [...currentFilterModel.values];
                    newValues.push(filterValue);
                } else {
                    return;
                }
                const newModel = { values: newValues, filterType: 'set' };
                filterInstance.setModel(newModel).then(() => {
                    gridApi.onFilterChanged();
                });
            });
        }

        switch (filterTerm) {
            case 'defect':
                setTheFilter('issueType', 'Bug', event.target.checked);
                break;
            case 'featureRequest':
                setTheFilter('issueType', 'Task', event.target.checked);
                break;
            case 'breakingChange':
                filterOnDepsAndBreaking('breakingChange', event.target.checked);
                break;
            case 'deprecated':
                filterOnDepsAndBreaking('deprecated', event.target.checked);
                break;
            default:
                break;
        }
    };

    const checkboxes = [
        { id: 'featureRequest', label: 'Feature Requests', checked: true },
        { id: 'defect', label: 'Defect', checked: true },
        { id: 'deprecated', label: 'Deprecations', checked: false },
        { id: 'breakingChange', label: 'Breaking Changes', checked: false },
    ];

    const doesExternalFilterPass = useCallback(
        (node) => {
            const isDeprecation = !!node.data.deprecationNotes;
            const isBreakingChange = !!node.data.breakingChangesNotes;

            if (filterState.deprecated && filterState.breakingChange) {
                return isDeprecation || isBreakingChange;
            } else if (filterState.deprecated) {
                return isDeprecation;
            } else if (filterState.breakingChange) {
                return isBreakingChange;
            } else {
                return true;
            }
        },
        [filterState]
    );

    const createLabeledCheckbox = (checkboxConfig) => {
        const { id, label, checked } = checkboxConfig;
        const key = `${id}-checkbox`;
        return (
            <label key={key} className={styles.checkboxLabel}>
                <input
                    id={key}
                    type="checkbox"
                    defaultChecked={checked}
                    onChange={(event) => onCheckboxChange(event, id)}
                ></input>{' '}
                {label}
            </label>
        );
    };

    const switchDisplayedFixVersion = (fixVersion) => {
        setFixVersion(fixVersion);
        let url = new URL(window.location);
        url.searchParams.set('fixVersion', fixVersion);
        window.history.pushState({}, '', url);
    };

    const releaseNotesTitle = fixVersion == ALL_FIX_VERSIONS ? versions[1] : fixVersion;

    return (
        <>
            {!IS_SSR && (
                <div className={classnames('page-margin', styles.container)}>
                    <h1>AG Grid Changelog</h1>

                    <section className={styles.header}>
                        <Alert type="idea">
                            The AG Grid Changelog lists the feature requests implemented and defects resolved across AG
                            Grid releases. If you can’t find the item you’re looking for, check the{' '}
                            <a href="https://www.ag-grid.com/ag-grid-pipeline/">Pipeline</a> for items in our backlog.
                        </Alert>

                        <div className={styles.controls}>
                            <input
                                type="text"
                                className={styles.searchBar}
                                placeholder={'Search changelog...'}
                                ref={searchBarEl}
                                onChange={onQuickFilterChange}
                            ></input>

                            <div>
                                {checkboxes.map((checkboxConfig) => createLabeledCheckbox(checkboxConfig))}

                                <label>
                                    Version:{' '}
                                    <VersionDropdownMenu
                                        versions={versions}
                                        onChange={switchDisplayedFixVersion}
                                        fixVersion={fixVersion}
                                    />
                                </label>
                            </div>
                        </div>

                        <ReleaseVersionNotes
                            title={releaseNotesTitle}
                            releaseNotes={currentReleaseNotes}
                            markdownContent={markdownContent}
                        />
                    </section>

                    <Grid
                        gridHeight={'66vh'}
                        columnDefs={COLUMN_DEFS}
                        rowData={rowData}
                        components={components}
                        defaultColDef={defaultColDef}
                        detailRowAutoHeight={true}
                        enableCellTextSelection={true}
                        detailCellRendererParams={detailCellRendererParams}
                        detailCellRenderer={'myDetailCellRenderer'}
                        isRowMaster={isRowMaster}
                        isExternalFilterPresent={() => true}
                        doesExternalFilterPass={doesExternalFilterPass}
                        masterDetail
                        onGridReady={gridReady}
                        onFirstDataRendered={() => {
                            applyFixVersionFilter();
                        }}
                    ></Grid>
                </div>
            )}
        </>
    );
};

export default Changelog;
