import React, { forwardRef } from "react"

const PaddingCellRenderer = forwardRef((props, ref) => {
  return (
    <div ref={ref} style={{ paddingLeft: "28px" }}>
      {props.node.data.summary}
    </div>
  )
})

export default PaddingCellRenderer
