import React, {forwardRef, useImperativeHandle, useState} from "react"
import styles from "./ChevronButtonRenderer.module.scss"

const TreeOpen = "/theme-icons/alpine/tree-open.svg"
const TreeClosed = "/theme-icons/alpine/tree-closed.svg"

const IS_SSR = typeof window === "undefined"

const ChevronButtonCellRenderer = forwardRef((props, ref) => {
    if(IS_SSR) {
        return null;
    }

    let [icon, setIcon] = useState(props.node.expanded ? TreeOpen : TreeClosed)

    function clickHanlder() {
        props.api.setRowNodeExpanded(props.node, !props.node.expanded)
        setIcon(props.node.expanded ? TreeOpen : TreeClosed)
    }

    useImperativeHandle(ref, () => {
        return {
            clickHandlerFunc: clickHanlder,
        }
    })
    return (
        <div className={styles["cell-renderer-container"]}>
            <div className={styles["chevron-container"]}>
                <input
                    type="image"
                    className={styles["chevron-img"]}
                    alt={"chevron to toggle showing more information"}
                    ref={ref}
                    src={icon}
                    style={{cursor: "pointer"}}
                    onClick={() => {
                        clickHanlder()
                    }}
                ></input>
            </div>
            <span>{props.value}</span>
        </div>
    )
})

export default ChevronButtonCellRenderer
