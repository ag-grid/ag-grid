import Code from '@ag-website-shared/components/code/Code';
import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';
import { type ReactElement, useEffect, useState } from 'react';

import { ERRORS, type ErrorCode } from 'ag-grid-community';

import styles from './ErrorPage.module.scss';

interface Props {
    errorCode: ErrorCode;
    children?: ReactElement;
}

function getErrorText({ errorCode, params = {} }: { errorCode: ErrorCode; params?: Record<string, string> }): string {
    const errorTextFn = ERRORS[errorCode];

    if (!errorTextFn) {
        throwDevWarning({ message: `Error code #${errorCode} not found` });
    }

    const textOutput = errorTextFn(params);
    const textOutputArray = typeof textOutput === 'string' ? [textOutput] : textOutput;

    return textOutputArray.filter(Boolean).join('\n');
}

function useSearchParams() {
    const [params, setParams] = useState<Record<string, string>>();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        setParams(Object.fromEntries(searchParams.entries()));
    }, []);

    return params;
}

export const ErrorPage = ({ errorCode, children }: Props) => {
    const params = useSearchParams();
    const errorText = getErrorText({ errorCode, params });

    return (
        <div className={styles.errorPage}>
            <div className="layout-max-width-small">
                <section>
                    <h1>AG Grid error #{errorCode}</h1>
                </section>

                <section>
                    <article>
                        <Code code={errorText} />
                        {children}
                    </article>
                </section>
            </div>
        </div>
    );
};
