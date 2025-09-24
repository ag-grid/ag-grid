import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

interface Props {
    name: string;
    message: string;
}

export const ResultContent: FunctionComponent<Props> = ({ name, message }) => {
    const [backLink, setBackLink] = useState<string | null>(null);

    useEffect(() => {
        const fromPage = new URLSearchParams(window.location.search).get('fromPage');

        if (fromPage) {
            setBackLink(fromPage);
        }
    }, []);

    return (
        <>
            <h1>{name}</h1>
            <p>{message}</p>
            {backLink && <a href={backLink}>Go back to previous page</a>}
        </>
    );
};
