import React, {useEffect, useRef, useState} from "react"
import LoadingOverlay from 'react-loading-overlay';

import VersionDropdownMenu from "../grid/versionDropdownMenu"
import styles from "./Changelog.module.scss"
import ReleaseVersionNotes from "./releaseVersionNotes.jsx"
import DetailCellRenderer from "../grid/detailCellRendererComponent";
import ButtonCellRenderer from "../grid/buttonCellRendererComponent";
import Grid from "../grid/Grid";

const COLUMN_DEFS = [
    {field: "key", minWidth: 100, width: 100},
    {
        field: "versions",
        headerName: "Version",
        minWidth: 105,
        width: 105,
    },

    {
        field: "summary",
        tooltipField: "summary",
        width: 500,
        minWidth: 500,
    },
    {
        field: "features",
        headerName: "Feature",
        minWidth: 225,
        width: 225,
        valueFormatter: params => {
            let isValue = !!params.value
            return isValue ? params.value.toString().replaceAll("_", " ") : undefined
        },
    },
    {
        field: "issueType",
        minWidth: 142,
        width: 142,
        valueFormatter: params =>
            params.value === "Bug" ? "Defect" : "Feature Request",
    },
    {
        colId: "moreInfo",
        headerName: "More Info",
        valueGetter: () => "",
        cellRendererSelector: params => {
            if (
                params.node.data.moreInformation ||
                params.node.data.deprecationNotes ||
                params.node.data.breakingChangesNotes
            ) {
                return {
                    component: "buttonCellRenderer",
                }
            }
            return null
        },
    },
    {
        field: "status",
        valueGetter: params => {
            // if (params.data.key === "AG-3723") debugger
            return params.data.status
        },
    },
    {
        field: "deprecated",
        valueGetter: params => {
          return params.node.data.deprecationNotes ? "Y" : "N"
        },
    },
    {
        field: "breakingChange",
        valueGetter: params => {
          return params.node.data.breakingChangesNotes ? "Y" : "N"
        },
    },
]

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true,
}

const detailCellRendererParams = params => {
    function produceHTML(fieldName, fieldInfo) {
        return `<br><strong>${fieldName}:</strong><br> ${fieldInfo}`
    }

    let moreInfo = params.data.moreInformation
        ? produceHTML("More Information", params.data.moreInformation)
        : ""
    let deprecationNotes = params.data.deprecationNotes
        ? produceHTML("Deprecation Notes", params.data.deprecationNotes)
        : ""
    let breakingChangesNotes = params.data.breakingChangesNotes
        ? produceHTML("Breaking Changes", params.data.breakingChangesNotes)
        : ""

    let linkToDocumentation = params.data.linkToDocumentation
        ? produceHTML("Link to Documentation", params.data.linkToDocumentation)
        : produceHTML(
            "Link to Documentation",
            "<a href='ag-grid.com'>Test Link</a>"
        )

    let message =
        moreInfo + deprecationNotes + breakingChangesNotes + linkToDocumentation
    message = message
        .replaceAll("\n\r", "<br>")
        .replaceAll("\n", "<br>")
        .replaceAll("\r", "<br>")

    function makeLinksFunctional(message) {
        let msgArr = message.split(" ")
        let linkStrIdx = msgArr.findIndex(word => word.includes("https://"))
        if (linkStrIdx > 0) {
            msgArr = msgArr.map(element => {
                if (element.includes("https://")) {
                    let beginningIndex = element.indexOf("http")
                    let endIndex = element.indexOf("<", beginningIndex)
                    let isEndIndex = endIndex >= 0
                    let length = 0
                    if (isEndIndex) {
                        length = endIndex - beginningIndex
                    }

                    let link = length
                        ? element.substr(element.indexOf("http"), length)
                        : element.substr(element.indexOf("http"))
                    let htmlLink = isEndIndex
                        ? `<a href="${link}">${link}</a>${element.substr(endIndex)}`
                        : `<a href="${link}">${link}</a>`
                    return htmlLink
                }
                return element
            })
            message = msgArr.join(" ")
        }
        return message
    }

    message = makeLinksFunctional(message)
    return {
        message: message,
    }
}

