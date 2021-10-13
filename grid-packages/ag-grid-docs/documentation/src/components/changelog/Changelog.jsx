import React, { useEffect, useRef, useState } from "react"
import VersionDropdownMenu from "../grid/VersionDropdownMenu"
import styles from "./Changelog.module.scss"
import ReleaseVersionNotes from "./ReleaseVersionNotes.jsx"
import DetailCellRenderer from "../grid/DetailCellRendererComponent"
import PaddingCellRenderer from "../grid/PaddingCellRenderer"
import ChevronButtonCellRenderer from "../grid/ChevronButtonRenderer"
import Grid from "../grid/Grid"

const removeNFormatter = params => {
  return params.value === "Y" ? "Y" : ""
}

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
    width: 500,
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
    width: 143,
    valueGetter: params => {
      return params.data.resolution
    },
  },
  {
    field: "features",
    headerName: "Feature",
    width: 143,
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
  {
    field: "deprecated",
    width: 147,
    valueGetter: params => {
      return params.node.data.deprecationNotes ? "Y" : "N"
    },
    valueFormatter: removeNFormatter,
  },
  {
    field: "breakingChange",
    width: 185,
    valueGetter: params => {
      return params.node.data.breakingChangesNotes ? "Y" : "N"
    },
    valueFormatter: removeNFormatter,
  },
]

const defaultColDef = {
  filter: true,
  sortable: true,
  resizable: true,
  cellClass: styles["font-class"],
  headerClass: styles["font-class"],
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

  let linkToDocumentation = params.data.documentationUrl
    ? produceHTML("Link to Documentation", params.data.documentationUrl)
    : ""

  let message = moreInfo + deprecationNotes + breakingChangesNotes
  // + linkToDocumentation
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
          return element.substr(0, beginningIndex) + htmlLink
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
      let newModel = { values: newValues, filterType: "set" }
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
        setTheFilter("breakingChange", "N", !event.target.checked)
        break
      case "deprecated":
        setTheFilter("deprecated", "N", !event.target.checked)
        break
      default:
        break
    }
  }

  return (
    <>
      {!IS_SSR && (
        <div style={{ height: "100%", width: "100%" }}>
          <div className={styles["note"]}>
            The AG Grid Changelog lists the feature request and defects
            implemented across AG Grid releases. If you can’t find the item
            you’re looking for, check the <a href="/pipeline">Pipeline</a> for
            items in our backlog.
          </div>

          <div className={"global-search-pane"}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <input
                type="text"
                className={"clearable global-report-search"}
                placeholder={"Issue Search (eg. AG-1111/popup/feature)..."}
                style={{ height: "50px", width: "100%" }}
                onChange={onQuickFilterChange}
              ></input>
            </div>

            <div
              id="checkbox-container"
              style={{
                display: "flex",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            >
              <div style={{ marginLeft: "auto" }}>
                <input
                  id="featureRequest-checkbox"
                  type="checkbox"
                  defaultChecked={true}
                  onChange={event => checkboxUnchecked(event, "featureRequest")}
                ></input>
                <label
                  htmlFor="featureRequest-checkbox"
                  className={styles["label-for-checkboxes"]}
                >
                  Feature Requests
                </label>
              </div>
              <div className={styles["checkbox-label-div"]}>
                <input
                  id="defect-checkbox"
                  onChange={event => checkboxUnchecked(event, "defect")}
                  type="checkbox"
                  defaultChecked
                ></input>
                <label
                  htmlFor="defect-checkbox"
                  className={styles["label-for-checkboxes"]}
                >
                  Defects
                </label>
              </div>
              <div className={styles["checkbox-label-div"]}>
                <input
                  id="deprecated-checkbox"
                  onChange={event => checkboxUnchecked(event, "deprecated")}
                  type="checkbox"
                ></input>
                <label
                  htmlFor="deprecated-checkbox"
                  className={styles["label-for-checkboxes"]}
                >
                  Deprecations
                </label>
              </div>
              <div
                className={styles["checkbox-label-div"]}
                style={{ paddingRight: "10px" }}
              >
                <input
                  id="breakingChange-checkbox"
                  onChange={event => checkboxUnchecked(event, "breakingChange")}
                  type="checkbox"
                ></input>
                <label
                  htmlFor="breakingChange-checkbox"
                  className={styles["label-for-checkboxes"]}
                >
                  Breaking Changes
                </label>
              </div>
              <VersionDropdownMenu
                versions={versions}
                onChange={changeVersion}
                ref={dropdownRef}
              />
            </div>
          </div>

          <ReleaseVersionNotes releaseNotes={currentReleaseNotes} />
          <Grid
            gridHeight={"66vh"}
            columnDefs={COLUMN_DEFS}
            rowData={rowData}
            frameworkComponents={{
              myDetailCellRenderer: DetailCellRenderer,
              paddingCellRenderer: PaddingCellRenderer,
              chevronButtonCellRenderer: ChevronButtonCellRenderer,
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
      )}
    </>
  )
}

export default Changelog
