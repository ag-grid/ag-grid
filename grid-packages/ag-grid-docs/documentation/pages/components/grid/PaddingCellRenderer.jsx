import React, {forwardRef} from "react"

const IS_SSR = typeof window === "undefined"

const PaddingCellRenderer = forwardRef((props, ref) => {
    return <>{!IS_SSR && <div ref={ref} style={{paddingLeft: "28px", fontSize: "16px"}}>{props.node.data.key}</div>}</>
})

export default PaddingCellRenderer
