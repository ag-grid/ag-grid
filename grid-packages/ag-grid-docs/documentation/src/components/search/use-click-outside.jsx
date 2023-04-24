import { useEffect } from 'react';

const events = ['mousedown', 'touchstart'];

/**
 * This registers a method to be triggered when the user clicks outside the element associated with the provided ref.
 */
const useClickOutside = (ref, onClickOutside) => {
    const isOutside = element => !ref.current || !ref.current.contains(element);

    const onClick = event => {
        if (isOutside(event.target)) {
            onClickOutside();
        }
    };

    useEffect(() => {
        for (const event of events) {
            document.addEventListener(event, onClick);
        }

        return () => {
            for (const event of events) document.removeEventListener(event, onClick);
        };
    });
};

export default useClickOutside;