import React, { forwardRef } from "react"

const DetailCellRenderer = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      style={{
        whiteSpace: "normal",
        padding: "25px",
        backgroundImage:
          "linear-gradient(#fff, #fff), linear-gradient(#fafafa, #fafafa)",
        backgroundClip: "content-box, padding-box",
      }}
      dangerouslySetInnerHTML={{ __html: props.message }}
    ></div>
  )
})

export default DetailCellRenderer
