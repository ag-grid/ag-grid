import React, { useState } from "react"
import styles from "./Changelog.module.scss"
import chevronStyle from "../grid/ChevronButtonRenderer.module.scss"

const TreeOpen = "/theme-icons/alpine/tree-open.svg"
const TreeClosed = "/theme-icons/alpine/tree-closed.svg"

const ReleaseVersionNotes = props =>{
let [releaseNoteVisibility, setReleaseNoteVisibility] = useState('block')
let [chevronState, setChevronState] = useState(TreeOpen)

   return( props.releaseNotes ? (
    <div>
        <button className={styles['release-notes-collapsible']}
            onClick={()=>{
                            if(releaseNoteVisibility === 'block'){
                                setReleaseNoteVisibility('none')
                                setChevronState(TreeClosed)
                            }else{
                                setReleaseNoteVisibility('block')
                                setChevronState(TreeOpen)
                            }
                        }
                    }   
        >Release Notes
            <div className={chevronStyle['chevron-container']} style={{marginLeft: '5px'}}>
                <img alt={"release notes show/hide toggle"} src={chevronState} style={{width: '20px', height: '20px'}} className={chevronStyle['chevron-img']}></img>
            </div>
        </button>   
        <div style={{display: releaseNoteVisibility, marginTop: '1px'}} className={styles["note"]} dangerouslySetInnerHTML={{__html: props.releaseNotes}}></div>
    </div>
    ) : null)}

export default ReleaseVersionNotes
