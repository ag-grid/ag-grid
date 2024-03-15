import * as CarbonIcon from '@carbon/icons-react';
import styles from '@design-system/modules/Icon.module.scss';
import ApiIcon from '@images/inline-svgs/api.svg?react';
import BoldChevronDown from '@images/inline-svgs/bold-chevron-down.svg?react';
import BoldChevronLeft from '@images/inline-svgs/bold-chevron-left.svg?react';
import BoldChevronRight from '@images/inline-svgs/bold-chevron-right.svg?react';
import BoldChevronUp from '@images/inline-svgs/bold-chevron-up.svg?react';
import CodeResult from '@images/inline-svgs/code-result.svg?react';
import CodeSandboxIcon from '@images/inline-svgs/codesandbox.svg?react';
import ColumnsIcon from '@images/inline-svgs/columns.svg?react';
import CrossIcon from '@images/inline-svgs/cross.svg?react';
import EnterpriseIcon from '@images/inline-svgs/enterprise.svg?react';
import EscapeIcon from '@images/inline-svgs/escape.svg?react';
import HeadingResult from '@images/inline-svgs/heading-result.svg?react';
import IntegratedChartsIcon from '@images/inline-svgs/integrated-chart.svg?react';
import maximizeIcon from '@images/inline-svgs/maximize.svg?react';
import minimizeIcon from '@images/inline-svgs/minimize.svg?react';
import NewTabIcon from '@images/inline-svgs/new-tab.svg?react';
import PageResult from '@images/inline-svgs/page-result.svg?react';
import PlunkerIcon from '@images/inline-svgs/plunker.svg?react';
import RadarArea from '@images/inline-svgs/radar-area.svg?react';
import RadialColumn from '@images/inline-svgs/radial-column.svg?react';
import ReplayDemoIcon from '@images/inline-svgs/replay-demo-icon.svg?react';
import RowsIcon from '@images/inline-svgs/rows.svg?react';
import StackBlitzIcon from '@images/inline-svgs/stack-blitz.svg?react';
import StackOverflowMonochromeIcon from '@images/inline-svgs/stack-overflow-monochrome.svg?react';
import StackOverflowIcon from '@images/inline-svgs/stack-overflow.svg?react';
import TakeControlIcon from '@images/inline-svgs/take-control-icon.svg?react';
import TickIcon from '@images/inline-svgs/tick.svg?react';
import XLogoIcon from '@images/inline-svgs/x-logo.svg?react';
import ZendeskMonochromeIcon from '@images/inline-svgs/zendesk-monochrome.svg?react';
import ZendeskIcon from '@images/inline-svgs/zendesk.svg?react';
import classNames from 'classnames';

// Uses IBM Carbon Design System icons as a base
// Full list of Carbon icons => https://carbondesignsystem.com/guidelines/icons/library

const SOCIALS_ICON_MAP = {
    github: CarbonIcon.LogoGithub,
    twitter: CarbonIcon.LogoTwitter,
    xLogo: XLogoIcon,
    youtube: CarbonIcon.LogoYoutube,
    linkedin: CarbonIcon.LogoLinkedin,
    email: CarbonIcon.Email,
    blog: CarbonIcon.Blog,
    stackoverflow: StackOverflowIcon,
    stackoverflowMonochrome: StackOverflowMonochromeIcon,
    zendesk: ZendeskIcon,
    zendeskMonochrome: ZendeskMonochromeIcon,
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

const CHARTS_ICON_MAP = {
    chartsBar: CarbonIcon.ChartBar,
    chartsColumn: CarbonIcon.ChartColumn,
    chartsLine: CarbonIcon.ChartLine,
    chartsArea: CarbonIcon.ChartArea,
    chartsScatter: CarbonIcon.ChartScatter,
    chartsBubble: CarbonIcon.ChartBubble,
    chartsPie: CarbonIcon.ChartPie,
    chartsDonut: CarbonIcon.ChartRing,
    chartsCombination: CarbonIcon.ChartCombo,
    chartsHistogram: CarbonIcon.Ordinal,
    chartsHeatmap: CarbonIcon.HeatMap_03,
    chartsRangeArea: CarbonIcon.ChartRiver,
    chartsRangeBar: CarbonIcon.ChartBarFloating,
    chartsBoxPlot: CarbonIcon.BoxPlot,
    chartsErrorBar: CarbonIcon.ChartErrorBar,
    chartsWaterfall: CarbonIcon.ChartWaterfall,
    chartsRadar: CarbonIcon.ChartRadar,
    chartsRadarArea: RadarArea,
    chartsNightingale: CarbonIcon.ChartRose,
    chartsRadialColumn: RadialColumn,
    chartsRadialBar: CarbonIcon.ChartRadial,
    chartsTreemap: CarbonIcon.ChartTreemap,
    chartsSunburst: CarbonIcon.ChartSunburst,
    chartsIcicle: CarbonIcon.ChartClusterBar,
    chartsFunnel: CarbonIcon.Filter,
    chartsPyramid: CarbonIcon.UpToTop,
    chartsBullet: CarbonIcon.ChartBullet,
    chartsMap: CarbonIcon.Plan,
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
    return: CarbonIcon.Return,
    link: CarbonIcon.Link,
    mapPin: CarbonIcon.LocationFilled,
    chevronUp: BoldChevronUp,
    chevronRight: BoldChevronRight,
    chevronDown: BoldChevronDown,
    chevronLeft: BoldChevronLeft,
    replaydemo: ReplayDemoIcon,
    takeControl: TakeControlIcon,
    playCircle: CarbonIcon.PlayFilled,
    download: CarbonIcon.Download,
    executableProgram: CarbonIcon.ExecutableProgram,
    eye: CarbonIcon.View,
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
    flash: CarbonIcon.Flash,
    movement: CarbonIcon.Movement,
    zoomArea: CarbonIcon.ZoomArea,
    colorPalette: CarbonIcon.ColorPalette,
    newTab: NewTabIcon,
    sort: CarbonIcon.ChevronSort,
    escape: EscapeIcon,
    pageResult: PageResult,
    codeResult: CodeResult,
    headingResult: HeadingResult,
    listBoxes: CarbonIcon.List,
    ...SOCIALS_ICON_MAP,
    ...DOCS_CATEGORIES_ICON_MAP,
    ...HOMEPAGE_FEATURES_ICON_MAP,
    ...CHARTS_ICON_MAP,
};

export type IconName = keyof typeof ICON_MAP;

type Props = { name: IconName; svgClasses?: string; onClick?: () => void };

export const Icon = ({ name, svgClasses, onClick }: Props) => {
    const IconSvg = ICON_MAP[name];

    return IconSvg ? (
        <IconSvg size="32" className={classNames(styles.icon, 'icon', svgClasses)} onClick={onClick} />
    ) : null;
};
