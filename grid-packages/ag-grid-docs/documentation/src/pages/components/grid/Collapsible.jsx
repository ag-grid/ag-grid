import React from "react"
import chevronStyle from "./ChevronButtonRenderer.module.scss"
import styles from "./Collapsible.module.scss"

const Collapsible = props => {
    return (
        <div>
            <button className={styles[`${props.class}`]}
                onClick={props.onClick ? props.onClick : {}}
            >{props.message}
                <div className={chevronStyle['chevron-container']} style={{ marginLeft: '14px' }}>
                    <img alt={"show/hide toggle"} src={props.chevronState} style={{ width: '20px', height: '20px' }} className={chevronStyle['chevron-img']}></img>
                </div>
            </button>
        </div>
    )
}
export default Collapsible
