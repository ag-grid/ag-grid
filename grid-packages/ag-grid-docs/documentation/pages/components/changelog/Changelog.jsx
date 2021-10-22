import React, {useEffect, useState} from "react"
import VersionDropdownMenu from "../grid/VersionDropdownMenu"
import styles from "./Changelog.module.scss"
import ReleaseVersionNotes from "./ReleaseVersionNotes.jsx"
import DetailCellRenderer from "../grid/DetailCellRendererComponent"
import PaddingCellRenderer from "../grid/PaddingCellRenderer"
import ChevronButtonCellRenderer from "../grid/ChevronButtonRenderer"
import Grid from "../grid/Grid"
import DepOrBreakFilterComponent from "../grid/DepOrBreakFilterComponent"

import "./overrides.css"

const COLUMN_DEFS = [
    {
        field: "key",
        headerName: "Issue",
        headerClass: styles["header-padding-class"],
        width: 131,
        filter: false,
        cellRendererSelector: params => {
            if (
                params.node.data.moreInformation ||
                params.node.data.deprecationNotes ||
                params.node.data.breakingChangesNotes
            ) {
                return {
                    component: "chevronButtonCellRenderer",
                }
            }
            return {
                component: "paddingCellRenderer",
            }
        },
    },
    {
        field: "versions",
        headerName: "Version",
        width: 112,
    },

    {
        field: "summary",
        tooltipField: "summary",
        filter: false,
        width: 635,
    },
    {
        field: "issueType",
        width: 155,
        valueFormatter: params => params.value === "Bug" ? "Defect" : "Feature Request",
        filterParams: {
            valueFormatter: params => params.colDef.valueFormatter(params),
        },
    },
    {
        field: "status",
        width: 100,
        valueGetter: params => {
            return params.data.resolution
        },
    },
    {
        field: "features",
        headerName: "Feature",
        width: 142,
        valueFormatter: params => !!params.value ? params.value.toString().replaceAll("_", " ") : undefined,
        tooltipValueGetter: params => params.colDef.valueFormatter(params),
        filterParams: {
            valueFormatter: params => params.colDef.valueFormatter(params),
        },
    },
    {
        field: "deprecated",
        hide: true,
        filter: "depOrBreakFilterComponent",
        valueGetter: params => params.node.data.deprecationNotes ? "Y" : "N",
    },
    {
        field: "breakingChange",
        hide: true,
        valueGetter: params => params.node.data.breakingChangesNotes ? "Y" : "N",
    },
]

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true,
    suppressMenu: true,
    cellClass: styles["font-class"],
    headerClass: styles["font-class"],
    suppressKeyboardEvent: params => {
        if (
            params.event.key === "Enter" &&
            params.node.master &&
            params.event.type === "keydown"
        ) {
            params.api
                .getCellRendererInstances({rowNodes: [params.node]})[0]
                .getFrameworkComponentInstance()
                .clickHandlerFunc()
            return true
        }
        return false
    },
}

const detailCellRendererParams = params => {
    function produceHTML(fieldName, fieldInfo) {
        return fieldName !== "Link to Documentation"
            ? `<strong>${fieldName}:</strong><br> ${fieldInfo}<br><br>`
            : `<strong>${fieldName}:</strong><br> ${fieldInfo}`
    }

    const moreInfo = params.data.moreInformation ? produceHTML("More Information", params.data.moreInformation) : "";
    const deprecationNotes = params.data.deprecationNotes ? produceHTML("Deprecation Notes", params.data.deprecationNotes) : "";
    const breakingChangesNotes = params.data.breakingChangesNotes ? produceHTML("Breaking Changes", params.data.breakingChangesNotes) : "";
    const linkToDocumentation = params.data.documentationUrl ? produceHTML("Link to Documentation", params.data.documentationUrl) : "";

    function makeLinksFunctional(message) {
        let msgArr = message.split(" ")
        const linkStrIdx = msgArr.findIndex(word => word.includes("https://"));
        if (linkStrIdx > 0) {
            msgArr = msgArr.map(element => {
                if (element.includes("https://")) {
                    const beginningIndex = element.indexOf("http");
                    const endIndex = element.indexOf("<", beginningIndex);
                    const isEndIndex = endIndex >= 0;
                    let length = 0
                    if (isEndIndex) {
                        length = endIndex - beginningIndex
                    }

                    const link = length
                        ? element.substr(element.indexOf("http"), length)
                        : element.substr(element.indexOf("http"));
                    const htmlLink = isEndIndex
                        ? `<a class=${styles["anchor-tag-class"]} href="${link}"
             target="_blank">${link}</a>${element.substr(endIndex)}`
                        : `<a class=${styles["anchor-tag-class"]} target="_blank" href="${link}">${link}</a>`;
                    return element.substr(0, beginningIndex) + htmlLink
                }
                return element
            })
            message = msgArr.join(" ")
        }
        return message
    }

    const message = makeLinksFunctional((moreInfo + deprecationNotes + breakingChangesNotes + linkToDocumentation)
        .replaceAll("\n\r", "<br>")
        .replaceAll("\n", "<br>")
        .replaceAll("\r", "<br>")
    )
    return {
        message: message,
    }
}