const IS_SSR = typeof window === "undefined"

const Changelog = () => {
    const [rowData, setRowData] = useState(null)
    const [gridApi, setGridApi] = useState(null)
    const [versions, setVersions] = useState([])
    const [allReleaseNotes, setAllReleaseNotes] = useState(null)
    const [currentReleaseNotes, setCurrentReleaseNotes] = useState(null)

    const dropdownRef = useRef()

    useEffect(() => {
        fetch("/changelog/changelog.json")
            .then(response => response.json())
            .then(data => {
                let gridVersions = data.map(row => row.versions[0])
                gridVersions.unshift("26.1.0")
                gridVersions.unshift("All Versions")
                gridVersions = new Set(gridVersions)
                setVersions(gridVersions)
                setRowData(data)
            })
        fetch("/changelog/releaseVersionNotes.json")
            .then(response => response.json())
            .then(data => {
                setAllReleaseNotes(data)
            })
    }, [])

    const gridReady = params => {
        // params.api.sizeColumnsToFit()
        setGridApi(params.api)
    }

    const onQuickFilterChange = event => {
        gridApi.setQuickFilter(event.target.value)
    }

    const doesExternalFilterPass = node => {
        return node.data.versions[0] === dropdownRef.current.value
    }

    const isExternalFilterPresent = () => {
        return dropdownRef.current.value !== "All"
    }

    const changeVersion = () => {
        gridApi.onFilterChanged()

        let version = dropdownRef.current.value
        changeDisplayedVersionNotes(version)
    }

    const changeDisplayedVersionNotes = version => {
        /*release version divs have have Ids containing "_" rather than "."
           eg. 25_0_0 instead of 25.0.0 */
        let formattedVersion = version.replaceAll(".", "_")
        let currentDisplayedDiv = document.querySelector(
            `[style*="display: block"]`
        )
        let divToBeDisplayed = document.querySelector(`[id*="${formattedVersion}"]`)
        if (currentDisplayedDiv) currentDisplayedDiv.style.display = "none"
        if (divToBeDisplayed) divToBeDisplayed.style.display = "block"

        let currentReleaseObj = allReleaseNotes.find(element =>
            element["release version"].includes(version)
        )

        let currentReleaseNotesHtml = ""
        if (currentReleaseObj) {
            currentReleaseNotesHtml = Object.keys(currentReleaseObj)
                .map(element => currentReleaseObj[element])
                .join(" ")
        }
        setCurrentReleaseNotes(currentReleaseNotesHtml)
    }

    const checkboxUnchecked = (event, filterTerm) => {
        function setTheFilter(column, filterValue, shouldFilter) {
            let filterInstance = gridApi.getFilterInstance(column)
            let currentFilterModel = filterInstance.getModel()
            let isCurrentFilterModel = !!currentFilterModel
            let newValues = undefined

            if (!shouldFilter && !isCurrentFilterModel) {
                newValues = [...filterInstance.getValues()]
                newValues.splice(newValues.indexOf(filterValue), 1)
            } else if (!shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values]
                let filterIdx = newValues.indexOf(filterValue)
                if (filterIdx > -1) newValues.splice(filterIdx, 1)
            } else if (shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values]
                newValues.push(filterValue)
            } else {
                return
            }
            let newModel = {values: newValues, filterType: "set"}
            filterInstance.setModel(newModel)
            gridApi.onFilterChanged()
        }

        switch (filterTerm) {
            case "defect":
                setTheFilter("issueType", "Bug", event.target.checked)
                break
            case "featureRequest":
                setTheFilter("issueType", "Task", event.target.checked)
                break
            case "breakingChange":
                setTheFilter("breakingChange", "Y", event.target.checked)
                break
            case "deprecated":
                setTheFilter("deprecated", "Y", event.target.checked)
                break
            default:
                break
        }
    }

    return (
        <>
            {!IS_SSR && (
                <div style={{height: "100%", width: "100%"}}>
                    <LoadingOverlay
                        active={!rowData}
                        spinner
                        text='Loading...'
                    >
                        <React.Suspense fallback={<div/>}>
                            <div className={styles["note"]}>
                                This page covers the full Changelog for all items for 8.x and above.
                                For the Summary Changelog, or the legacy changelog covering versions
                                7.x and above, please go{" "}
                                <a href="../change-log/changeLogIndex.php">here</a>. For a list of
                                up and coming Bug Fixes and Features please refer to our{" "}
                                <a href="../ag-grid-pipeline">Pipeline</a>. Documentation for
                                previous versions can be found{" "}
                                <a href="https://www.ag-grid.com/archive/">here.</a>
                            </div>

                            <div
                                className={"global-search-pane"}
                                style={{display: "inline-block", width: "100%"}}
                            >
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <input
                                        type="text"
                                        className={"clearable global-report-search"}
                                        placeholder={"Issue Search (eg. AG-1111/popup/feature)..."}
                                        style={{height: "50px", width: "75%"}}
                                        onChange={onQuickFilterChange}
                                    ></input>
                                    <VersionDropdownMenu
                                        versions={versions}
                                        onChange={changeVersion}
                                        ref={dropdownRef}
                                    />
                                </div>

                                <div id="checkbox-container">
                                    <input
                                        id="featureRequest-checkbox"
                                        type="checkbox"
                                        defaultChecked={true}
                                        onChange={event => checkboxUnchecked(event, "featureRequest")}
                                    ></input>
                                    <label
                                        htmlFor="featureRequest-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Feature Requests
                                    </label>
                                    <input
                                        id="defect-checkbox"
                                        onChange={event => checkboxUnchecked(event, "defect")}
                                        type="checkbox"
                                        defaultChecked
                                    ></input>
                                    <label
                                        htmlFor="defect-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Defects
                                    </label>
                                    <input
                                        id="deprecated-checkbox"
                                        onChange={event => checkboxUnchecked(event, "deprecated")}
                                        type="checkbox"
                                        defaultChecked
                                    ></input>
                                    <label
                                        htmlFor="deprecated-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Deprecations
                                    </label>
                                    <input
                                        id="breakingChange-checkbox"
                                        onChange={event => checkboxUnchecked(event, "breakingChange")}
                                        type="checkbox"
                                        defaultChecked
                                    ></input>
                                    <label
                                        htmlFor="breakingChange-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Breaking Changes
                                    </label>
                                </div>
                            </div>

                            <ReleaseVersionNotes releaseNotes={currentReleaseNotes}/>

                            <div
                                className="ag-theme-alpine"
                                style={{height: "100vh", width: "100%"}}
                            >
                                <Grid
                                    columnDefs={COLUMN_DEFS}
                                    rowData={rowData}
                                    frameworkComponents={{
                                        myDetailCellRenderer: DetailCellRenderer,
                                        buttonCellRenderer: ButtonCellRenderer,
                                    }}
                                    defaultColDef={defaultColDef}
                                    detailRowAutoHeight={true}
                                    doesExternalFilterPass={doesExternalFilterPass}
                                    isExternalFilterPresent={isExternalFilterPresent}
                                    enableCellTextSelection={true}
                                    detailCellRendererParams={detailCellRendererParams}
                                    detailCellRenderer={"myDetailCellRenderer"}
                                    masterDetail
                                    onGridReady={gridReady}
                                ></Grid>
                            </div>
                        </React.Suspense>
                    </LoadingOverlay>
                </div>
            )}
        </>
    )
}

export default Changelog
