import classnames from 'classnames';

export const TabNavItem = ({
    tabId,
    label,
    selected,
    onSelect,
}: {
    tabId?: string;
    label: string;
    selected: boolean;
    onSelect: (label: string) => void;
}) => {
    return (
        <li key={label} id={tabId} className="tabs-nav-item" role="presentation">
            <button
                className={classnames('button-style-none', 'tabs-nav-link', { active: selected })}
                onClick={(e) => {
                    e.preventDefault();
                    onSelect(label);
                }}
                role="tab"
                disabled={selected}
            >
                {label}
            </button>
        </li>
    );
};
