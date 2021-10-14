import React, { forwardRef, useState } from "react"
import styles from "./ChevronButtonRenderer.module.scss"
// import TreeClosed from "/theme-icons/alpine/tree-closed"
// import TreeOpen from "/theme-icons/alpine/tree-open"

const TreeOpen = "/theme-icons/alpine/tree-open.svg"

const TreeClosed = "/theme-icons/alpine/tree-closed.svg"

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
