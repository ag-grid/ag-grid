import React, {useEffect, useState} from "react"
import LoadingOverlay from 'react-loading-overlay';
import styles from "./Pipeline.module.scss"
import DetailCellRenderer from "../grid/detailCellRendererComponent";
import ButtonCellRenderer from "../grid/buttonCellRendererComponent";
import Grid from "../grid/Grid";

const COLUMN_DEFS = [
    {field: "key", headerName: "Issue ID", width: 120},
    {
        field: "summary",
        headerName: "Summary",
        tooltipField: "summary",
        minWidth: 700,
    },
    {
        field: "issueType",
        valueFormatter: params =>
            params.value === "Bug" ? "Defect" : "Feature Request",
    },
    {
        field: "features",
        headerName: "Feature",
        valueFormatter: params => {
            let isValue = !!params.value
            return isValue ? params.value.toString().replaceAll("_", " ") : undefined
        },
    },

    {
        field: "status",
        valueGetter: params => {
            let fixVersionsArr = params.data.versions
            let hasFixVersion = fixVersionsArr.length > 0
            if (hasFixVersion) {
                let latestFixVersion = fixVersionsArr.length - 1
                let fixVersion = fixVersionsArr[latestFixVersion]
                if (fixVersion === "Next" && params.data.status === "Backlog") {
                    return "Scheduled"
                }
            }
            if (params.data.status !== "Backlog") {
                return "Scheduled"
            } else {
                return "Backlog"
            }
        },
    },
    {
        colId: "moreInfo",
        headerName: "More Info",
        valueGetter: () => "",
        cellRendererSelector: params => {
            if (params.node.data.moreInformation) {
                return {
                    component: "buttonCellRenderer",
                }
            }
            return null
        },
    },
]

const defaultColDef = {
    resizable: true,
    filter: true,
}

const IS_SSR = typeof window === "undefined"

const isRowMaster = row => {
    if (row) {
        let hasMoreInfo = row.moreInformation
        return hasMoreInfo
    }
    return false
}

const detailCellRendererParams = params => {
    let message = params.data.moreInformation
    message = message.replaceAll("\n\r", "<br>")
    message = message.replaceAll("\n", "<br>")
    message = message.replaceAll("\r", "<br>")

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
    let res = {}
    res.message = message

    return res
}

const Pipeline = () => {
    const [rowData, setRowData] = useState(null)
    const [gridApi, setGridApi] = useState(null)

    useEffect(() => {
        fetch("/pipeline/pipeline.json")
            .then(response => response.json())
            .then(data => {
                setRowData(data)
            })
    }, [])

    const onQuickFilterChange = event => {
        gridApi.setQuickFilter(event.target.value)
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
            case "bug":
                setTheFilter("issueType", "Bug", event.target.checked)
                break
            case "featureRequest":
                setTheFilter("issueType", "Task", event.target.checked)
                break
            case "nextRelease":
                setTheFilter("status", "Backlog", !event.target.checked)
                break
            default:
                break
        }
    }

    const gridReady = params => {
        setGridApi(params.api)
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
                                <p>
                                    The AG Grid pipeline visualises the features and bug fixes we have
                                    in our internal issue tracker (JIRA). The issues commonly have an
                                    ID, which looks like <code>AG-XXX</code>.
                                </p>
                            </div>
                            <div
                                className={"global-search-pane"}
                                style={{display: "inline-block", width: "100%"}}
                            >
                                <input
                                    type="text"
                                    className={"clearable global-report-search"}
                                    placeholder={"Issue Search (eg. AG-1111/popup/feature)..."}
                                    style={{height: "50px", width: "75%"}}
                                    onChange={onQuickFilterChange}
                                ></input>
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
                                        id="bug-checkbox"
                                        onChange={event => checkboxUnchecked(event, "bug")}
                                        type="checkbox"
                                        defaultChecked
                                    ></input>
                                    <label
                                        htmlFor="bug-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Defects
                                    </label>
                                    <input
                                        id="nextRelease-checkbox"
                                        onChange={event => checkboxUnchecked(event, "nextRelease")}
                                        type="checkbox"
                                    ></input>
                                    <label
                                        htmlFor="nextRelease-checkbox"
                                        style={{paddingLeft: "10px", paddingRight: "10px"}}
                                    >
                                        Next Release
                                    </label>
                                </div>
                            </div>
                            <div
                                className="ag-theme-alpine"
                                style={{height: "100%", width: "100%"}}
                            >
                                <Grid
                                    columnDefs={COLUMN_DEFS}
                                    isRowMaster={isRowMaster}
                                    detailRowAutoHeight={true}
                                    frameworkComponents={{
                                        myDetailCellRenderer: DetailCellRenderer,
                                        buttonCellRenderer: ButtonCellRenderer,
                                    }}
                                    defaultColDef={defaultColDef}
                                    enableCellTextSelection={true}
                                    detailCellRendererParams={detailCellRendererParams}
                                    detailCellRenderer={"myDetailCellRenderer"}
                                    masterDetail={true}
                                    rowData={rowData}
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

export default Pipeline
