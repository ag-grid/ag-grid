import React, { forwardRef } from "react"

const PaddingCellRenderer = forwardRef((props, ref) => {
  return (
    <div ref={ref} style={{ paddingLeft: "28px", fontSize: "16px" }}>
      {props.node.data.key}
    </div>
  )
})

export default PaddingCellRenderer
