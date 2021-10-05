import React, { forwardRef } from "react"

const ButtonCellRenderer = forwardRef((props, ref) => {
  return (
    <button
      ref={ref}
      className={"btn btn-primary"}
      onClick={() => {
        let isExpanded = props.node.expanded
        props.api.setRowNodeExpanded(props.node, !isExpanded)
      }}
    >
      More Info
    </button>
  )
})

export default ButtonCellRenderer
