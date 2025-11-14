const iconNameToSvgFragment: Record<string, string | undefined> = {
    aggregation: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    arrows: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>',
    asc: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    cancel: '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
    chart: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
    'color-picker':
        '<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>',
    columns:
        '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>',
    contracted: '<path d="m9 18 6-6-6-6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    cross: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    csv: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/>',
    cut: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    desc: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    excel: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/>',
    expanded: '<path d="m15 18-6-6 6-6"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-slash':
        '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    first: '<path d="m17 18-6-6 6-6"/><path d="M7 6v12"/>',
    grip:
        '<circle cx="5" cy="8" r="0.5"/><circle cx="12" cy="8" r="0.5"/><circle cx="19" cy="8" r="0.5"/><circle cx="5" cy="16" r="0.5"/><circle cx="12" cy="16" r="0.5"/><circle cx="19" cy="16" r="0.5"/>' +
        '<g stroke="none" fill="currentColor"><circle cx="5" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="19" cy="8" r="1"/><circle cx="5" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="19" cy="16" r="1"/></g>',
    group: '<path d="M16 12H3"/><path d="M16 18H3"/><path d="M10 6H3"/><path d="M21 18V8a2 2 0 0 0-2-2h-5"/><path d="m16 8-2-2 2-2"/>',
    last: '<path d="m7 18 6-6-6-6"/><path d="M17 6v12"/>',
    left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    linked: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    loading:
        '<line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>',
    maximize:
        '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    'menu-alt':
        '<circle cx="12" cy="5" r="0.75" fill="#D9D9D9"/><circle cx="12" cy="12" r="0.75" fill="#D9D9D9"/><circle cx="12" cy="19" r="0.75" fill="#D9D9D9"/>',
    minimize:
        '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
    minus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    none: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    'not-allowed': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    paste: '<path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"/><path d="m17 10 4 4-4 4"/>',
    pin: '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
    pivot: '<path d="M15 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    previous: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    save: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    settings: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    'small-left': '<path d="m15 18-6-6 6-6"/>',
    'small-right': '<path d="m9 18 6-6-6-6"/>',
    tick: '<path d="M20 6 9 17l-5-5"/>',
    'tree-closed': '<path d="m9 18 6-6-6-6"/>',
    'tree-indeterminate': '<path d="M5 12h14"/>',
    'tree-open': '<path d="m6 9 6 6 6-6"/>',
    unlinked:
        '<path d="M9 17H7A5 5 0 0 1 7 7"/><path d="M15 7h2a5 5 0 0 1 4 8"/><line x1="8" x2="12" y1="12" y2="12"/><line x1="2" x2="22" y1="2" y2="22"/>',
    up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
};