const ALL_FIX_VERSIONS = "All Versions";

const extractFixVersionParameter = location => location && location.search ? new URLSearchParams(location.search).get("fixVersion") : ALL_FIX_VERSIONS;

const IS_SSR = typeof window === "undefined"

const Changelog = ({location}) => {
    const [rowData, setRowData] = useState(null)
    const [gridApi, setGridApi] = useState(null)
    const [versions, setVersions] = useState([])
    const [allReleaseNotes, setAllReleaseNotes] = useState(null)
    const [currentReleaseNotes, setCurrentReleaseNotes] = useState(null)
    const [fixVersion, setFixVersion] = useState(extractFixVersionParameter(location));

    useEffect(() => {
        fetch("/changelog/changelog.json")
            .then(response => response.json())
            .then(data => {
                const gridVersions = [ALL_FIX_VERSIONS, ...data.map(row => row.versions[0])]
                setVersions([...new Set(gridVersions)])
                setRowData(data)
            })
        fetch("/changelog/releaseVersionNotes.json")
            .then(response => response.json())
            .then(data => {
                setAllReleaseNotes(data)
            })
    }, [])

    useEffect(() => {
        if (gridApi && fixVersion) {
            const versionsFilterComponent = gridApi.getFilterInstance('versions');
            const newModel = {values: fixVersion === ALL_FIX_VERSIONS ? [versions] : [fixVersion], filterType: "set"};
            versionsFilterComponent.setModel(newModel)
            gridApi.onFilterChanged();
        }
    }, [gridApi, fixVersion, versions]);

    useEffect(() => {
        if (fixVersion && allReleaseNotes) {
            const releaseNotes = allReleaseNotes.find(element => element["release version"].includes(fixVersion));

            let currentReleaseNotesHtml = null;
            if (releaseNotes) {
                currentReleaseNotesHtml = Object.keys(releaseNotes)
                    .map(element => releaseNotes[element])
                    .join(" ")
            }
            setCurrentReleaseNotes(currentReleaseNotesHtml)
        }
    }, [fixVersion, allReleaseNotes]);

    const gridReady = params => {
        setGridApi(params.api);
    }

    const onQuickFilterChange = event => {
        gridApi.setQuickFilter(event.target.value)
    }

    const isRowMaster = params => {
        return (
            params.moreInformation ||
            params.deprecationNotes ||
            params.breakingChangesNotes
        )
    }

    const filterOnDepsAndBreaking = (field, changed) => {
        gridApi.getFilterInstance("deprecated", instance => {
            instance.getFrameworkComponentInstance().checkboxChanged(field, changed)
        })
    }

    const checkboxUnchecked = (checked, filterTerm) => {
        function setTheFilter(column, filterValue, shouldFilter) {
            const filterInstance = gridApi.getFilterInstance(column);
            const currentFilterModel = filterInstance.getModel();
            const isCurrentFilterModel = !!currentFilterModel;
            let newValues = undefined

            if (!shouldFilter && !isCurrentFilterModel) {
                newValues = [...filterInstance.getValues()]
                newValues.splice(newValues.indexOf(filterValue), 1)
            } else if (!shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values]
                const filterIdx = newValues.indexOf(filterValue);
                if (filterIdx > -1) newValues.splice(filterIdx, 1)
            } else if (shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values]
                newValues.push(filterValue)
            } else {
                return
            }
            const newModel = {values: newValues, filterType: "set"};
            filterInstance.setModel(newModel)
            gridApi.onFilterChanged()
        }

        switch (filterTerm) {
            case "defect":
                setTheFilter("issueType", "Bug", checked)
                break
            case "featureRequest":
                setTheFilter("issueType", "Task", checked)
                break
            case "breakingChange":
                filterOnDepsAndBreaking("breakingChange", checked)
                break
            case "deprecated":
                filterOnDepsAndBreaking("deprecated", checked)
                break
            default:
                break
        }
    }

    return (
        <>
            {!IS_SSR && (
                <div style={{height: "100%", width: "99%%", marginLeft: "5px", marginRight: "5px"}}>
                    <div className={styles["note"]}>
                        The AG Grid Changelog lists the feature requests implemented and
                        defects resolved across AG Grid releases. If you can’t find the item
                        you’re looking for, check the{" "}
                        <a href="https://www.ag-grid.com/ag-grid-pipeline/">Pipeline</a> for
                        items in our backlog.
                    </div>

                    <div
                        className={"global-search-pane"}
                        style={{
                            display: "flex",
                            width: "100%",
                            paddingBottom: "20px",
                            paddingTop: "10px",
                        }}
                    >
                        <div
                            style={{
                                width: "35%",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="text"
                                className={"clearable global-report-search"}
                                placeholder={"Search changelog... (e.g. AG-1280 or filtering)"}
                                style={{
                                    height: "50px",
                                    width: "100%",
                                    fontSize: "20px",
                                }}
                                onChange={onQuickFilterChange}
                            ></input>
                        </div>

                        <div
                            id="checkbox-container"
                            style={{
                                display: "flex",
                                paddingTop: "10px",
                                paddingBottom: "10px",
                                paddingLeft: "20px",
                            }}
                        >
                            <div className={styles["checkbox-label-div"]}>
                                <div>
                                    <input
                                        id="featureRequest-checkbox"
                                        type="checkbox"
                                        className={styles["checkbox-class"]}
                                        defaultChecked
                                        onChange={event =>
                                            checkboxUnchecked(event.target.checked, "featureRequest")
                                        }
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="featureRequest-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Feature Requests
                                    </label>
                                </div>
                            </div>
                            <div className={styles["checkbox-label-div"]}>
                                <div>
                                    <input
                                        id="defect-checkbox"
                                        onChange={event => checkboxUnchecked(event.target.checked, "defect")}
                                        type="checkbox"
                                        className={styles["checkbox-class"]}
                                        defaultChecked
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="defect-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Defects
                                    </label>
                                </div>
                            </div>
                            <div className={styles["checkbox-label-div"]}>
                                <div>
                                    <input
                                        id="deprecated-checkbox"
                                        className={styles["checkbox-class"]}
                                        onChange={event => checkboxUnchecked(event.target.checked, "deprecated")}
                                        type="checkbox"
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="deprecated-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Deprecations
                                    </label>
                                </div>
                            </div>
                            <div
                                className={styles["checkbox-label-div"]}
                                style={{paddingRight: "10px"}}
                            >
                                <div>
                                    <input
                                        id="breakingChange-checkbox"
                                        className={styles["checkbox-class"]}
                                        onChange={event =>
                                            checkboxUnchecked(event.target.checked, "breakingChange")
                                        }
                                        type="checkbox"
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="breakingChange-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Breaking Changes
                                    </label>
                                </div>
                            </div>
                            <VersionDropdownMenu
                                versions={versions}
                                onChange={fixVersion => setFixVersion(fixVersion)}
                                fixVersion={fixVersion}
                            />
                        </div>
                    </div>

                    <ReleaseVersionNotes releaseNotes={currentReleaseNotes}/>
                    <Grid
                        gridHeight={"66vh"}
                        columnDefs={COLUMN_DEFS}
                        rowData={rowData}
                        frameworkComponents={{
                            myDetailCellRenderer: DetailCellRenderer,
                            paddingCellRenderer: PaddingCellRenderer,
                            chevronButtonCellRenderer: ChevronButtonCellRenderer,
                            depOrBreakFilterComponent: DepOrBreakFilterComponent,
                        }}
                        defaultColDef={defaultColDef}
                        detailRowAutoHeight={true}
                        enableCellTextSelection={true}
                        detailCellRendererParams={detailCellRendererParams}
                        detailCellRenderer={"myDetailCellRenderer"}
                        isRowMaster={isRowMaster}
                        masterDetail
                        onGridReady={gridReady}
                        onFirstDataRendered={() => gridApi.sizeColumnsToFit()}
                    ></Grid>
                </div>
            )}
        </>
    )
}

export default Changelog
