import React, { useMemo, useRef } from 'react';

import type { CustomTooltipProps } from 'ag-grid-react';

export default (props: CustomTooltipProps & { type: string }) => {
    const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex!)!.data, []);
    const inputEl = useRef<HTMLInputElement>(null);

    const onFormSubmit = (e: any) => {
        e.preventDefault();
        const { node } = props;
        const target = inputEl.current as HTMLInputElement;

        if (target.value && node) {
            node.setDataValue('athlete', target.value);
            if (props.hideTooltipCallback) {
                props.hideTooltipCallback();
            }
        }
    };

    return (
        <div className="custom-tooltip">
            <div className={'panel panel-' + (props.type || 'primary')}>
                <div className="panel-heading">
                    <h3 className="panel-title">{data.country}</h3>
                </div>
                <form className="panel-body" onSubmit={onFormSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            ref={inputEl}
                            className="form-control"
                            id="name"
                            placeholder="Name"
                            autoComplete="off"
                            defaultValue={data.athlete}
                            onFocus={(e) => e.target.select()}
                        />
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                    <p>Total: {data.total}</p>
                </form>
            </div>
        </div>
    );
};
