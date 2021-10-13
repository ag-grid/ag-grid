import React, { forwardRef, useState } from "react"
import styles from "./ChevronButtonRenderer.module.scss"
// import TreeClosed from "Users/louismoore/AG-Grid-Build/ag-grid/community-modules/core/src/styles/ag-theme-alpine/icons/tree-closed"
// import TreeOpen from "~Users/louismoore/AG-Grid-Build/ag-grid/community-modules/core/src/styles/ag-theme-alpine/icons/tree-open"

const TreeOpen =
  "https://raw.githubusercontent.com/LouisMoore-agGrid/js-ag-grid-52eyso/50413f659cdfbe903ec14d9a5d4b7cf175b76637/tree-open.svg"

const TreeClosed =
  "https://raw.githubusercontent.com/LouisMoore-agGrid/js-ag-grid-52eyso/aacef9f45dae7ea5822c4b76bf1c981a74451435/tree-closed.svg"

const ChevronButtonCellRenderer = forwardRef((props, ref) => {
  let iconState = props.node.expanded ? TreeOpen : TreeClosed
  let [icon, setIcon] = useState(iconState)
  return (
    <div className={styles["cell-renderer-container"]}>
      <div className={styles["chevron-container"]}>
        <input
          type="image"
          className={styles["chevron-img"]}
          alt={"chevron to toggle showing more information"}
          ref={ref}
          src={icon}
          style={{ cursor: "pointer" }}
          onClick={() => {
            props.api.setRowNodeExpanded(props.node, !props.node.expanded)
            iconState = props.node.expanded ? TreeOpen : TreeClosed
            setIcon(iconState)
          }}
        ></input>
      </div>
      <span>{props.value}</span>
    </div>
  )
})

export default ChevronButtonCellRenderer
