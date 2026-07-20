export const DOCS_TAB_ITEM_ID_PREFIX = 'reference-';

export const MIGRATION_DOCUMENTATION_NAV_DATA = {
    id: 'documentation',
    text: 'Documentation',
};

export const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';
export const CONTACT_FORM_DATA = {
    default: {
        actionUrl: 'https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DS9000004CVdh',
        orgId: '00DS9000004CVdh',
        textAreaId: '00NS900000A3S21',
        leadSource: 'AG Grid Contact Form',
        messagePlaceholder: 'Tell us about your interest in AG Grid',
        formLocationId: '00NS900000BCx1C',
        enquiryTypeId: '00NS900000IEZRl',
        captchaSiteKey: '6Ld_ro4sAAAAACjXUk0goeMBFJvD630upERER7pr',
        captchaSettingsKeyName: 'agGridStagingV2',
    },
    production: {
        actionUrl: 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D1t000000u82X',
        orgId: '00D1t000000u82X',
        textAreaId: '00NQ500000B4jZh',
        messagePlaceholder: 'Tell us about your interest in AG Grid',
        leadSource: 'AG Grid Contact Form',
        formLocationId: '00NQ500000CVgqT',
        enquiryTypeId: '00NQ500000IALbt',
        captchaSiteKey: '6LfvTQosAAAAABkPY-cWnx2mr29q8xWuQs-bMIu-',
        captchaSettingsKeyName: 'agGridComV2',
    },
};

export const STUDIO_FORM_DATA = {
    default: {
        actionUrl: 'https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DS9000004CVdh',
        orgId: '00DS9000004CVdh',
        textAreaId: '00NS900000A3S21',
        leadSource: 'Studio Lead',
        messagePlaceholder: 'Tell us about your interest in AG Studio',
        formLocationId: '00NS900000BCx1C',
        enquiryTypeId: null,
        captchaSiteKey: '6Ld_ro4sAAAAACjXUk0goeMBFJvD630upERER7pr',
        captchaSettingsKeyName: 'agGridStagingV2',
    },
    production: {
        actionUrl: 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D1t000000u82X',
        orgId: '00D1t000000u82X',
        textAreaId: '00NQ500000B4jZh',
        leadSource: 'Studio Lead',
        messagePlaceholder: 'Tell us about your interest in AG Studio',
        formLocationId: '00NQ500000CVgqT',
        enquiryTypeId: null,
        captchaSiteKey: '6LfvTQosAAAAABkPY-cWnx2mr29q8xWuQs-bMIu-',
        captchaSettingsKeyName: 'agGridComV2',
    },
};

// Relative to website folder
export const SITEMAP_CACHE_DIR = '.astro/cache/sitemap';

export const PRIVACY_POLICY_URL = 'https://www.ag-grid.com/privacy';

// Figma
export const FIGMA_DESIGN_SYSTEM_URL = 'https://www.figma.com/community/file/1360600846643230092/ag-grid-design-system';

// YouTube
export const YOUTUBE_LICENSE_PRICING_URL = 'https://www.youtube.com/watch?v=VPr__OKxH50';

// Zendesk
export const ZENDESK_URL = 'https://ag-grid.zendesk.com/hc/en-us';
