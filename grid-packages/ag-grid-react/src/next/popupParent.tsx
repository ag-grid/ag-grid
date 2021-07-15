import React, { useEffect, useState } from "react";
import { Context, AgPopup, PopupService, Events, EventService } from "ag-grid-community";

export const PopupParent = (props: {context: Context}) => {

    const { context } = props;

    const [popupList, setPopupList] = useState<AgPopup[]>([]);

    useEffect( () => {

        const popupService: PopupService = context.getBean('popupService');
        const eventService: EventService = context.getBean('eventService');

        const listener = () => {
            setPopupList(popupService.getPopupList());
        };

        eventService.addEventListener(Events.EVENT_POPUP_LIST_CHANGED, listener);

        return ()=> {
            eventService.removeEventListener(Events.EVENT_POPUP_LIST_CHANGED, listener);
        };

    }, [context]);

    return (
        <div>
            popup list
            { popupList.map( popup => <span>POPUP</span>)}
        </div>
    );
};
