import React, { forwardRef } from "react"
import styles from "./Changelog.module.scss"

const ReleaseVersionNotes = forwardRef((props, ref) => {
  return props.releaseNotes ? (
    <div
      className={styles["note"]}
      dangerouslySetInnerHTML={{ __html: props.releaseNotes }}
    ></div>
  ) : null
})

export default ReleaseVersionNotes
