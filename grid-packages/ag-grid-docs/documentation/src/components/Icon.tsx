import * as CarbonIcon from '@carbon/icons-react';
import classNames from 'classnames';
import React from 'react';
import ApiIcon from '../images/inline-svgs/api.svg';
import BoldChevronDown from '../images/inline-svgs/bold-chevron-down.svg';
import BoldChevronLeft from '../images/inline-svgs/bold-chevron-left.svg';
import BoldChevronRight from '../images/inline-svgs/bold-chevron-right.svg';
import BoldChevronUp from '../images/inline-svgs/bold-chevron-up.svg';
import CodeSandboxIcon from '../images/inline-svgs/codesandbox.svg';
import ColumnsIcon from '../images/inline-svgs/columns.svg';
import CrossIcon from '../images/inline-svgs/cross.svg';
import EnterpriseIcon from '../images/inline-svgs/enterprise.svg';
import IntegratedChartsIcon from '../images/inline-svgs/integrated-chart.svg';
import maximizeIcon from '../images/inline-svgs/maximize.svg';
import minimizeIcon from '../images/inline-svgs/minimize.svg';
import PlunkerIcon from '../images/inline-svgs/plunker.svg';
import ReplayDemoIcon from '../images/inline-svgs/replay-demo-icon.svg';
import RowsIcon from '../images/inline-svgs/rows.svg';
import StackBlitzIcon from '../images/inline-svgs/stack-blitz.svg';
import TakeControlIcon from '../images/inline-svgs/take-control-icon.svg';
import TickIcon from '../images/inline-svgs/tick.svg';
import styles from './Icon.module.scss';

// Uses IBM Carbon Design System icons as a base
// Full list of Carbon icons => https://carbondesignsystem.com/guidelines/icons/library

const SOCIALS_ICON_MAP = {
    github: CarbonIcon.LogoGithub,
    twitter: CarbonIcon.LogoTwitter,
    youtube: CarbonIcon.LogoYoutube,
    linkedin: CarbonIcon.LogoLinkedin,
};

const DOCS_CATEGORIES_ICON_MAP = {
    'docs-api': ApiIcon,
    'docs-columns': ColumnsIcon,
    'docs-row': RowsIcon,
    'docs-tooling': CarbonIcon.ToolKit,
    'docs-styling': CarbonIcon.ColorPalette,
    'docs-csd': CarbonIcon.Gui,
    'docs-ssd': CarbonIcon.Db2Database,
    'docs-selection': CarbonIcon.CheckboxChecked,
    'docs-filtering': CarbonIcon.Filter,
    'docs-rendering': CarbonIcon.DataVis_4,
    'docs-editing': CarbonIcon.WatsonHealthTextAnnotationToggle,
    'docs-group': CarbonIcon.CrossTab,
    'docs-detail': CarbonIcon.ShrinkScreen,
    'docs-import-export': CarbonIcon.Launch,
    'docs-accessories': CarbonIcon.ListDropdown,
    'docs-components': CarbonIcon.Settings,
    'docs-sparklines': CarbonIcon.Growth,
    'docs-integrated-charts': IntegratedChartsIcon,
    'docs-standalone-charts': CarbonIcon.SkillLevel,
    'docs-scrolling': CarbonIcon.FitToHeight,
    'docs-interactivity': CarbonIcon.TouchInteraction,
    'docs-testing': CarbonIcon.Task,
    'docs-misc': CarbonIcon.IbmCloudEventNotification,
};

const HOMEPAGE_FEATURES_ICON_MAP = {
    'feature-editing': CarbonIcon.WatsonHealthTextAnnotationToggle,
    'feature-transactions': CarbonIcon.DataShare,
    'feature-aggregation': CarbonIcon.Sigma,
    'feature-grouping': CarbonIcon.Table,
    'feature-detail': CarbonIcon.ShrinkScreen,
    'feature-clipboard': CarbonIcon.Report,
    'feature-server-side': CarbonIcon.Db2Database,
    'feature-pivoting': CarbonIcon.CrossTab,
    'feature-filtering': CarbonIcon.Filter,
    'feature-excel': CarbonIcon.DocumentExport,
    'feature-menu': CarbonIcon.ListDropdown,
    'feature-tree': CarbonIcon.TreeViewAlt,
};

export const ICON_MAP = {
    info: CarbonIcon.Information,
    warning: CarbonIcon.WarningAlt,
    email: CarbonIcon.Email,
    creditCard: CarbonIcon.Purchase,
    lightBulb: CarbonIcon.Idea,
    enterprise: EnterpriseIcon,
    collapseCategories: CarbonIcon.CollapseCategories,
    search: CarbonIcon.Search,
    arrowUp: CarbonIcon.ArrowUp,
    arrowRight: CarbonIcon.ArrowRight,
    arrowDown: CarbonIcon.ArrowDown,
    arrowLeft: CarbonIcon.ArrowLeft,
    link: CarbonIcon.Link,
    chevronUp: BoldChevronUp,
    chevronRight: BoldChevronRight,
    chevronDown: BoldChevronDown,
    chevronLeft: BoldChevronLeft,
    replaydemo: ReplayDemoIcon,
    takeControl: TakeControlIcon,
    playCircle: CarbonIcon.PlayFilled,
    download: CarbonIcon.Download,
    executableProgram: CarbonIcon.ExecutableProgram,
    code: CarbonIcon.Code,
    tick: TickIcon,
    cross: CrossIcon,
    plunker: PlunkerIcon,
    stackblitz: StackBlitzIcon,
    codesandbox: CodeSandboxIcon,
    maximize: maximizeIcon,
    minimize: minimizeIcon,
    idea: CarbonIcon.DataEnrichment,
    sun: CarbonIcon.Sun,
    moon: CarbonIcon.Moon,
    ...SOCIALS_ICON_MAP,
    ...DOCS_CATEGORIES_ICON_MAP,
    ...HOMEPAGE_FEATURES_ICON_MAP,
};

export type IconName = keyof typeof ICON_MAP;

type Props = { name: IconName; svgClasses?: string };

export const Icon = ({ name, svgClasses }: Props) => {
    const IconSvg = ICON_MAP[name];

    return <IconSvg size="32" className={classNames(styles.icon, 'icon', svgClasses)} />;
};
