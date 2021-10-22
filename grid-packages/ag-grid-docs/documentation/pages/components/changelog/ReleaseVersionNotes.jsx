import React from "react"
import styles from "./Changelog.module.scss"

const ReleaseVersionNotes = props =>
    (props.releaseNotes && <div className={styles["note"]} dangerouslySetInnerHTML={{__html: props.releaseNotes}}></div>);

export default ReleaseVersionNotes
