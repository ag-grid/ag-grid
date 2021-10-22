import React, {useEffect, useState} from "react"
import styles from "./Pipeline.module.scss"
import DetailCellRenderer from "../grid/DetailCellRendererComponent"
import PaddingCellRenderer from "../grid/PaddingCellRenderer"
import Grid from "../grid/Grid"
import ChevronButtonCellRenderer from "../grid/ChevronButtonRenderer"

const COLUMN_DEFS = [
    {
        field: "key",
        headerName: "Issue",
        width: 131,
        filter: false,
        headerClass: styles["header-padding-class"],
        cellRendererSelector: params => {
            if (
                params.node.data.moreInformation ||
                params.node.data.deprecationNotes ||
                params.node.data.breakingChangesNotes
            ) {
                return {
                    component: "chevronButtonRenderer",
                }
            }
            return {
                component: "paddingCellRenderer",
            }
        },
    },
    {
        field: "summary",
        tooltipField: "summary",
        width: 737,
        filter: false,
    },
    {
        field: "issueType",
        width: 155,
        valueFormatter: params =>
            params.value === "Bug" ? "Defect" : "Feature Request",
        filterParams: {
            valueFormatter: params => {
                return params.colDef.valueFormatter(params)
            },
        },
    },
    {
        field: "status",
        width: 131,
        valueGetter: params => {
            let fixVersionsArr = params.data.versions
            let hasFixVersion = fixVersionsArr.length > 0
            if (hasFixVersion) {
                let latestFixVersion = fixVersionsArr.length - 1
                let fixVersion = fixVersionsArr[latestFixVersion]
                if (fixVersion === "Next" && params.data.status === "Backlog") {
                    return "Next Release"
                }
            }
            if (params.data.status !== "Backlog") {
                return "Next Release"
            } else {
                return "Backlog"
            }
        },
    },
    {
        field: "features",
        headerName: "Feature",
        width: 127,
        valueFormatter: params => {
            let isValue = !!params.value
            return isValue ? params.value.toString().replaceAll("_", " ") : undefined
        },
        tooltipValueGetter: params => {
            return params.colDef.valueFormatter(params)
        },
        filterParams: {
            valueFormatter: params => {
                return params.colDef.valueFormatter(params)
            },
        },
    },
]

const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    cellClass: styles["font-class"],
    headerClass: styles["font-class"],
    suppressMenu: true,
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
                        ? `<a class=${styles["anchor-tag-class"]} href="${link}"
          target="_blank">${link}</a>${element.substr(endIndex)}`
                        : `<a class=${styles["anchor-tag-class"]} target="_blank" href="${link}">${link}</a>`
                    return element.substr(0, beginningIndex) + htmlLink
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
                <div style={{height: "100%", width: "99%%", marginLeft: "5px", marginRight: "5px"}}>
                    <div className={styles["note"]}>
                        <p>
                            The AG Grid pipeline lists the feature requests and active bugs in
                            our product backlog. Use it to see the items scheduled for our
                            next release or to look up the status of a specific item. If you
                            can’t find the item you’re looking for, check the{" "}
                            <a href="https://www.ag-grid.com/ag-grid-changelog/">Changelog</a>{" "}
                            containing the list of completed items.
                        </p>
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
                                width: "40%",
                            }}
                        >
                            <input
                                type="text"
                                className={"clearable global-report-search"}
                                placeholder={"Search pipeline… (e.g. AG-1280 or filtering)"}
                                style={{height: "50px", width: "100%", fontSize: "20px"}}
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
                                width: "75%",
                            }}
                        >
                            <div className={styles["checkbox-label-div"]}>
                                <div>
                                    <input
                                        id="featureRequest-checkbox"
                                        type="checkbox"
                                        className={styles["checkbox-class"]}
                                        defaultChecked={true}
                                        onChange={event =>
                                            checkboxUnchecked(event, "featureRequest")
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
                                        id="bug-checkbox"
                                        onChange={event => checkboxUnchecked(event, "bug")}
                                        className={styles["checkbox-class"]}
                                        type="checkbox"
                                        defaultChecked
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="bug-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Defects
                                    </label>
                                </div>
                            </div>
                            <div className={styles["checkbox-label-div"]}>
                                <div>
                                    <input
                                        className={styles["checkbox-class"]}
                                        id="nextRelease-checkbox"
                                        onChange={event => checkboxUnchecked(event, "nextRelease")}
                                        type="checkbox"
                                    ></input>
                                </div>
                                <div>
                                    <label
                                        htmlFor="nextRelease-checkbox"
                                        className={styles["label-for-checkboxes"]}
                                    >
                                        Next Release
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Grid
                        gridHeight={"63vh"}
                        columnDefs={COLUMN_DEFS}
                        isRowMaster={isRowMaster}
                        detailRowAutoHeight={true}
                        frameworkComponents={{
                            myDetailCellRenderer: DetailCellRenderer,
                            paddingCellRenderer: PaddingCellRenderer,
                            chevronButtonRenderer: ChevronButtonCellRenderer,
                        }}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        detailCellRendererParams={detailCellRendererParams}
                        detailCellRenderer={"myDetailCellRenderer"}
                        masterDetail={true}
                        rowData={rowData}
                        onGridReady={gridReady}
                        onFirstDataRendered={() => gridApi.sizeColumnsToFit()}
                    ></Grid>
                </div>
            )}
        </>
    )
}

export default Pipeline
