import React from 'react';

export const Buttons = () => {
    return (
        <>
            <div className="grid buttons-list">
                <div>
                    <p className="item-label">
                        <span>Primary:</span>
                        <code>&lt;button&gt;</code> / <code>.button</code>
                    </p>

                    <button>Primary</button>
                    <a className="button" href="">
                        Primary (link as button)
                    </a>
                </div>

                <div>
                    <p className="item-label">
                        <span>Secondary:</span>
                        <code>.button-secondary</code>
                    </p>

                    <button className="button-secondary">Secondary</button>
                    <a className="button-secondary" href="">
                        Secondary (link as button)
                    </a>
                </div>

                <div>
                    <p className="item-label">
                        <span>Disabled:</span>
                        <code>&lt;button disabled&gt;</code> / <code>.button.disabled</code>
                    </p>

                    <button className="button" disabled>
                        Disabled (attr)
                    </button>
                    <button className="button disabled">Disabled (.disabled)</button>
                </div>

                <div>
                    <p className="item-label">
                        <span>Small:</span>
                        <code>.button</code>
                        <code>.font-size-small</code>
                    </p>

                    <button className="font-size-small">Small</button>
                </div>

                <div>
                    <p className="item-label">
                        <span>Large:</span>
                        <code>.button</code>
                        <code>.font-size-large</code>
                    </p>

                    <button className="font-size-large">Large</button>
                </div>
            </div>

            <div className="grid buttons-list">
                <div>
                    <p className="item-label">
                        <span>Input button:</span>
                        <code>.button-input</code>
                    </p>

                    <button className="button-input">Input button</button>
                </div>
            </div>
        </>
    );
};