const iconNameToFullSvg: Record<string, string | undefined> = {
    aasc: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 2.75098C7.94874 2.75099 8.13965 2.82929 8.28027 2.96973L12.7803 7.46973C12.8539 7.53838 12.9131 7.62189 12.9541 7.71387C12.995 7.80572 13.0168 7.90534 13.0186 8.00586C13.0203 8.10641 13.0015 8.20655 12.9639 8.2998C12.9262 8.39308 12.87 8.47768 12.7988 8.54883C12.7277 8.61998 12.6431 8.67615 12.5498 8.71387C12.4565 8.75154 12.3564 8.77028 12.2559 8.76855C12.1553 8.76679 12.0557 8.74496 11.9639 8.7041C11.8719 8.66312 11.7884 8.60394 11.7197 8.53027L8.5 5.30957V12.5C8.5 12.6989 8.42092 12.8896 8.28027 13.0303C8.13963 13.1709 7.9489 13.25 7.75 13.25C7.55111 13.25 7.36037 13.1709 7.21973 13.0303C7.07908 12.8896 7 12.6989 7 12.5V5.30957L3.78027 8.53027C3.6382 8.66266 3.45001 8.73475 3.25586 8.73145C3.06158 8.72802 2.87569 8.6491 2.73828 8.51172C2.60086 8.37431 2.52198 8.18844 2.51855 7.99414C2.51522 7.79996 2.58732 7.61183 2.71973 7.46973L7.21973 2.96973C7.36035 2.82928 7.55125 2.75098 7.75 2.75098ZM14.2275 0.469727L15.7627 4.58789H14.8828L14.8633 4.52832L14.5381 3.56934H13.0439L12.7012 4.5293L12.6807 4.58789H11.8018L13.3369 0.469727L13.3574 0.412109H14.207L14.2275 0.469727ZM13.3057 2.8125H14.2588L13.7822 1.45703L13.3057 2.8125Z" fill="black"/></svg>`,
    adesc: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.7471 2.25C7.94598 2.25 8.13671 2.32911 8.27737 2.46973C8.41802 2.61038 8.4971 2.80109 8.4971 3V10.7227L11.8828 7.33691C11.9519 7.26525 12.0355 7.2083 12.127 7.16895C12.2183 7.12967 12.3165 7.10834 12.416 7.10742C12.5156 7.10652 12.6149 7.12542 12.7071 7.16309C12.7992 7.20075 12.8827 7.25683 12.9532 7.32715C13.0235 7.39751 13.0795 7.48113 13.1172 7.57324C13.155 7.66539 13.1737 7.76468 13.1729 7.86426C13.172 7.96366 13.1515 8.06196 13.1123 8.15332C13.0731 8.24485 13.016 8.32824 12.9444 8.39746L8.27737 13.0645C8.20785 13.134 8.12501 13.1889 8.03421 13.2266C7.9433 13.2642 7.84549 13.2841 7.7471 13.2842C7.64867 13.2842 7.55093 13.2642 7.45999 13.2266C7.36899 13.1889 7.28548 13.1341 7.21585 13.0645L2.54983 8.39746C2.41314 8.25607 2.33825 8.06579 2.33987 7.86914C2.34159 7.67271 2.41981 7.48471 2.55862 7.3457C2.6975 7.2067 2.88559 7.1279 3.08206 7.12598C3.27871 7.12418 3.46886 7.19939 3.61038 7.33594L6.9971 10.7227V3C6.9971 2.80111 7.07619 2.61037 7.21682 2.46973C7.35745 2.3291 7.54821 2.25003 7.7471 2.25ZM14.2276 0.469727L15.7617 4.58789H14.8828L14.8633 4.52832L14.5371 3.56934H13.044L12.7012 4.5293L12.6807 4.58789H11.8018L13.3369 0.469727L13.3574 0.412109H14.2071L14.2276 0.469727ZM13.3057 2.8125H14.2578L13.7823 1.45703L13.3057 2.8125Z" fill="black"/></svg>`,
    'chevron-down':
        '<svg width="16" height="16" viewBox="0 0 16 16" class="ag-icon" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6L8 10L4 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'chevron-left':
        '<svg width="16" height="16" viewBox="0 0 16 16" class="ag-icon" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'chevron-right':
        '<svg width="16" height="16" viewBox="0 0 16 16" class="ag-icon" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'chevron-up':
        '<svg width="16" height="16" viewBox="0 0 16 16" class="ag-icon" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10L8 6L12 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'column-arrow':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="none" viewBox="0 0 32 32"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 26C0 28.2092 1.79086 30 4 30H14C16.2091 30 18 28.2092 18 26V15H25.8786L24.4394 16.4393C23.8536 17.0251 23.8536 17.9749 24.4394 18.5607C25.0252 19.1464 25.9748 19.1464 26.5606 18.5607L30.5606 14.5607C31.1464 13.9749 31.1464 13.0251 30.5606 12.4393L26.5606 8.43934C25.9748 7.85356 25.0252 7.85356 24.4394 8.43934C23.8536 9.02512 23.8536 9.97488 24.4394 10.5607L25.8786 12H18V6C18 3.79086 16.2091 2 14 2H4C1.79086 2 0 3.79086 0 6V26ZM14 5H10.5V12H15V6C15 5.44772 14.5523 5 14 5ZM4 5H7.5V12H3V6C3 5.44772 3.44772 5 4 5ZM10.5 15H15V26C15 26.5522 14.5523 27 14 27H10.5V15ZM4 27H7.5V15H3V26C3 26.5522 3.44772 27 4 27Z" fill="currentColor"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 10.6262V12.5012H5.375L10.905 6.97122L9.03 5.09622L3.5 10.6262ZM12.355 5.52122C12.4014 5.47497 12.4381 5.42002 12.4632 5.35953C12.4883 5.29905 12.5012 5.23421 12.5012 5.16872C12.5012 5.10324 12.4883 5.0384 12.4632 4.97791C12.4381 4.91742 12.4014 4.86248 12.355 4.81622L11.185 3.64622C11.1387 3.59987 11.0838 3.5631 11.0233 3.53801C10.9628 3.51291 10.898 3.5 10.8325 3.5C10.767 3.5 10.7022 3.51291 10.6417 3.53801C10.5812 3.5631 10.5263 3.59987 10.48 3.64622L9.565 4.56122L11.44 6.43622L12.355 5.52122Z" fill="currentColor"/></svg>',
    'filter-add':
        '<svg width="16" height="16" viewBox="0 0 16 16" class="ag-icon" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.12126 7.75L10.8517 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6.65934 11.748L9.32778 11.748" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12.2943 1.04872V6.19184M14.9886 3.74341H9.68478" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.25488 3C8.04799 3.18323 7.91706 3.45099 7.91699 3.74902C7.91713 4.04868 8.04988 4.31681 8.25879 4.5H2C1.58579 4.5 1.25 4.16421 1.25 3.75C1.25 3.33579 1.58579 3 2 3H8.25488Z" fill="currentColor"/></svg>',
    'pinned-bottom':
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="ag-icon" viewBox="0 0 16 16"><path fill="currentColor" d="M3.47 12.28A.75.75 0 0 1 4 11h8a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.53-.22ZM12.731 5.256a.75.75 0 0 1-.2.524l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V2a.75.75 0 0 1 1.5 0v5.44l2.72-2.72a.75.75 0 0 1 1.26.536Z"/></svg>',
    'pinned-top':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="none" viewBox="0 0 16 16"><path fill="currentColor" d="M12.53 3.72A.75.75 0 0 1 12 5H4a.75.75 0 0 1 0-1.5h8a.75.75 0 0 1 .53.22ZM3.269 10.744a.75.75 0 0 1 .2-.524l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 1 1-1.06 1.06L8.75 8.56V14a.75.75 0 0 1-1.5 0V8.56l-2.72 2.72a.75.75 0 0 1-1.26-.536Z"/></svg>',
    'small-down':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="black" stroke="none" viewBox="0 0 32 32"><path d="M7.334 10.667 16 21.334l8.667-10.667H7.334Z"/></svg>',
    'small-up':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="black" stroke="none" viewBox="0 0 32 32"><path d="M7.334 21.333 16 10.666l8.667 10.667H7.334Z"/></svg>',
    'un-pin':
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="ag-icon" viewBox="0 0 16 16"><path fill="currentColor" d="M8 11a.75.75 0 0 0-.75.75v3.333a.75.75 0 1 0 1.5 0V11.75A.75.75 0 0 0 8 11Z"/><path fill="currentColor" d="M13.11 1.436a.75.75 0 0 0-1.22-.872l-10 14a.75.75 0 1 0 1.22.872L5.207 12.5h7.376a.75.75 0 0 0 .75-.75v-1.174a2.08 2.08 0 0 0-1.153-1.863l-1.185-.599-.005-.002a.58.58 0 0 1-.323-.522V5.165a2.083 2.083 0 0 0 1.854-2.904l.589-.825Zm-3.943 5.52v.634a2.08 2.08 0 0 0 1.153 1.863l1.185.6.005.002a.58.58 0 0 1 .323.522V11H6.28l2.887-4.044ZM9.277 1H5.25a2.084 2.084 0 0 0-.083 4.165v1.676l1.5-2.132v-.292a.75.75 0 0 0-.75-.75H5.25a.584.584 0 0 1 0-1.167h2.972L9.277 1Z"/></svg>',
};

export const getQuartzIconsCss = (args: { strokeWidth?: number } = {}) => {
    let result = '';
    for (const iconName of [...Object.keys(iconNameToSvgFragment), ...Object.keys(iconNameToFullSvg)]) {
        const iconSvg = quartzIconSvg(iconName, args.strokeWidth);
        result += `.ag-icon-${iconName}::before { mask-image: url('data:image/svg+xml,${encodeURIComponent(iconSvg)}'); }\n`;
    }
    return result;
};

const quartzIconSvg = (name: string, strokeWidth = 1.5): string => {
    const fullSVG = iconNameToFullSvg[name];
    if (fullSVG) {
        return fullSVG;
    }
    const svgFragment = iconNameToSvgFragment[name];
    if (!svgFragment) {
        throw new Error(`Missing icon data for ${name}`);
    }
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="${strokeWidth}" viewBox="0 0 24 24">` +
        '<style>* { vector-effect: non-scaling-stroke; }</style>' +
        svgFragment +
        '</svg>'
    );
};
