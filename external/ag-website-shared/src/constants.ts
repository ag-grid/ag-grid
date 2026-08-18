export const DOCS_TAB_ITEM_ID_PREFIX = 'reference-';

export const MIGRATION_DOCUMENTATION_NAV_DATA = {
    id: 'documentation',
    text: 'Documentation',
};

export const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';

/**
 * Salesforce field identifiers for the web-to-lead consent checkboxes
 */
export const CONSENT_FIELD_IDS = {
    default: {
        dataProcessingConsentId: '00NS900000KbwBF',
        marketingEmailConsentId: '00NS900000KbwBI',
        emailTrackingConsentId: '00NS900000KbwBG',
        franceOrItalyId: '00NS900000KbwBH',
    },
    production: {
        dataProcessingConsentId: '00NQ500000IfxTS',
        marketingEmailConsentId: '00NQ500000JApXt',
        emailTrackingConsentId: '00NQ500000JApXs',
        franceOrItalyId: '00NQ500000JD5zq',
    },
};

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

/**
 * `User-Agent` identifying build-time fetches against the live AG sites (sitemaps, robots disallow
 * lists), which are not served to the default agent.
 */
export const BUILD_USER_AGENT = 'Mozilla/5.0 (compatible; ag-website-build)';

export const PRIVACY_POLICY_URL = 'https://www.ag-grid.com/privacy';

// Figma
export const FIGMA_DESIGN_SYSTEM_URL = 'https://www.figma.com/community/file/1360600846643230092/ag-grid-design-system';

// YouTube
export const YOUTUBE_LICENSE_PRICING_URL = 'https://www.youtube.com/watch?v=VPr__OKxH50';

// Zendesk
export const ZENDESK_URL = 'https://ag-grid.zendesk.com/hc/en-us';

// Enzuzo consent-management platform: the AG Grid site's cookie policy UUID
export const AG_GRID_ENZUZO_POLICY_ID = '061e8460-91b3-11f1-98ff-978c2fcf2681';
