// ../../external/ag-website-shared/src/markdoc/tags/kbd.ts
import { Markdoc } from "@astrojs/markdoc/config";
var kbd = {
  render: "kbd",
  attributes: {
    primary: { type: String }
  },
  transform(node) {
    return new Markdoc.Tag(this.render, {}, [node.attributes.primary]);
  }
};

// markdoc.config.ts
import { Markdoc as Markdoc4, component, defineMarkdocConfig, nodes as nodes2 } from "@astrojs/markdoc/config";

// ../../community-modules/core/package.json
var package_default = {
  name: "@ag-grid-community/core",
  version: "31.2.0",
  description: "Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue",
  dependencies: {
    tslib: "^2.3.0"
  },
  main: "./dist/package/main.cjs.js",
  types: "./dist/types/src/main.d.ts",
  module: "./dist/package/main.esm.mjs",
  exports: {
    import: "./dist/package/main.esm.mjs",
    require: "./dist/package/main.cjs.js",
    types: "./dist/types/src/main.d.ts",
    default: "./dist/package/main.cjs.js"
  },
  devDependencies: {
    "@types/jest": "^29.5.0",
    jest: "^29.5.0",
    "jest-environment-jsdom": "^29.7.0"
  },
  repository: {
    type: "git",
    url: "https://github.com/ag-grid/ag-grid.git"
  },
  keywords: [
    "ag",
    "ag-grid",
    "datagrid",
    "data-grid",
    "datatable",
    "data-table",
    "grid",
    "table",
    "react",
    "table",
    "angular",
    "angular-component",
    "react",
    "react-component",
    "reactjs",
    "vue",
    "vuejs"
  ],
  author: "Sean Landsman <sean@thelandsmans.com>",
  license: "MIT",
  bugs: {
    url: "https://github.com/ag-grid/ag-grid/issues"
  },
  browserslist: [
    "> 1%",
    "last 2 versions",
    "not ie >= 0",
    "not ie_mob >= 0"
  ],
  homepage: "https://www.ag-grid.com/",
  publishConfig: {
    access: "public"
  }
};

// src/constants.ts
var _a;
var quickBuildPages = (_a = import.meta.env) == null ? void 0 : _a.QUICK_BUILD_PAGES;
var QUICK_BUILD_PAGES = quickBuildPages ? quickBuildPages.split(",") : void 0;
var FRAMEWORKS = ["react", "angular", "vue", "javascript"];
var DEFAULT_FRAMEWORK = FRAMEWORKS[0];
var USE_PACKAGES = true;
var _a2;
var agGridVersion = ((_a2 = import.meta.env) == null ? void 0 : _a2.PUBLIC_PACKAGE_VERSION) ?? package_default.version;
var agGridEnterpriseVersion = agGridVersion;
var agGridReactVersion = agGridVersion;
var agGridAngularVersion = agGridVersion;
var agGridVueVersion = agGridVersion;
var agGridVue3Version = agGridVersion;
var NPM_CDN = "https://cdn.jsdelivr.net/npm";
var PUBLISHED_URLS = {
  "@ag-grid-community/styles": `${NPM_CDN}/@ag-grid-community/styles@${agGridVersion}`,
  "@ag-grid-community/react": `${NPM_CDN}/@ag-grid-community/react@${agGridReactVersion}/`,
  "@ag-grid-community/angular": `${NPM_CDN}/@ag-grid-community/angular@${agGridAngularVersion}/`,
  "@ag-grid-community/vue": `${NPM_CDN}/@ag-grid-community/vue@${agGridVueVersion}/`,
  "@ag-grid-community/vue3": `${NPM_CDN}/@ag-grid-community/vue3@${agGridVue3Version}/`,
  "ag-grid-community": `${NPM_CDN}/ag-grid-community@${agGridVersion}`,
  "ag-grid-enterprise": `${NPM_CDN}/ag-grid-enterprise@${agGridEnterpriseVersion}/`,
  "ag-grid-charts-enterprise": `${NPM_CDN}/ag-grid-charts-enterprise@${agGridEnterpriseVersion}/`,
  "ag-grid-angular": `${NPM_CDN}/ag-grid-angular@${agGridAngularVersion}/`,
  "ag-grid-react": `${NPM_CDN}/ag-grid-react@${agGridReactVersion}/`,
  "ag-grid-vue": `${NPM_CDN}/ag-grid-vue@${agGridVueVersion}/`,
  "ag-grid-vue3": `${NPM_CDN}/ag-grid-vue3@${agGridVue3Version}/`
};
var integratedChartsUsesChartsEnterprise = true;
var PUBLISHED_UMD_URLS = {
  "ag-grid-community": `${NPM_CDN}/ag-grid-community@${agGridVersion}/dist/ag-grid-community.js`,
  "ag-grid-enterprise": `${NPM_CDN}/ag-grid-${integratedChartsUsesChartsEnterprise ? "charts-" : ""}enterprise@${agGridVersion}/dist/ag-grid-${integratedChartsUsesChartsEnterprise ? "charts-" : ""}enterprise.js`
};
var DOCS_TAB_ITEM_ID_PREFIX = "reference-";
var _a3, _b;
var SITE_BASE_URL = (
  // Astro default env var (for build time)
  ((_a3 = import.meta.env) == null ? void 0 : _a3.BASE_URL) || // `.env.*` override (for client side)
  ((_b = import.meta.env) == null ? void 0 : _b.PUBLIC_BASE_URL.replace(/\/?$/, "/"))
);
var _a4, _b2;
var SITE_URL = ((_a4 = import.meta.env) == null ? void 0 : _a4.SITE_URL) || ((_b2 = import.meta.env) == null ? void 0 : _b2.PUBLIC_SITE_URL);
var STAGING_SITE_URL = "https://grid-staging.ag-grid.com";
var _a5;
var USE_PUBLISHED_PACKAGES = ["1", "true"].includes((_a5 = import.meta.env) == null ? void 0 : _a5.PUBLIC_USE_PUBLISHED_PACKAGES);
var _a6;
var ENABLE_GENERATE_DEBUG_PAGES = (_a6 = import.meta.env) == null ? void 0 : _a6.ENABLE_GENERATE_DEBUG_PAGES;
var _a7;
var SHOW_DEBUG_LOGS = (_a7 = import.meta.env) == null ? void 0 : _a7.SHOW_DEBUG_LOGS;
var SITE_BASE_URL_SEGMENTS = (SITE_BASE_URL == null ? void 0 : SITE_BASE_URL.split("/").filter(Boolean).length) || 0;
function getChartsUrl() {
  if (SITE_URL == null)
    return;
  if (SITE_URL == null ? void 0 : SITE_URL.includes("localhost:4610")) {
    return "https://localhost:4600";
  } else if (SITE_URL == null ? void 0 : SITE_URL.includes(STAGING_SITE_URL)) {
    return "https://charts-staging.ag-grid.com";
  }
  return "https://charts.ag-grid.com";
}
var CHARTS_SITE_URL = getChartsUrl();

// src/utils/markdoc/tags/include-markdoc.ts
import Markdoc2 from "@markdoc/markdoc";

// src/utils/pages.ts
import glob from "glob";

// src/utils/env.ts
var getIsDev = () => {
  var _a8;
  return process.env.NODE_ENV === "development" || ((_a8 = import.meta.env) == null ? void 0 : _a8.DEV);
};

// src/utils/pathJoin.ts
function pathJoin(...segments) {
  if (!segments || !segments.length) {
    return "";
  } else if (segments[0] === "/" && segments.length === 1) {
    return "/";
  }
  const removedSlashes = segments.filter(Boolean).map((segment) => segment.toString()).map((segment) => {
    return segment !== "/" && segment[0] === "/" ? segment.slice(1) : segment;
  }).map((segment) => {
    return segment !== "/" && segment[segment.length - 1] === "/" ? segment.slice(0, segment.length - 1) : segment;
  }).filter((segment) => {
    return segment !== "/";
  });
  const [firstSegment] = segments;
  const firstSegmentHasSlash = (firstSegment == null ? void 0 : firstSegment[0]) === "/";
  return firstSegmentHasSlash ? `/${removedSlashes.join("/")}` : removedSlashes.join("/");
}

// src/utils/pages.ts
var FILES_PATH_MAP = {
  // Code doc reference files
  // NOTE: Manually specified, so it can be referenced by key
  "reference/column-options.AUTO.json": "dist/documentation/reference/column-options.AUTO.json",
  "reference/column.AUTO.json": "dist/documentation/reference/column.AUTO.json",
  "reference/doc-interfaces.AUTO.json": "dist/documentation/reference/doc-interfaces.AUTO.json",
  "reference/grid-api.AUTO.json": "dist/documentation/reference/grid-api.AUTO.json",
  "reference/grid-options.AUTO.json": "dist/documentation/reference/grid-options.AUTO.json",
  "reference/interfaces.AUTO.json": "dist/documentation/reference/interfaces.AUTO.json",
  "reference/row-node.AUTO.json": "dist/documentation/reference/row-node.AUTO.json",
  // Community modules
  "@ag-grid-community/core/dist/**": "community-modules/core/dist/**/*.{cjs,js,map}",
  "@ag-grid-community/client-side-row-model/dist/**": "community-modules/client-side-row-model/dist/**/*.{cjs,js,map}",
  "@ag-grid-community/csv-export/dist/**": "community-modules/csv-export/dist/**/*.{cjs,js,map}",
  "@ag-grid-community/infinite-row-model/dist/**": "community-modules/infinite-row-model/dist/**/*.{cjs,js,map}",
  "@ag-grid-community/styles/**": "community-modules/styles/**/*.{css,scss}",
  // Enterprise modules
  "@ag-grid-enterprise/advanced-filter/dist/**": "enterprise-modules/advanced-filter/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/charts/dist/**": "enterprise-modules/charts/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/charts-enterprise/dist/**": "enterprise-modules/charts-enterprise/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/clipboard/dist/**": "enterprise-modules/clipboard/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/column-tool-panel/dist/**": "enterprise-modules/column-tool-panel/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/core/dist/**": "enterprise-modules/core/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/excel-export/dist/**": "enterprise-modules/excel-export/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/filter-tool-panel/dist/**": "enterprise-modules/filter-tool-panel/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/master-detail/dist/**": "enterprise-modules/master-detail/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/menu/dist/**": "enterprise-modules/menu/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/multi-filter/dist/**": "enterprise-modules/multi-filter/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/range-selection/dist/**": "enterprise-modules/range-selection/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/rich-select/dist/**": "enterprise-modules/rich-select/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/row-grouping/dist/**": "enterprise-modules/row-grouping/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/server-side-row-model/dist/**": "enterprise-modules/server-side-row-model/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/set-filter/dist/**": "enterprise-modules/set-filter/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/side-bar/dist/**": "enterprise-modules/side-bar/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/sparklines/dist/**": "enterprise-modules/sparklines/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/status-bar/dist/**": "enterprise-modules/status-bar/dist/**/*.{cjs,js,map}",
  "@ag-grid-enterprise/viewport-row-model/dist/**": "enterprise-modules/viewport-row-model/dist/**/*.{cjs,js,map}",
  // Charts modules
  "ag-charts-community/dist/**": "node_modules/ag-charts-community/dist/**/*.{cjs,js,map}",
  "ag-charts-enterprise/dist/**": "node_modules/ag-charts-enterprise/dist/**/*.{cjs,js,map}",
  // Framework libraries
  "@ag-grid-community/react/dist/**": "community-modules/react/dist/**/*.{cjs,mjs,js,map}",
  "@ag-grid-community/react/src/**": "community-modules/react/src/**/*.{tsx,ts}",
  "@ag-grid-community/angular/fesm2015/ag-grid-community-angular.mjs": "community-modules/angular/dist/ag-grid-angular/fesm2015/ag-grid-community-angular.mjs",
  "@ag-grid-community/vue/dist/**": "community-modules/vue/dist/**/*.{cjs,mjs,js,map}",
  "@ag-grid-community/vue3/dist/**": "community-modules/vue3/dist/**/*.{cjs,mjs,js,map}"
  // TODO: Dynamically map files
  // '@ag-grid-community': {
  //     sourceFolder: 'community-modules',
  //     fileNameGlob: '*/dist/**/*.{cjs,js,map}',
  // },
  // '@ag-grid-enterprise': {
  //     sourceFolder: 'enterprise-modules',
  //     fileNameGlob: '*/dist/**/*.{cjs,js,map}',
  // },
};
if (USE_PACKAGES) {
  FILES_PATH_MAP["ag-grid-community/styles/**"] = `packages/ag-grid-community/styles/**/*.css`;
  FILES_PATH_MAP["ag-grid-community/dist/**"] = `packages/ag-grid-community/dist/**/*.{cjs,js,map}`;
  FILES_PATH_MAP["ag-grid-enterprise/styles/**"] = `packages/ag-grid-enterprise/styles/**/*.css`;
  FILES_PATH_MAP[`ag-grid-enterprise/dist/**`] = `packages/ag-grid-enterprise/dist/**/*.{cjs,js,map}`;
  FILES_PATH_MAP["ag-grid-charts-enterprise/styles/**"] = `packages/ag-grid-charts-enterprise/styles/**/*.css`;
  FILES_PATH_MAP[`ag-grid-charts-enterprise/dist/**`] = `packages/ag-grid-charts-enterprise/dist/**/*.{cjs,js,map}`;
  FILES_PATH_MAP["ag-grid-react/dist/**"] = `packages/ag-grid-react/dist/**/*.{cjs,js,map}`;
  FILES_PATH_MAP["ag-grid-angular/fesm2015/ag-grid-angular.mjs"] = "packages/ag-grid-angular/dist/ag-grid-angular/fesm2015/ag-grid-angular.mjs";
  FILES_PATH_MAP["ag-grid-vue/lib/**"] = "packages/ag-grid-vue/lib/**/*.{cjs,mjs,js,map}";
  FILES_PATH_MAP["ag-grid-vue3/dist/**"] = "packages/ag-grid-vue3/dist/**/*.{cjs,mjs,js,map}";
}
var getWebsiteRootUrl = ({ isDev = getIsDev() } = { isDev: getIsDev() }) => {
  const root = isDev ? (
    // Relative to the folder of this file
    "../../"
  ) : (
    // Relative to `/dist/chunks/pages` folder (Nx specific)
    "../../../"
  );
  return new URL(root, import.meta.url);
};
var getContentRootFileUrl = ({ isDev } = {}) => {
  const websiteRoot = getWebsiteRootUrl({ isDev });
  const contentRoot = pathJoin(websiteRoot, "src/content");
  return new URL(contentRoot, import.meta.url);
};

// src/utils/markdoc/tags/include-markdoc.ts
import fs from "fs";
import path from "path";
var MARKDOC_COMPONENT_CONFIG_KEY = Symbol.for("@astrojs/markdoc/component-config");
function getFilePath(file) {
  const contentRoot = getContentRootFileUrl();
  return path.join(contentRoot.pathname, "docs", file);
}
function componentHasLoaded(node) {
  return !((node == null ? void 0 : node.name) && (node == null ? void 0 : node.name[MARKDOC_COMPONENT_CONFIG_KEY]));
}
function printNonRenderableNode(nodes3) {
  return nodes3.map(({ name }) => {
    const { path: path2, namedExport } = name;
    return `* ${path2}${namedExport ? ` (${namedExport})` : ""}`;
  }).join("\n");
}
var includeMarkdoc = {
  inline: false,
  selfClosing: true,
  attributes: {
    file: { type: String, render: false, required: true },
    variables: { type: Object, render: false }
  },
  transform(node, config) {
    const { file, variables } = node.attributes;
    const markdocFilePath = getFilePath(file);
    const fileExists = fs.existsSync(markdocFilePath);
    if (!fileExists) {
      throw new Error(`Markdoc file \`${file}\` not found. The 'file' must be in \`${markdocFilePath}\``);
    }
    const contents = fs.readFileSync(markdocFilePath).toString();
    const markdocAst = Markdoc2.parse(contents);
    if (!markdocAst)
      return null;
    const scopedConfig = {
      ...config,
      variables: {
        ...config.variables,
        ...variables,
        ["$$includeMarkdoc:filename"]: file
      }
    };
    const findNonRenderableNodes = (node2, nonRenderableNodes = []) => {
      if (Array.isArray(node2)) {
        node2.forEach((n) => {
          if (!componentHasLoaded(n)) {
            nonRenderableNodes.push(n);
          }
          findNonRenderableNodes(n, nonRenderableNodes);
        });
      } else if (node2 == null ? void 0 : node2.children) {
        node2.children = node2.children.map((child) => {
          if (!componentHasLoaded(child)) {
            nonRenderableNodes.push(child);
            return;
          }
          findNonRenderableNodes(child, nonRenderableNodes);
          return child;
        }).filter(Boolean);
      }
      return nonRenderableNodes;
    };
    const transformChildren = (part) => {
      const transformedChildren = part.resolve(scopedConfig).transformChildren(scopedConfig);
      const nonRenderableNodes = findNonRenderableNodes(transformedChildren);
      if (nonRenderableNodes.length) {
        throw new Error(
          `Custom Markdoc tags not loaded before including Markdoc: '${file}'. Custom Markdoc tag render references:

${printNonRenderableNode(nonRenderableNodes)}`
        );
      }
      return transformedChildren;
    };
    return Array.isArray(markdocAst) ? markdocAst.flatMap(transformChildren) : transformChildren(markdocAst);
  }
};

// src/utils/markdoc/tags/link.ts
import { Markdoc as Markdoc3, nodes } from "@astrojs/markdoc/config";

// src/features/docs/constants.ts
var DOCS_FRAMEWORK_PATH_INDEX = SITE_BASE_URL_SEGMENTS + 1;
var DOCS_PAGE_NAME_PATH_INDEX = SITE_BASE_URL_SEGMENTS + 2;

// src/features/docs/utils/urlPaths.ts
function getFrameworkPath(framework) {
  return `${framework}-data-grid`;
}

// src/utils/urlWithPrefix.ts
var urlWithPrefix = ({
  url = "",
  framework,
  siteBaseUrl = SITE_BASE_URL
}) => {
  let path2 = url;
  if (url.startsWith("./")) {
    const frameworkPath = getFrameworkPath(framework);
    path2 = pathJoin("/", siteBaseUrl, frameworkPath, url.slice("./".length));
  } else if (url.startsWith("/")) {
    path2 = pathJoin("/", siteBaseUrl, url);
  } else if (!url.startsWith("#") && !url.startsWith("http") && !url.startsWith("mailto")) {
    const errorMessage = `Invalid url: ${url} - use './' for framework urls, '/' for root urls, '#' for anchor links, and http/mailto for external urls`;
    if (getIsDev()) {
      console.warn(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }
  return path2;
};

// src/utils/markdoc/tags/link.ts
var link = {
  ...nodes.link,
  attributes: {
    ...nodes.link.attributes,
    /**
     * Open link in external tab
     */
    isExternal: { type: Boolean }
  },
  /**
   * Transform markdoc links to add url prefix and framework to href
   */
  transform(node, config) {
    const { framework } = config.variables;
    const children = node.transformChildren(config);
    const nodeAttributes = node.transformAttributes(config);
    const hrefWithFramework = urlWithPrefix({ url: nodeAttributes.href, framework });
    const href = hrefWithFramework.replace("{% $agGridVersion %}", agGridVersion);
    const attributes = {
      ...nodeAttributes,
      ...nodeAttributes.isExternal ? { target: "_blank" } : void 0,
      href
    };
    return new Markdoc3.Tag("a", attributes, children);
  }
};

// markdoc.config.ts
var markdoc_config_default = defineMarkdocConfig({
  variables: {
    agGridVersion
  },
  nodes: {
    heading: {
      ...nodes2.heading,
      // Preserve default anchor link generation
      render: component("./src/components/Heading.astro")
    },
    link,
    fence: {
      attributes: {
        ...Markdoc4.nodes.fence.attributes,
        /**
         * Determine if snippet component is used or not
         *
         * Snippets transform the code based on the user selected framework
         */
        frameworkTransform: Boolean,
        language: String,
        lineNumbers: Boolean,
        suppressFrameworkContext: Boolean,
        spaceBetweenProperties: Boolean,
        inlineReactProperties: Boolean
      },
      render: component("./src/components/snippet/Snippet.astro")
    }
  },
  functions: {
    isFramework: {
      transform(parameters, context) {
        var _a8;
        const pageFramework = (_a8 = context.variables) == null ? void 0 : _a8.framework;
        return Object.values(parameters).includes(pageFramework);
      }
    },
    isNotJavascriptFramework: {
      transform(_, context) {
        var _a8;
        const pageFramework = (_a8 = context.variables) == null ? void 0 : _a8.framework;
        return pageFramework !== "javascript";
      }
    }
  },
  tags: {
    kbd,
    br: {
      render: "br"
    },
    link,
    enterpriseIcon: {
      render: component("../../external/ag-website-shared/src/components/icon/EnterpriseIcon", "EnterpriseIcon")
    },
    includeMarkdoc,
    gridExampleRunner: {
      render: component("./src/features/docs/components/DocsExampleRunner.astro"),
      attributes: {
        title: { type: String, required: true },
        name: { type: String, required: true },
        typescriptOnly: { type: Boolean },
        overrideImportType: { type: String },
        exampleHeight: { type: Number }
      }
    },
    apiDocumentation: {
      render: component("./src/components/reference-documentation/ApiDocumentation.astro"),
      attributes: {
        source: { type: String },
        sources: { type: Array },
        section: { type: String },
        names: { type: Array },
        config: { type: Object },
        // For `getHeadings` parsing
        __apiDocumentationHeadings: { type: Boolean }
      }
    },
    interfaceDocumentation: {
      render: component("./src/components/reference-documentation/InterfaceDocumentation.astro"),
      attributes: {
        interfaceName: { type: String, required: true },
        overrideSrc: { type: String },
        names: { type: Array },
        exclude: { type: Array },
        wrapNamesAt: { type: Number },
        config: { type: Object }
      }
    },
    matrixTable: {
      render: component("./src/features/matrixTable/components/MatrixTable.astro"),
      attributes: {
        /**
         * Data file name within `src/content/matrix-table`
         *
         * Excluding the extension
         */
        dataFileName: { type: String },
        /**
         * Mapping of column keys to the displayed column name and order
         */
        columns: { type: Object, required: true },
        /**
         * Filter condition for filtering row data, as a string
         *
         * NOTE: Only supports simple field key matches, `!key`, `&&` and `||` cases
         */
        filter: { type: String },
        /**
         * Cell renderer to use for the column fields
         */
        cellRenderer: { type: Object }
      }
    },
    note: {
      render: component("../../external/ag-website-shared/src/components/alert/Note")
    },
    warning: {
      render: component("../../external/ag-website-shared/src/components/alert/Warning")
    },
    idea: {
      render: component("../../external/ag-website-shared/src/components/alert/Idea")
    },
    gif: {
      render: component("./src/components/image/Gif.astro"),
      attributes: {
        imagePath: { type: String, required: true },
        alt: { type: String, required: true },
        autoPlay: { type: Boolean },
        wrapped: { type: Boolean }
      }
    },
    embedSnippet: {
      render: component("./src/components/snippet/EmbedSnippet.astro"),
      attributes: {
        /**
         * Source file relative to example folder
         */
        src: { type: String },
        /**
         * Source file url
         */
        url: { type: String },
        language: { type: String },
        lineNumbers: { type: Boolean }
      }
    },
    iframe: {
      render: "iframe",
      attributes: {
        src: { type: String, required: true },
        style: { type: String }
      }
    },
    iconsPanel: {
      render: component("./src/components/icon/IconsPanel.astro")
    },
    image: {
      render: component("./src/components/image/Image.astro"),
      attributes: {
        /**
         * Docs page name in `src/content/[pageName]
         *
         * If not provided, will default to the location of the markdoc file
         */
        pageName: { type: String },
        imagePath: { type: String, required: true },
        alt: { type: String, required: true },
        width: { type: String },
        height: { type: String },
        minWidth: { type: String },
        maxWidth: { type: String },
        margin: { type: String }
      }
    },
    imageCaption: {
      render: component("./src/components/image/ImageCaption.astro"),
      attributes: {
        /**
         * Docs page name in `src/content/[pageName]
         *
         * If not provided, will default to the location of the markdoc file
         */
        pageName: { type: String },
        /**
         * Relative path within markdoc page folder
         */
        imagePath: { type: String, required: true },
        alt: { type: String, required: true },
        centered: { type: Boolean },
        constrained: { type: Boolean },
        descriptionTop: { type: Boolean },
        width: { type: String },
        height: { type: String },
        minWidth: { type: String },
        maxWidth: { type: String },
        /**
         * Enable dark mode CSS filter for image
         *
         * Alternatively, add `-dark` suffixed image in `imagePath` to add
         * dark mode image manually
         */
        enableDarkModeFilter: { type: Boolean },
        /**
         * Autoplay gif
         */
        autoPlay: { type: Boolean }
      }
    },
    flex: {
      render: component("./src/components/flex/Flex.astro"),
      attributes: {
        direction: { type: String, matches: ["row", "column"] },
        alignItems: {
          type: String,
          matches: ["center", "start", "end", "self-start", "self-end", "flex-start", "flex-end"]
        },
        justifyContent: {
          type: String,
          matches: ["center", "start", "end", "self-start", "self-end", "flex-start", "flex-end"]
        },
        gap: {
          type: String,
          matches: ["size-6", "size-10"]
        },
        mobileWrap: {
          type: Boolean
        }
      }
    },
    tabs: {
      render: component("./src/components/tabs/TabsWithHtmlChildren.astro"),
      attributes: {
        omitFromOverview: { type: Boolean, default: false },
        tabItemIdPrefix: {
          type: String,
          default: DOCS_TAB_ITEM_ID_PREFIX
        },
        headerLinks: {
          type: Array
        }
      }
    },
    tabItem: {
      render: component("./src/components/tabs/TabHtmlContent", "TabHtmlContent"),
      attributes: {
        id: { type: String, required: true },
        label: { type: String }
      }
    },
    videoSection: {
      render: component("./src/components/video-section/VideoSection.astro"),
      attributes: {
        id: { type: String },
        title: { type: String },
        showHeader: { type: Boolean }
      }
    },
    learningVideos: {
      render: component("./src/components/learning-videos/LearningVideos.astro"),
      attributes: {
        id: { type: String },
        title: { type: String },
        showHeader: { type: Boolean }
      }
    },
    openInCTA: {
      render: component("./src/components/open-in-cta/OpenInCTA.astro"),
      attributes: {
        type: { type: String, required: true },
        href: { type: String, required: true },
        text: { type: String }
      }
    },
    figmaPreview: {
      render: component("./src/components/figma-preview/FigmaPreview.astro")
    },
    figmaCommunityButton: {
      render: component("./src/components/figma-community-button/FigmaCommunityButton.astro")
    }
  }
});
export {
  markdoc_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vZXh0ZXJuYWwvYWctd2Vic2l0ZS1zaGFyZWQvc3JjL21hcmtkb2MvdGFncy9rYmQudHMiLCAibWFya2RvYy5jb25maWcudHMiLCAiLi4vLi4vY29tbXVuaXR5LW1vZHVsZXMvY29yZS9wYWNrYWdlLmpzb24iLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvdXRpbHMvbWFya2RvYy90YWdzL2luY2x1ZGUtbWFya2RvYy50cyIsICJzcmMvdXRpbHMvcGFnZXMudHMiLCAic3JjL3V0aWxzL2Vudi50cyIsICJzcmMvdXRpbHMvcGF0aEpvaW4udHMiLCAic3JjL3V0aWxzL21hcmtkb2MvdGFncy9saW5rLnRzIiwgInNyYy9mZWF0dXJlcy9kb2NzL2NvbnN0YW50cy50cyIsICJzcmMvZmVhdHVyZXMvZG9jcy91dGlscy91cmxQYXRocy50cyIsICJzcmMvdXRpbHMvdXJsV2l0aFByZWZpeC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgTWFya2RvYywgdHlwZSBSZW5kZXIgfSBmcm9tICdAYXN0cm9qcy9tYXJrZG9jL2NvbmZpZyc7XG5pbXBvcnQgdHlwZSB7IENvbmZpZywgU2NoZW1hIH0gZnJvbSAnQG1hcmtkb2MvbWFya2RvYyc7XG5cbmV4cG9ydCBjb25zdCBrYmQ6IFNjaGVtYTxDb25maWcsIFJlbmRlcj4gPSB7XG4gICAgcmVuZGVyOiAna2JkJyxcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgIHByaW1hcnk6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgfSxcbiAgICB0cmFuc2Zvcm0obm9kZSkge1xuICAgICAgICByZXR1cm4gbmV3IE1hcmtkb2MuVGFnKHRoaXMucmVuZGVyIGFzIHN0cmluZywge30sIFtub2RlLmF0dHJpYnV0ZXMucHJpbWFyeV0pO1xuICAgIH0sXG59O1xuIiwgImltcG9ydCB7IGtiZCB9IGZyb20gJ0BhZy13ZWJzaXRlLXNoYXJlZC9tYXJrZG9jL3RhZ3Mva2JkJztcbmltcG9ydCB7IE1hcmtkb2MsIGNvbXBvbmVudCwgZGVmaW5lTWFya2RvY0NvbmZpZywgbm9kZXMgfSBmcm9tICdAYXN0cm9qcy9tYXJrZG9jL2NvbmZpZyc7XG5cbmltcG9ydCB7IERPQ1NfVEFCX0lURU1fSURfUFJFRklYLCBhZ0dyaWRWZXJzaW9uIH0gZnJvbSAnLi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7IGluY2x1ZGVNYXJrZG9jIH0gZnJvbSAnLi9zcmMvdXRpbHMvbWFya2RvYy90YWdzL2luY2x1ZGUtbWFya2RvYyc7XG5pbXBvcnQgeyBsaW5rIH0gZnJvbSAnLi9zcmMvdXRpbHMvbWFya2RvYy90YWdzL2xpbmsnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVNYXJrZG9jQ29uZmlnKHtcbiAgICB2YXJpYWJsZXM6IHtcbiAgICAgICAgYWdHcmlkVmVyc2lvbixcbiAgICB9LFxuICAgIG5vZGVzOiB7XG4gICAgICAgIGhlYWRpbmc6IHtcbiAgICAgICAgICAgIC4uLm5vZGVzLmhlYWRpbmcsIC8vIFByZXNlcnZlIGRlZmF1bHQgYW5jaG9yIGxpbmsgZ2VuZXJhdGlvblxuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4vc3JjL2NvbXBvbmVudHMvSGVhZGluZy5hc3RybycpLFxuICAgICAgICB9LFxuICAgICAgICBsaW5rLFxuICAgICAgICBmZW5jZToge1xuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIC4uLk1hcmtkb2Mubm9kZXMuZmVuY2UuYXR0cmlidXRlcyEsXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogRGV0ZXJtaW5lIGlmIHNuaXBwZXQgY29tcG9uZW50IGlzIHVzZWQgb3Igbm90XG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBTbmlwcGV0cyB0cmFuc2Zvcm0gdGhlIGNvZGUgYmFzZWQgb24gdGhlIHVzZXIgc2VsZWN0ZWQgZnJhbWV3b3JrXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrVHJhbnNmb3JtOiBCb29sZWFuLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBTdHJpbmcsXG4gICAgICAgICAgICAgICAgbGluZU51bWJlcnM6IEJvb2xlYW4sXG4gICAgICAgICAgICAgICAgc3VwcHJlc3NGcmFtZXdvcmtDb250ZXh0OiBCb29sZWFuLFxuICAgICAgICAgICAgICAgIHNwYWNlQmV0d2VlblByb3BlcnRpZXM6IEJvb2xlYW4sXG4gICAgICAgICAgICAgICAgaW5saW5lUmVhY3RQcm9wZXJ0aWVzOiBCb29sZWFuLFxuICAgICAgICAgICAgfSBhcyBhbnksXG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvY29tcG9uZW50cy9zbmlwcGV0L1NuaXBwZXQuYXN0cm8nKSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGZ1bmN0aW9uczoge1xuICAgICAgICBpc0ZyYW1ld29yazoge1xuICAgICAgICAgICAgdHJhbnNmb3JtKHBhcmFtZXRlcnMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlRnJhbWV3b3JrID0gY29udGV4dC52YXJpYWJsZXM/LmZyYW1ld29yaztcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhwYXJhbWV0ZXJzKS5pbmNsdWRlcyhwYWdlRnJhbWV3b3JrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGlzTm90SmF2YXNjcmlwdEZyYW1ld29yazoge1xuICAgICAgICAgICAgdHJhbnNmb3JtKF8sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlRnJhbWV3b3JrID0gY29udGV4dC52YXJpYWJsZXM/LmZyYW1ld29yaztcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFnZUZyYW1ld29yayAhPT0gJ2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHRhZ3M6IHtcbiAgICAgICAga2JkLFxuICAgICAgICBicjoge1xuICAgICAgICAgICAgcmVuZGVyOiAnYnInLFxuICAgICAgICB9LFxuICAgICAgICBsaW5rLFxuICAgICAgICBlbnRlcnByaXNlSWNvbjoge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4uLy4uL2V4dGVybmFsL2FnLXdlYnNpdGUtc2hhcmVkL3NyYy9jb21wb25lbnRzL2ljb24vRW50ZXJwcmlzZUljb24nLCAnRW50ZXJwcmlzZUljb24nKSxcbiAgICAgICAgfSxcbiAgICAgICAgaW5jbHVkZU1hcmtkb2MsXG4gICAgICAgIGdyaWRFeGFtcGxlUnVubmVyOiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvZmVhdHVyZXMvZG9jcy9jb21wb25lbnRzL0RvY3NFeGFtcGxlUnVubmVyLmFzdHJvJyksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHR5cGVzY3JpcHRPbmx5OiB7IHR5cGU6IEJvb2xlYW4gfSxcbiAgICAgICAgICAgICAgICBvdmVycmlkZUltcG9ydFR5cGU6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgZXhhbXBsZUhlaWdodDogeyB0eXBlOiBOdW1iZXIgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGFwaURvY3VtZW50YXRpb246IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL3JlZmVyZW5jZS1kb2N1bWVudGF0aW9uL0FwaURvY3VtZW50YXRpb24uYXN0cm8nKSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgc291cmNlczogeyB0eXBlOiBBcnJheSB9LFxuICAgICAgICAgICAgICAgIHNlY3Rpb246IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgbmFtZXM6IHsgdHlwZTogQXJyYXkgfSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHsgdHlwZTogT2JqZWN0IH0sXG5cbiAgICAgICAgICAgICAgICAvLyBGb3IgYGdldEhlYWRpbmdzYCBwYXJzaW5nXG4gICAgICAgICAgICAgICAgX19hcGlEb2N1bWVudGF0aW9uSGVhZGluZ3M6IHsgdHlwZTogQm9vbGVhbiB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaW50ZXJmYWNlRG9jdW1lbnRhdGlvbjoge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4vc3JjL2NvbXBvbmVudHMvcmVmZXJlbmNlLWRvY3VtZW50YXRpb24vSW50ZXJmYWNlRG9jdW1lbnRhdGlvbi5hc3RybycpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIGludGVyZmFjZU5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIG92ZXJyaWRlU3JjOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgICAgIG5hbWVzOiB7IHR5cGU6IEFycmF5IH0sXG4gICAgICAgICAgICAgICAgZXhjbHVkZTogeyB0eXBlOiBBcnJheSB9LFxuICAgICAgICAgICAgICAgIHdyYXBOYW1lc0F0OiB7IHR5cGU6IE51bWJlciB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZzogeyB0eXBlOiBPYmplY3QgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIG1hdHJpeFRhYmxlOiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvZmVhdHVyZXMvbWF0cml4VGFibGUvY29tcG9uZW50cy9NYXRyaXhUYWJsZS5hc3RybycpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIERhdGEgZmlsZSBuYW1lIHdpdGhpbiBgc3JjL2NvbnRlbnQvbWF0cml4LXRhYmxlYFxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogRXhjbHVkaW5nIHRoZSBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBkYXRhRmlsZU5hbWU6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogTWFwcGluZyBvZiBjb2x1bW4ga2V5cyB0byB0aGUgZGlzcGxheWVkIGNvbHVtbiBuYW1lIGFuZCBvcmRlclxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbHVtbnM6IHsgdHlwZTogT2JqZWN0LCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEZpbHRlciBjb25kaXRpb24gZm9yIGZpbHRlcmluZyByb3cgZGF0YSwgYXMgYSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIE5PVEU6IE9ubHkgc3VwcG9ydHMgc2ltcGxlIGZpZWxkIGtleSBtYXRjaGVzLCBgIWtleWAsIGAmJmAgYW5kIGB8fGAgY2FzZXNcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQ2VsbCByZW5kZXJlciB0byB1c2UgZm9yIHRoZSBjb2x1bW4gZmllbGRzXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiB7IHR5cGU6IE9iamVjdCB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgbm90ZToge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4uLy4uL2V4dGVybmFsL2FnLXdlYnNpdGUtc2hhcmVkL3NyYy9jb21wb25lbnRzL2FsZXJ0L05vdGUnKSxcbiAgICAgICAgfSxcbiAgICAgICAgd2FybmluZzoge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4uLy4uL2V4dGVybmFsL2FnLXdlYnNpdGUtc2hhcmVkL3NyYy9jb21wb25lbnRzL2FsZXJ0L1dhcm5pbmcnKSxcbiAgICAgICAgfSxcbiAgICAgICAgaWRlYToge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4uLy4uL2V4dGVybmFsL2FnLXdlYnNpdGUtc2hhcmVkL3NyYy9jb21wb25lbnRzL2FsZXJ0L0lkZWEnKSxcbiAgICAgICAgfSxcbiAgICAgICAgZ2lmOiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvY29tcG9uZW50cy9pbWFnZS9HaWYuYXN0cm8nKSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVBhdGg6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGFsdDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgYXV0b1BsYXk6IHsgdHlwZTogQm9vbGVhbiB9LFxuICAgICAgICAgICAgICAgIHdyYXBwZWQ6IHsgdHlwZTogQm9vbGVhbiB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgZW1iZWRTbmlwcGV0OiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvY29tcG9uZW50cy9zbmlwcGV0L0VtYmVkU25pcHBldC5hc3RybycpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIFNvdXJjZSBmaWxlIHJlbGF0aXZlIHRvIGV4YW1wbGUgZm9sZGVyXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgc3JjOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIFNvdXJjZSBmaWxlIHVybFxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHVybDogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVyczogeyB0eXBlOiBCb29sZWFuIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBpZnJhbWU6IHtcbiAgICAgICAgICAgIHJlbmRlcjogJ2lmcmFtZScsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgc3JjOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICBzdHlsZTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25zUGFuZWw6IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL2ljb24vSWNvbnNQYW5lbC5hc3RybycpLFxuICAgICAgICB9LFxuICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4vc3JjL2NvbXBvbmVudHMvaW1hZ2UvSW1hZ2UuYXN0cm8nKSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBEb2NzIHBhZ2UgbmFtZSBpbiBgc3JjL2NvbnRlbnQvW3BhZ2VOYW1lXVxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogSWYgbm90IHByb3ZpZGVkLCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxvY2F0aW9uIG9mIHRoZSBtYXJrZG9jIGZpbGVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBwYWdlTmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgICAgICBpbWFnZVBhdGg6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGFsdDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgd2lkdGg6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgICAgIG1pbldpZHRoOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgICAgIG1hcmdpbjogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGltYWdlQ2FwdGlvbjoge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4vc3JjL2NvbXBvbmVudHMvaW1hZ2UvSW1hZ2VDYXB0aW9uLmFzdHJvJyksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogRG9jcyBwYWdlIG5hbWUgaW4gYHNyYy9jb250ZW50L1twYWdlTmFtZV1cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIElmIG5vdCBwcm92aWRlZCwgd2lsbCBkZWZhdWx0IHRvIHRoZSBsb2NhdGlvbiBvZiB0aGUgbWFya2RvYyBmaWxlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcGFnZU5hbWU6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogUmVsYXRpdmUgcGF0aCB3aXRoaW4gbWFya2RvYyBwYWdlIGZvbGRlclxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGltYWdlUGF0aDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgYWx0OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICBjZW50ZXJlZDogeyB0eXBlOiBCb29sZWFuIH0sXG4gICAgICAgICAgICAgICAgY29uc3RyYWluZWQ6IHsgdHlwZTogQm9vbGVhbiB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uVG9wOiB7IHR5cGU6IEJvb2xlYW4gfSxcbiAgICAgICAgICAgICAgICB3aWR0aDogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgbWluV2lkdGg6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgbWF4V2lkdGg6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogRW5hYmxlIGRhcmsgbW9kZSBDU1MgZmlsdGVyIGZvciBpbWFnZVxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQWx0ZXJuYXRpdmVseSwgYWRkIGAtZGFya2Agc3VmZml4ZWQgaW1hZ2UgaW4gYGltYWdlUGF0aGAgdG8gYWRkXG4gICAgICAgICAgICAgICAgICogZGFyayBtb2RlIGltYWdlIG1hbnVhbGx5XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZW5hYmxlRGFya01vZGVGaWx0ZXI6IHsgdHlwZTogQm9vbGVhbiB9LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEF1dG9wbGF5IGdpZlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGF1dG9QbGF5OiB7IHR5cGU6IEJvb2xlYW4gfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGZsZXg6IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL2ZsZXgvRmxleC5hc3RybycpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogeyB0eXBlOiBTdHJpbmcsIG1hdGNoZXM6IFsncm93JywgJ2NvbHVtbiddIH0sXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXM6IFsnY2VudGVyJywgJ3N0YXJ0JywgJ2VuZCcsICdzZWxmLXN0YXJ0JywgJ3NlbGYtZW5kJywgJ2ZsZXgtc3RhcnQnLCAnZmxleC1lbmQnXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlczogWydjZW50ZXInLCAnc3RhcnQnLCAnZW5kJywgJ3NlbGYtc3RhcnQnLCAnc2VsZi1lbmQnLCAnZmxleC1zdGFydCcsICdmbGV4LWVuZCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2FwOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlczogWydzaXplLTYnLCAnc2l6ZS0xMCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbW9iaWxlV3JhcDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB0YWJzOiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvY29tcG9uZW50cy90YWJzL1RhYnNXaXRoSHRtbENoaWxkcmVuLmFzdHJvJyksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgb21pdEZyb21PdmVydmlldzogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgICAgICAgICAgICAgIHRhYkl0ZW1JZFByZWZpeDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IERPQ1NfVEFCX0lURU1fSURfUFJFRklYLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZGVyTGlua3M6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRhYkl0ZW06IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL3RhYnMvVGFiSHRtbENvbnRlbnQnLCAnVGFiSHRtbENvbnRlbnQnKSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBpZDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB2aWRlb1NlY3Rpb246IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL3ZpZGVvLXNlY3Rpb24vVmlkZW9TZWN0aW9uLmFzdHJvJyksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgdGl0bGU6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgc2hvd0hlYWRlcjogeyB0eXBlOiBCb29sZWFuIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsZWFybmluZ1ZpZGVvczoge1xuICAgICAgICAgICAgcmVuZGVyOiBjb21wb25lbnQoJy4vc3JjL2NvbXBvbmVudHMvbGVhcm5pbmctdmlkZW9zL0xlYXJuaW5nVmlkZW9zLmFzdHJvJyksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgdGl0bGU6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICAgICAgc2hvd0hlYWRlcjogeyB0eXBlOiBCb29sZWFuIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBvcGVuSW5DVEE6IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL29wZW4taW4tY3RhL09wZW5JbkNUQS5hc3RybycpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIGhyZWY6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHRleHQ6IHsgdHlwZTogU3RyaW5nIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBmaWdtYVByZXZpZXc6IHtcbiAgICAgICAgICAgIHJlbmRlcjogY29tcG9uZW50KCcuL3NyYy9jb21wb25lbnRzL2ZpZ21hLXByZXZpZXcvRmlnbWFQcmV2aWV3LmFzdHJvJyksXG4gICAgICAgIH0sXG4gICAgICAgIGZpZ21hQ29tbXVuaXR5QnV0dG9uOiB7XG4gICAgICAgICAgICByZW5kZXI6IGNvbXBvbmVudCgnLi9zcmMvY29tcG9uZW50cy9maWdtYS1jb21tdW5pdHktYnV0dG9uL0ZpZ21hQ29tbXVuaXR5QnV0dG9uLmFzdHJvJyksXG4gICAgICAgIH0sXG4gICAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMzEuMi4wXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJBZHZhbmNlZCBEYXRhIEdyaWQgLyBEYXRhIFRhYmxlIHN1cHBvcnRpbmcgSmF2YXNjcmlwdCAvIFR5cGVzY3JpcHQgLyBSZWFjdCAvIEFuZ3VsYXIgLyBWdWVcIixcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwidHNsaWJcIjogXCJeMi4zLjBcIlxuICB9LFxuICBcIm1haW5cIjogXCIuL2Rpc3QvcGFja2FnZS9tYWluLmNqcy5qc1wiLFxuICBcInR5cGVzXCI6IFwiLi9kaXN0L3R5cGVzL3NyYy9tYWluLmQudHNcIixcbiAgXCJtb2R1bGVcIjogXCIuL2Rpc3QvcGFja2FnZS9tYWluLmVzbS5tanNcIixcbiAgXCJleHBvcnRzXCI6IHtcbiAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9wYWNrYWdlL21haW4uZXNtLm1qc1wiLFxuICAgIFwicmVxdWlyZVwiOiBcIi4vZGlzdC9wYWNrYWdlL21haW4uY2pzLmpzXCIsXG4gICAgXCJ0eXBlc1wiOiBcIi4vZGlzdC90eXBlcy9zcmMvbWFpbi5kLnRzXCIsXG4gICAgXCJkZWZhdWx0XCI6IFwiLi9kaXN0L3BhY2thZ2UvbWFpbi5janMuanNcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdHlwZXMvamVzdFwiOiBcIl4yOS41LjBcIixcbiAgICBcImplc3RcIjogXCJeMjkuNS4wXCIsXG4gICAgXCJqZXN0LWVudmlyb25tZW50LWpzZG9tXCI6IFwiXjI5LjcuMFwiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vYWctZ3JpZC9hZy1ncmlkLmdpdFwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiYWdcIixcbiAgICBcImFnLWdyaWRcIixcbiAgICBcImRhdGFncmlkXCIsXG4gICAgXCJkYXRhLWdyaWRcIixcbiAgICBcImRhdGF0YWJsZVwiLFxuICAgIFwiZGF0YS10YWJsZVwiLFxuICAgIFwiZ3JpZFwiLFxuICAgIFwidGFibGVcIixcbiAgICBcInJlYWN0XCIsXG4gICAgXCJ0YWJsZVwiLFxuICAgIFwiYW5ndWxhclwiLFxuICAgIFwiYW5ndWxhci1jb21wb25lbnRcIixcbiAgICBcInJlYWN0XCIsXG4gICAgXCJyZWFjdC1jb21wb25lbnRcIixcbiAgICBcInJlYWN0anNcIixcbiAgICBcInZ1ZVwiLFxuICAgIFwidnVlanNcIlxuICBdLFxuICBcImF1dGhvclwiOiBcIlNlYW4gTGFuZHNtYW4gPHNlYW5AdGhlbGFuZHNtYW5zLmNvbT5cIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vYWctZ3JpZC9hZy1ncmlkL2lzc3Vlc1wiXG4gIH0sXG4gIFwiYnJvd3NlcnNsaXN0XCI6IFtcbiAgICBcIj4gMSVcIixcbiAgICBcImxhc3QgMiB2ZXJzaW9uc1wiLFxuICAgIFwibm90IGllID49IDBcIixcbiAgICBcIm5vdCBpZV9tb2IgPj0gMFwiXG4gIF0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL3d3dy5hZy1ncmlkLmNvbS9cIixcbiAgXCJwdWJsaXNoQ29uZmlnXCI6IHtcbiAgICBcImFjY2Vzc1wiOiBcInB1YmxpY1wiXG4gIH1cbn0iLCAiaW1wb3J0IGNvcmVQYWNrYWdlSnNvbiBmcm9tICcuLi8uLi8uLi9jb21tdW5pdHktbW9kdWxlcy9jb3JlL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgdHlwZSB7IEZyYW1ld29yaywgSW1wb3J0VHlwZSwgSW50ZXJuYWxGcmFtZXdvcmsgfSBmcm9tICcuL3R5cGVzL2FnLWdyaWQnO1xuXG4vLyBTcGVlZCB1cCB0aGUgYnVpbGRzIGJ5IG9ubHkgYnVpbGRpbmcgc29tZSBvZiB0aGUgZnJhbWV3b3Jrcy9wYWdlc1xuY29uc3QgcXVpY2tCdWlsZFBhZ2VzID0gaW1wb3J0Lm1ldGEuZW52Py5RVUlDS19CVUlMRF9QQUdFUztcbmV4cG9ydCBjb25zdCBRVUlDS19CVUlMRF9QQUdFUzogc3RyaW5nW10gPSBxdWlja0J1aWxkUGFnZXMgPyBxdWlja0J1aWxkUGFnZXMuc3BsaXQoJywnKSA6IHVuZGVmaW5lZDtcblxuZXhwb3J0IGNvbnN0IEZSQU1FV09SS1M6IHJlYWRvbmx5IEZyYW1ld29ya1tdID0gWydyZWFjdCcsICdhbmd1bGFyJywgJ3Z1ZScsICdqYXZhc2NyaXB0J10gYXMgY29uc3Q7XG5leHBvcnQgY29uc3QgREVGQVVMVF9GUkFNRVdPUks6IEZyYW1ld29yayA9IEZSQU1FV09SS1NbMF07XG5leHBvcnQgY29uc3QgREVGQVVMVF9JTlRFUk5BTF9GUkFNRVdPUks6IEludGVybmFsRnJhbWV3b3JrID0gJ3JlYWN0RnVuY3Rpb25hbCc7XG5cbmV4cG9ydCBjb25zdCBVU0VfUEFDS0FHRVMgPSB0cnVlOyAvLyBwcm9jZXNzLmVudj8uVVNFX1BBQ0tBR0VTID8/IGZhbHNlO1xuXG5leHBvcnQgY29uc3QgSU5URVJOQUxfRlJBTUVXT1JLUzogcmVhZG9ubHkgSW50ZXJuYWxGcmFtZXdvcmtbXSA9IFVTRV9QQUNLQUdFU1xuICAgID8gWyd2YW5pbGxhJywgJ3R5cGVzY3JpcHQnLCAncmVhY3RGdW5jdGlvbmFsJywgJ3JlYWN0RnVuY3Rpb25hbFRzJywgJ2FuZ3VsYXInLCAndnVlJywgJ3Z1ZTMnXVxuICAgIDogKFsndHlwZXNjcmlwdCcsICdyZWFjdEZ1bmN0aW9uYWwnLCAncmVhY3RGdW5jdGlvbmFsVHMnLCAnYW5ndWxhcicsICd2dWUnLCAndnVlMyddIGFzIGNvbnN0KTtcblxuZXhwb3J0IGNvbnN0IEZSQU1FV09SS19ESVNQTEFZX1RFWFQ6IFJlY29yZDxGcmFtZXdvcmssIHN0cmluZz4gPSB7XG4gICAgamF2YXNjcmlwdDogJ0phdmFTY3JpcHQnLFxuICAgIHJlYWN0OiAnUmVhY3QnLFxuICAgIGFuZ3VsYXI6ICdBbmd1bGFyJyxcbiAgICB2dWU6ICdWdWUnLFxufTtcblxuZXhwb3J0IGNvbnN0IElNUE9SVF9UWVBFUzogSW1wb3J0VHlwZVtdID0gVVNFX1BBQ0tBR0VTID8gWydtb2R1bGVzJywgJ3BhY2thZ2VzJ10gOiBbJ21vZHVsZXMnXTtcblxuZXhwb3J0IGNvbnN0IGFnR3JpZFZlcnNpb24gPSBpbXBvcnQubWV0YS5lbnY/LlBVQkxJQ19QQUNLQUdFX1ZFUlNJT04gPz8gY29yZVBhY2thZ2VKc29uLnZlcnNpb247XG5leHBvcnQgY29uc3QgYWdHcmlkRW50ZXJwcmlzZVZlcnNpb24gPSBhZ0dyaWRWZXJzaW9uO1xuZXhwb3J0IGNvbnN0IGFnR3JpZFJlYWN0VmVyc2lvbiA9IGFnR3JpZFZlcnNpb247XG5leHBvcnQgY29uc3QgYWdHcmlkQW5ndWxhclZlcnNpb24gPSBhZ0dyaWRWZXJzaW9uO1xuZXhwb3J0IGNvbnN0IGFnR3JpZFZ1ZVZlcnNpb24gPSBhZ0dyaWRWZXJzaW9uO1xuZXhwb3J0IGNvbnN0IGFnR3JpZFZ1ZTNWZXJzaW9uID0gYWdHcmlkVmVyc2lvbjtcblxuZXhwb3J0IGNvbnN0IE5QTV9DRE4gPSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbSc7XG5leHBvcnQgY29uc3QgUFVCTElTSEVEX1VSTFMgPSB7XG4gICAgJ0BhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMnOiBgJHtOUE1fQ0ROfS9AYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzQCR7YWdHcmlkVmVyc2lvbn1gLFxuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvcmVhY3QnOiBgJHtOUE1fQ0ROfS9AYWctZ3JpZC1jb21tdW5pdHkvcmVhY3RAJHthZ0dyaWRSZWFjdFZlcnNpb259L2AsXG4gICAgJ0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyJzogYCR7TlBNX0NETn0vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXJAJHthZ0dyaWRBbmd1bGFyVmVyc2lvbn0vYCxcbiAgICAnQGFnLWdyaWQtY29tbXVuaXR5L3Z1ZSc6IGAke05QTV9DRE59L0BhZy1ncmlkLWNvbW11bml0eS92dWVAJHthZ0dyaWRWdWVWZXJzaW9ufS9gLFxuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvdnVlMyc6IGAke05QTV9DRE59L0BhZy1ncmlkLWNvbW11bml0eS92dWUzQCR7YWdHcmlkVnVlM1ZlcnNpb259L2AsXG4gICAgJ2FnLWdyaWQtY29tbXVuaXR5JzogYCR7TlBNX0NETn0vYWctZ3JpZC1jb21tdW5pdHlAJHthZ0dyaWRWZXJzaW9ufWAsXG4gICAgJ2FnLWdyaWQtZW50ZXJwcmlzZSc6IGAke05QTV9DRE59L2FnLWdyaWQtZW50ZXJwcmlzZUAke2FnR3JpZEVudGVycHJpc2VWZXJzaW9ufS9gLFxuICAgICdhZy1ncmlkLWNoYXJ0cy1lbnRlcnByaXNlJzogYCR7TlBNX0NETn0vYWctZ3JpZC1jaGFydHMtZW50ZXJwcmlzZUAke2FnR3JpZEVudGVycHJpc2VWZXJzaW9ufS9gLFxuICAgICdhZy1ncmlkLWFuZ3VsYXInOiBgJHtOUE1fQ0ROfS9hZy1ncmlkLWFuZ3VsYXJAJHthZ0dyaWRBbmd1bGFyVmVyc2lvbn0vYCxcbiAgICAnYWctZ3JpZC1yZWFjdCc6IGAke05QTV9DRE59L2FnLWdyaWQtcmVhY3RAJHthZ0dyaWRSZWFjdFZlcnNpb259L2AsXG4gICAgJ2FnLWdyaWQtdnVlJzogYCR7TlBNX0NETn0vYWctZ3JpZC12dWVAJHthZ0dyaWRWdWVWZXJzaW9ufS9gLFxuICAgICdhZy1ncmlkLXZ1ZTMnOiBgJHtOUE1fQ0ROfS9hZy1ncmlkLXZ1ZTNAJHthZ0dyaWRWdWUzVmVyc2lvbn0vYCxcbn07XG5cbi8vIHdoZXRoZXIgaW50ZWdyYXRlZCBjaGFydHMgaW5jbHVkZXMgYWctY2hhcnRzLWVudGVycHJpc2Ugb3IganVzdCBhZy1jaGFydHMtY29tbXVuaXR5XG4vLyBhbHNvIG5lZWQgdG8gdXBkYXRlIHBsdWdpbnMvYWctZ3JpZC1nZW5lcmF0ZS1leGFtcGxlLWZpbGVzL3NyYy9leGVjdXRvcnMvZ2VuZXJhdGUvZ2VuZXJhdG9yL2NvbnN0YW50cy50cyBpZiB0aGlzIHZhbHVlIGlzIGNoYW5nZWRcbmV4cG9ydCBjb25zdCBpbnRlZ3JhdGVkQ2hhcnRzVXNlc0NoYXJ0c0VudGVycHJpc2UgPSB0cnVlO1xuZXhwb3J0IGNvbnN0IFBVQkxJU0hFRF9VTURfVVJMUyA9IHtcbiAgICAnYWctZ3JpZC1jb21tdW5pdHknOiBgJHtOUE1fQ0ROfS9hZy1ncmlkLWNvbW11bml0eUAke2FnR3JpZFZlcnNpb259L2Rpc3QvYWctZ3JpZC1jb21tdW5pdHkuanNgLFxuICAgICdhZy1ncmlkLWVudGVycHJpc2UnOiBgJHtOUE1fQ0ROfS9hZy1ncmlkLSR7aW50ZWdyYXRlZENoYXJ0c1VzZXNDaGFydHNFbnRlcnByaXNlID8gJ2NoYXJ0cy0nIDogJyd9ZW50ZXJwcmlzZUAke2FnR3JpZFZlcnNpb259L2Rpc3QvYWctZ3JpZC0ke2ludGVncmF0ZWRDaGFydHNVc2VzQ2hhcnRzRW50ZXJwcmlzZSA/ICdjaGFydHMtJyA6ICcnfWVudGVycHJpc2UuanNgLFxufTtcblxuZXhwb3J0IGNvbnN0IERPQ1NfVEFCX0lURU1fSURfUFJFRklYID0gJ3JlZmVyZW5jZS0nO1xuXG5leHBvcnQgY29uc3QgZ2V0RW50ZXJwcmlzZVBhY2thZ2VOYW1lID0gKCkgPT5cbiAgICBgYWctZ3JpZC0ke2ludGVncmF0ZWRDaGFydHNVc2VzQ2hhcnRzRW50ZXJwcmlzZSA/ICdjaGFydHMtJyA6ICcnfWVudGVycHJpc2VgO1xuXG4vKipcbiAqIFNpdGUgYmFzZSBVUkxcbiAqXG4gKiBpZSB1bmRlZmluZWQgZm9yIGRldiwgL2FnLWNoYXJ0cyBmb3Igc3RhZ2luZ1xuICpcbiAqIE5PVEU6IEluY2x1ZGVzIHRyYWlsaW5nIHNsYXNoIChgL2ApXG4gKi9cbmV4cG9ydCBjb25zdCBTSVRFX0JBU0VfVVJMID1cbiAgICAvLyBBc3RybyBkZWZhdWx0IGVudiB2YXIgKGZvciBidWlsZCB0aW1lKVxuICAgIGltcG9ydC5tZXRhLmVudj8uQkFTRV9VUkwgfHxcbiAgICAvLyBgLmVudi4qYCBvdmVycmlkZSAoZm9yIGNsaWVudCBzaWRlKVxuICAgIGltcG9ydC5tZXRhLmVudj8uUFVCTElDX0JBU0VfVVJMLnJlcGxhY2UoL1xcLz8kLywgJy8nKTtcblxuLypcbiAqIFNpdGUgVVJMXG4gKlxuICogaWUgaHR0cDovL2xvY2FsaG9zdDo0NjEwIGZvciBkZXYsIGh0dHBzOi8vZ3JpZC1zdGFnaW5nLmFnLWdyaWQuY29tIGZvciBzdGFnaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBTSVRFX1VSTCA9IGltcG9ydC5tZXRhLmVudj8uU0lURV9VUkwgfHwgaW1wb3J0Lm1ldGEuZW52Py5QVUJMSUNfU0lURV9VUkw7XG5cbmV4cG9ydCBjb25zdCBTVEFHSU5HX1NJVEVfVVJMID0gJ2h0dHBzOi8vZ3JpZC1zdGFnaW5nLmFnLWdyaWQuY29tJztcbmV4cG9ydCBjb25zdCBQUk9EVUNUSU9OX1NJVEVfVVJMID0gJ2h0dHBzOi8vYWctZ3JpZC5jb20nO1xuZXhwb3J0IGNvbnN0IFVTRV9QVUJMSVNIRURfUEFDS0FHRVMgPSBbJzEnLCAndHJ1ZSddLmluY2x1ZGVzKGltcG9ydC5tZXRhLmVudj8uUFVCTElDX1VTRV9QVUJMSVNIRURfUEFDS0FHRVMpO1xuXG4vKipcbiAqIEVuYWJsZSBkZWJ1ZyBwYWdlcyB0byBiZSBidWlsdFxuICovXG5leHBvcnQgY29uc3QgRU5BQkxFX0dFTkVSQVRFX0RFQlVHX1BBR0VTID0gaW1wb3J0Lm1ldGEuZW52Py5FTkFCTEVfR0VORVJBVEVfREVCVUdfUEFHRVM7XG5cbi8qKlxuICogU2hvdyBkZWJ1ZyBsb2dzXG4gKi9cbmV4cG9ydCBjb25zdCBTSE9XX0RFQlVHX0xPR1MgPSBpbXBvcnQubWV0YS5lbnY/LlNIT1dfREVCVUdfTE9HUztcblxuLyoqXG4gKiBOdW1iZXIgb2YgVVJMIHNlZ21lbnRzIGluIGBTSVRFX0JBU0VfVVJMYFxuICovXG5leHBvcnQgY29uc3QgU0lURV9CQVNFX1VSTF9TRUdNRU5UUyA9IFNJVEVfQkFTRV9VUkw/LnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCB8fCAwO1xuXG4vKipcbiAqIFVSTCBwcmVmaXggdG8gc2VydmUgZmlsZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEZJTEVTX0JBU0VfUEFUSCA9ICcvZmlsZXMnO1xuXG4vKlxuICogQ2hhcnRzIFVSTFxuICovXG5mdW5jdGlvbiBnZXRDaGFydHNVcmwoKSB7XG4gICAgaWYgKFNJVEVfVVJMID09IG51bGwpIHJldHVybjtcblxuICAgIGlmIChTSVRFX1VSTD8uaW5jbHVkZXMoJ2xvY2FsaG9zdDo0NjEwJykpIHtcbiAgICAgICAgcmV0dXJuICdodHRwczovL2xvY2FsaG9zdDo0NjAwJztcbiAgICB9IGVsc2UgaWYgKFNJVEVfVVJMPy5pbmNsdWRlcyhTVEFHSU5HX1NJVEVfVVJMKSkge1xuICAgICAgICByZXR1cm4gJ2h0dHBzOi8vY2hhcnRzLXN0YWdpbmcuYWctZ3JpZC5jb20nO1xuICAgIH1cbiAgICByZXR1cm4gJ2h0dHBzOi8vY2hhcnRzLmFnLWdyaWQuY29tJztcbn1cbmV4cG9ydCBjb25zdCBDSEFSVFNfU0lURV9VUkwgPSBnZXRDaGFydHNVcmwoKTtcbiIsICJpbXBvcnQgTWFya2RvYywgeyB0eXBlIENvbmZpZywgdHlwZSBOb2RlLCB0eXBlIFJlbmRlcmFibGVUcmVlTm9kZSwgdHlwZSBTY2hlbWEgfSBmcm9tICdAbWFya2RvYy9tYXJrZG9jJztcbmltcG9ydCB7IGdldENvbnRlbnRSb290RmlsZVVybCB9IGZyb20gJ0B1dGlscy9wYWdlcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8qKlxuICogTWFya2RvYyBjb2RlIGNvbmZpZ3VyYXRpb24ga2V5XG4gKlxuICogQ29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3dpdGhhc3Ryby9hc3Ryby9ibG9iLzk3M2EwN2ZmMjUxZjc4ZWE0OGRiODQwYWQ4NTczY2Q5MjEzZjcxMDUvcGFja2FnZXMvaW50ZWdyYXRpb25zL21hcmtkb2Mvc3JjL3V0aWxzLnRzI0w3OEMxNC1MNzhDMzVcbiAqL1xuY29uc3QgTUFSS0RPQ19DT01QT05FTlRfQ09ORklHX0tFWSA9IFN5bWJvbC5mb3IoJ0Bhc3Ryb2pzL21hcmtkb2MvY29tcG9uZW50LWNvbmZpZycpO1xuXG5mdW5jdGlvbiBnZXRGaWxlUGF0aChmaWxlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb250ZW50Um9vdCA9IGdldENvbnRlbnRSb290RmlsZVVybCgpO1xuICAgIHJldHVybiBwYXRoLmpvaW4oY29udGVudFJvb3QucGF0aG5hbWUsICdkb2NzJywgZmlsZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBub2RlIGhhcyBsb2FkZWQgYW5kIGlzIHJlbmRlcmFibGVcbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50SGFzTG9hZGVkKG5vZGU6IFJlbmRlcmFibGVUcmVlTm9kZSkge1xuICAgIC8vIElmIHRoZSBtYXJrZG9jIGludGVncmF0aW9uIGhhcyBub3QgbG9hZGVkIHRoZSBjb21wb25lbnQsIHRoZSBub2RlIGlzIGFcbiAgICAvLyBtYXJrZG9jIGNvbXBvbmVudCBjb25maWcgb2JqZWN0IGVnLCBpZiBpdCBoYXMgYmVlbiBsb2FkZWQgYXMgYSBwYXJ0aWFsIGJlZm9yZVxuICAgIC8vIHRoZSBwYWdlIGhhcyBsb2FkZWQgaXRcbiAgICByZXR1cm4gIShub2RlPy5uYW1lICYmIG5vZGU/Lm5hbWVbTUFSS0RPQ19DT01QT05FTlRfQ09ORklHX0tFWV0pO1xufVxuXG5mdW5jdGlvbiBwcmludE5vblJlbmRlcmFibGVOb2RlKG5vZGVzOiBSZW5kZXJhYmxlVHJlZU5vZGVbXSkge1xuICAgIHJldHVybiBub2Rlc1xuICAgICAgICAubWFwKCh7IG5hbWUgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBwYXRoLCBuYW1lZEV4cG9ydCB9ID0gbmFtZTtcbiAgICAgICAgICAgIHJldHVybiBgKiAke3BhdGh9JHtuYW1lZEV4cG9ydCA/IGAgKCR7bmFtZWRFeHBvcnR9KWAgOiAnJ31gO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignXFxuJyk7XG59XG5cbmV4cG9ydCBjb25zdCBpbmNsdWRlTWFya2RvYzogU2NoZW1hID0ge1xuICAgIGlubGluZTogZmFsc2UsXG4gICAgc2VsZkNsb3Npbmc6IHRydWUsXG4gICAgYXR0cmlidXRlczoge1xuICAgICAgICBmaWxlOiB7IHR5cGU6IFN0cmluZywgcmVuZGVyOiBmYWxzZSwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgdmFyaWFibGVzOiB7IHR5cGU6IE9iamVjdCwgcmVuZGVyOiBmYWxzZSB9LFxuICAgIH0sXG4gICAgdHJhbnNmb3JtKG5vZGU6IE5vZGUsIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHsgZmlsZSwgdmFyaWFibGVzIH0gPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IG1hcmtkb2NGaWxlUGF0aCA9IGdldEZpbGVQYXRoKGZpbGUpO1xuICAgICAgICBjb25zdCBmaWxlRXhpc3RzID0gZnMuZXhpc3RzU3luYyhtYXJrZG9jRmlsZVBhdGgpO1xuXG4gICAgICAgIGlmICghZmlsZUV4aXN0cykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXJrZG9jIGZpbGUgXFxgJHtmaWxlfVxcYCBub3QgZm91bmQuIFRoZSAnZmlsZScgbXVzdCBiZSBpbiBcXGAke21hcmtkb2NGaWxlUGF0aH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKG1hcmtkb2NGaWxlUGF0aCkudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgbWFya2RvY0FzdCA9IE1hcmtkb2MucGFyc2UoY29udGVudHMpO1xuXG4gICAgICAgIGlmICghbWFya2RvY0FzdCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3Qgc2NvcGVkQ29uZmlnID0ge1xuICAgICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgICAgICAgICAgLi4uY29uZmlnLnZhcmlhYmxlcyxcbiAgICAgICAgICAgICAgICAuLi52YXJpYWJsZXMsXG4gICAgICAgICAgICAgICAgWyckJGluY2x1ZGVNYXJrZG9jOmZpbGVuYW1lJ106IGZpbGUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGZpbmROb25SZW5kZXJhYmxlTm9kZXMgPSAoXG4gICAgICAgICAgICBub2RlOiBSZW5kZXJhYmxlVHJlZU5vZGUgfCBSZW5kZXJhYmxlVHJlZU5vZGVbXSxcbiAgICAgICAgICAgIG5vblJlbmRlcmFibGVOb2RlczogUmVuZGVyYWJsZVRyZWVOb2RlW10gPSBbXVxuICAgICAgICApID0+IHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5mb3JFYWNoKChuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50SGFzTG9hZGVkKG4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub25SZW5kZXJhYmxlTm9kZXMucHVzaChuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5kTm9uUmVuZGVyYWJsZU5vZGVzKG4sIG5vblJlbmRlcmFibGVOb2Rlcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGU/LmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50SGFzTG9hZGVkKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vblJlbmRlcmFibGVOb2Rlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmROb25SZW5kZXJhYmxlTm9kZXMoY2hpbGQsIG5vblJlbmRlcmFibGVOb2Rlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub25SZW5kZXJhYmxlTm9kZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdHJhbnNmb3JtQ2hpbGRyZW4gPSAocGFydDogTm9kZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRDaGlsZHJlbiA9IHBhcnQucmVzb2x2ZShzY29wZWRDb25maWcpLnRyYW5zZm9ybUNoaWxkcmVuKHNjb3BlZENvbmZpZyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vblJlbmRlcmFibGVOb2RlcyA9IGZpbmROb25SZW5kZXJhYmxlTm9kZXModHJhbnNmb3JtZWRDaGlsZHJlbik7XG4gICAgICAgICAgICBpZiAobm9uUmVuZGVyYWJsZU5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEN1c3RvbSBNYXJrZG9jIHRhZ3Mgbm90IGxvYWRlZCBiZWZvcmUgaW5jbHVkaW5nIE1hcmtkb2M6ICcke2ZpbGV9Jy4gQ3VzdG9tIE1hcmtkb2MgdGFnIHJlbmRlciByZWZlcmVuY2VzOlxcblxcbiR7cHJpbnROb25SZW5kZXJhYmxlTm9kZShub25SZW5kZXJhYmxlTm9kZXMpfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRDaGlsZHJlbjtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShtYXJrZG9jQXN0KSA/IG1hcmtkb2NBc3QuZmxhdE1hcCh0cmFuc2Zvcm1DaGlsZHJlbikgOiB0cmFuc2Zvcm1DaGlsZHJlbihtYXJrZG9jQXN0KTtcbiAgICB9LFxufTtcbiIsICJpbXBvcnQgdHlwZSB7IEltcG9ydFR5cGUsIEludGVybmFsRnJhbWV3b3JrLCBMaWJyYXJ5IH0gZnJvbSAnQGFnLWdyaWQtdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uRW50cnkgfSBmcm9tICdhc3Rybzpjb250ZW50JztcbmltcG9ydCBmcyBmcm9tICdmcy9wcm9taXNlcyc7XG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG5pbXBvcnQgeyBTSVRFX0JBU0VfVVJMLCBVU0VfUEFDS0FHRVMsIFVTRV9QVUJMSVNIRURfUEFDS0FHRVMgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgdHlwZSBHbG9iQ29uZmlnLCBjcmVhdGVGaWxlUGF0aEZpbmRlciB9IGZyb20gJy4vY3JlYXRlRmlsZVBhdGhGaW5kZXInO1xuaW1wb3J0IHsgZ2V0SXNEZXYgfSBmcm9tICcuL2Vudic7XG5pbXBvcnQgeyBwYXRoSm9pbiB9IGZyb20gJy4vcGF0aEpvaW4nO1xuaW1wb3J0IHsgdXJsV2l0aEJhc2VVcmwgfSBmcm9tICcuL3VybFdpdGhCYXNlVXJsJztcblxuZXhwb3J0IHR5cGUgRG9jc1BhZ2UgPVxuICAgIHwgQ29sbGVjdGlvbkVudHJ5PCdkb2NzJz5cbiAgICB8IHtcbiAgICAgICAgICBzbHVnOiBzdHJpbmc7XG4gICAgICB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIEludGVybmFsRnJhbWV3b3JrRXhhbXBsZSB7XG4gICAgaW50ZXJuYWxGcmFtZXdvcms6IEludGVybmFsRnJhbWV3b3JrO1xuICAgIHBhZ2VOYW1lOiBzdHJpbmc7XG4gICAgZXhhbXBsZU5hbWU6IHN0cmluZztcbiAgICBzdXBwb3J0ZWRGcmFtZXdvcmtzOiBTZXQ8SW50ZXJuYWxGcmFtZXdvcms+IHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dHJhRmlsZVJvdXRlIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgICAgZmlsZVBhdGg6IHN0cmluZztcbiAgICB9O1xuICAgIHByb3BzOiB7XG4gICAgICAgIGZ1bGxGaWxlUGF0aDogc3RyaW5nO1xuICAgIH07XG59XG5cbi8qKlxuICogTWFwcGluZyBmb3IgZXh0cmEgZmlsZXMsIGZyb20gcm91dGUgdG8gZmlsZSBwYXRoXG4gKlxuICogTk9URTogRmlsZSBwYXRoIGlzIGFmdGVyIGBnZXRSb290VXJsKClgXG4gKi9cbmV4cG9ydCBjb25zdCBGSUxFU19QQVRIX01BUDogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgR2xvYkNvbmZpZz4gPSB7XG4gICAgLy8gQ29kZSBkb2MgcmVmZXJlbmNlIGZpbGVzXG4gICAgLy8gTk9URTogTWFudWFsbHkgc3BlY2lmaWVkLCBzbyBpdCBjYW4gYmUgcmVmZXJlbmNlZCBieSBrZXlcbiAgICAncmVmZXJlbmNlL2NvbHVtbi1vcHRpb25zLkFVVE8uanNvbic6ICdkaXN0L2RvY3VtZW50YXRpb24vcmVmZXJlbmNlL2NvbHVtbi1vcHRpb25zLkFVVE8uanNvbicsXG4gICAgJ3JlZmVyZW5jZS9jb2x1bW4uQVVUTy5qc29uJzogJ2Rpc3QvZG9jdW1lbnRhdGlvbi9yZWZlcmVuY2UvY29sdW1uLkFVVE8uanNvbicsXG4gICAgJ3JlZmVyZW5jZS9kb2MtaW50ZXJmYWNlcy5BVVRPLmpzb24nOiAnZGlzdC9kb2N1bWVudGF0aW9uL3JlZmVyZW5jZS9kb2MtaW50ZXJmYWNlcy5BVVRPLmpzb24nLFxuICAgICdyZWZlcmVuY2UvZ3JpZC1hcGkuQVVUTy5qc29uJzogJ2Rpc3QvZG9jdW1lbnRhdGlvbi9yZWZlcmVuY2UvZ3JpZC1hcGkuQVVUTy5qc29uJyxcbiAgICAncmVmZXJlbmNlL2dyaWQtb3B0aW9ucy5BVVRPLmpzb24nOiAnZGlzdC9kb2N1bWVudGF0aW9uL3JlZmVyZW5jZS9ncmlkLW9wdGlvbnMuQVVUTy5qc29uJyxcbiAgICAncmVmZXJlbmNlL2ludGVyZmFjZXMuQVVUTy5qc29uJzogJ2Rpc3QvZG9jdW1lbnRhdGlvbi9yZWZlcmVuY2UvaW50ZXJmYWNlcy5BVVRPLmpzb24nLFxuICAgICdyZWZlcmVuY2Uvcm93LW5vZGUuQVVUTy5qc29uJzogJ2Rpc3QvZG9jdW1lbnRhdGlvbi9yZWZlcmVuY2Uvcm93LW5vZGUuQVVUTy5qc29uJyxcblxuICAgIC8vIENvbW11bml0eSBtb2R1bGVzXG4gICAgJ0BhZy1ncmlkLWNvbW11bml0eS9jb3JlL2Rpc3QvKionOiAnY29tbXVuaXR5LW1vZHVsZXMvY29yZS9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtY29tbXVuaXR5L2NsaWVudC1zaWRlLXJvdy1tb2RlbC9kaXN0LyoqJzpcbiAgICAgICAgJ2NvbW11bml0eS1tb2R1bGVzL2NsaWVudC1zaWRlLXJvdy1tb2RlbC9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtY29tbXVuaXR5L2Nzdi1leHBvcnQvZGlzdC8qKic6ICdjb21tdW5pdHktbW9kdWxlcy9jc3YtZXhwb3J0L2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvaW5maW5pdGUtcm93LW1vZGVsL2Rpc3QvKionOiAnY29tbXVuaXR5LW1vZHVsZXMvaW5maW5pdGUtcm93LW1vZGVsL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzLyoqJzogJ2NvbW11bml0eS1tb2R1bGVzL3N0eWxlcy8qKi8qLntjc3Msc2Nzc30nLFxuXG4gICAgLy8gRW50ZXJwcmlzZSBtb2R1bGVzXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvYWR2YW5jZWQtZmlsdGVyL2Rpc3QvKionOiAnZW50ZXJwcmlzZS1tb2R1bGVzL2FkdmFuY2VkLWZpbHRlci9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtZW50ZXJwcmlzZS9jaGFydHMvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvY2hhcnRzL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL2NoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKionOiAnZW50ZXJwcmlzZS1tb2R1bGVzL2NoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL2NsaXBib2FyZC9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9jbGlwYm9hcmQvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvY29sdW1uLXRvb2wtcGFuZWwvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvY29sdW1uLXRvb2wtcGFuZWwvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvY29yZS9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9jb3JlL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL2V4Y2VsLWV4cG9ydC9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9leGNlbC1leHBvcnQvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvZmlsdGVyLXRvb2wtcGFuZWwvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvZmlsdGVyLXRvb2wtcGFuZWwvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvbWFzdGVyLWRldGFpbC9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9tYXN0ZXItZGV0YWlsL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL21lbnUvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvbWVudS9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtZW50ZXJwcmlzZS9tdWx0aS1maWx0ZXIvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvbXVsdGktZmlsdGVyL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL3JhbmdlLXNlbGVjdGlvbi9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9yYW5nZS1zZWxlY3Rpb24vZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2UvcmljaC1zZWxlY3QvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvcmljaC1zZWxlY3QvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2Uvcm93LWdyb3VwaW5nL2Rpc3QvKionOiAnZW50ZXJwcmlzZS1tb2R1bGVzL3Jvdy1ncm91cGluZy9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtZW50ZXJwcmlzZS9zZXJ2ZXItc2lkZS1yb3ctbW9kZWwvZGlzdC8qKic6XG4gICAgICAgICdlbnRlcnByaXNlLW1vZHVsZXMvc2VydmVyLXNpZGUtcm93LW1vZGVsL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL3NldC1maWx0ZXIvZGlzdC8qKic6ICdlbnRlcnByaXNlLW1vZHVsZXMvc2V0LWZpbHRlci9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtZW50ZXJwcmlzZS9zaWRlLWJhci9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9zaWRlLWJhci9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAnQGFnLWdyaWQtZW50ZXJwcmlzZS9zcGFya2xpbmVzL2Rpc3QvKionOiAnZW50ZXJwcmlzZS1tb2R1bGVzL3NwYXJrbGluZXMvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWVudGVycHJpc2Uvc3RhdHVzLWJhci9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy9zdGF0dXMtYmFyL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuICAgICdAYWctZ3JpZC1lbnRlcnByaXNlL3ZpZXdwb3J0LXJvdy1tb2RlbC9kaXN0LyoqJzogJ2VudGVycHJpc2UtbW9kdWxlcy92aWV3cG9ydC1yb3ctbW9kZWwvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG5cbiAgICAvLyBDaGFydHMgbW9kdWxlc1xuICAgICdhZy1jaGFydHMtY29tbXVuaXR5L2Rpc3QvKionOiAnbm9kZV9tb2R1bGVzL2FnLWNoYXJ0cy1jb21tdW5pdHkvZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgJ2FnLWNoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKionOiAnbm9kZV9tb2R1bGVzL2FnLWNoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH0nLFxuXG4gICAgLy8gRnJhbWV3b3JrIGxpYnJhcmllc1xuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvcmVhY3QvZGlzdC8qKic6ICdjb21tdW5pdHktbW9kdWxlcy9yZWFjdC9kaXN0LyoqLyoue2NqcyxtanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWNvbW11bml0eS9yZWFjdC9zcmMvKionOiAnY29tbXVuaXR5LW1vZHVsZXMvcmVhY3Qvc3JjLyoqLyoue3RzeCx0c30nLFxuICAgICdAYWctZ3JpZC1jb21tdW5pdHkvYW5ndWxhci9mZXNtMjAxNS9hZy1ncmlkLWNvbW11bml0eS1hbmd1bGFyLm1qcyc6XG4gICAgICAgICdjb21tdW5pdHktbW9kdWxlcy9hbmd1bGFyL2Rpc3QvYWctZ3JpZC1hbmd1bGFyL2Zlc20yMDE1L2FnLWdyaWQtY29tbXVuaXR5LWFuZ3VsYXIubWpzJyxcbiAgICAnQGFnLWdyaWQtY29tbXVuaXR5L3Z1ZS9kaXN0LyoqJzogJ2NvbW11bml0eS1tb2R1bGVzL3Z1ZS9kaXN0LyoqLyoue2NqcyxtanMsanMsbWFwfScsXG4gICAgJ0BhZy1ncmlkLWNvbW11bml0eS92dWUzL2Rpc3QvKionOiAnY29tbXVuaXR5LW1vZHVsZXMvdnVlMy9kaXN0LyoqLyoue2NqcyxtanMsanMsbWFwfScsXG5cbiAgICAvLyBUT0RPOiBEeW5hbWljYWxseSBtYXAgZmlsZXNcbiAgICAvLyAnQGFnLWdyaWQtY29tbXVuaXR5Jzoge1xuICAgIC8vICAgICBzb3VyY2VGb2xkZXI6ICdjb21tdW5pdHktbW9kdWxlcycsXG4gICAgLy8gICAgIGZpbGVOYW1lR2xvYjogJyovZGlzdC8qKi8qLntjanMsanMsbWFwfScsXG4gICAgLy8gfSxcbiAgICAvLyAnQGFnLWdyaWQtZW50ZXJwcmlzZSc6IHtcbiAgICAvLyAgICAgc291cmNlRm9sZGVyOiAnZW50ZXJwcmlzZS1tb2R1bGVzJyxcbiAgICAvLyAgICAgZmlsZU5hbWVHbG9iOiAnKi9kaXN0LyoqLyoue2NqcyxqcyxtYXB9JyxcbiAgICAvLyB9LFxufTtcbmlmIChVU0VfUEFDS0FHRVMpIHtcbiAgICAvLyBwYWNrYWdlc1xuICAgIEZJTEVTX1BBVEhfTUFQWydhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvKionXSA9IGBwYWNrYWdlcy9hZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvKiovKi5jc3NgO1xuICAgIEZJTEVTX1BBVEhfTUFQWydhZy1ncmlkLWNvbW11bml0eS9kaXN0LyoqJ10gPSBgcGFja2FnZXMvYWctZ3JpZC1jb21tdW5pdHkvZGlzdC8qKi8qLntjanMsanMsbWFwfWA7XG4gICAgRklMRVNfUEFUSF9NQVBbJ2FnLWdyaWQtZW50ZXJwcmlzZS9zdHlsZXMvKionXSA9IGBwYWNrYWdlcy9hZy1ncmlkLWVudGVycHJpc2Uvc3R5bGVzLyoqLyouY3NzYDtcbiAgICBGSUxFU19QQVRIX01BUFtgYWctZ3JpZC1lbnRlcnByaXNlL2Rpc3QvKipgXSA9IGBwYWNrYWdlcy9hZy1ncmlkLWVudGVycHJpc2UvZGlzdC8qKi8qLntjanMsanMsbWFwfWA7XG4gICAgRklMRVNfUEFUSF9NQVBbJ2FnLWdyaWQtY2hhcnRzLWVudGVycHJpc2Uvc3R5bGVzLyoqJ10gPSBgcGFja2FnZXMvYWctZ3JpZC1jaGFydHMtZW50ZXJwcmlzZS9zdHlsZXMvKiovKi5jc3NgO1xuICAgIEZJTEVTX1BBVEhfTUFQW2BhZy1ncmlkLWNoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKipgXSA9IGBwYWNrYWdlcy9hZy1ncmlkLWNoYXJ0cy1lbnRlcnByaXNlL2Rpc3QvKiovKi57Y2pzLGpzLG1hcH1gO1xuICAgIEZJTEVTX1BBVEhfTUFQWydhZy1ncmlkLXJlYWN0L2Rpc3QvKionXSA9IGBwYWNrYWdlcy9hZy1ncmlkLXJlYWN0L2Rpc3QvKiovKi57Y2pzLGpzLG1hcH1gO1xuICAgIEZJTEVTX1BBVEhfTUFQWydhZy1ncmlkLWFuZ3VsYXIvZmVzbTIwMTUvYWctZ3JpZC1hbmd1bGFyLm1qcyddID1cbiAgICAgICAgJ3BhY2thZ2VzL2FnLWdyaWQtYW5ndWxhci9kaXN0L2FnLWdyaWQtYW5ndWxhci9mZXNtMjAxNS9hZy1ncmlkLWFuZ3VsYXIubWpzJztcbiAgICBGSUxFU19QQVRIX01BUFsnYWctZ3JpZC12dWUvbGliLyoqJ10gPSAncGFja2FnZXMvYWctZ3JpZC12dWUvbGliLyoqLyoue2NqcyxtanMsanMsbWFwfSc7XG4gICAgRklMRVNfUEFUSF9NQVBbJ2FnLWdyaWQtdnVlMy9kaXN0LyoqJ10gPSAncGFja2FnZXMvYWctZ3JpZC12dWUzL2Rpc3QvKiovKi57Y2pzLG1qcyxqcyxtYXB9Jztcbn1cblxudHlwZSBGaWxlS2V5ID0ga2V5b2YgdHlwZW9mIEZJTEVTX1BBVEhfTUFQO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SnNvbkZpbGUoZmlsZUtleTogRmlsZUtleSkge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gRklMRVNfUEFUSF9NQVBbZmlsZUtleV0gYXMgc3RyaW5nO1xuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHBhdGhKb2luKGdldFJvb3RVcmwoKS5wYXRobmFtZSwgZmlsZVBhdGgpO1xuICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IHJlYWRGaWxlU3luYyhmaWxlKS50b1N0cmluZygpO1xuICAgIHJldHVybiBmaWxlQ29udGVudHMgPyBKU09OLnBhcnNlKGZpbGVDb250ZW50cykgOiB7fTtcbn1cblxuLyoqXG4gKiBUaGUgcm9vdCB1cmwgd2hlcmUgdGhlIG1vbm9yZXBvIGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0Um9vdFVybCA9ICgpOiBVUkwgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBnZXRJc0RldigpXG4gICAgICAgID8gLy8gUmVsYXRpdmUgdG8gdGhlIGZvbGRlciBvZiB0aGlzIGZpbGVcbiAgICAgICAgICAnLi4vLi4vLi4vLi4vJ1xuICAgICAgICA6IC8vIFRPRE86IFJlbGF0aXZlIHRvIGAvZGlzdC9jaHVua3MvcGFnZXNgIGZvbGRlciAoTnggc3BlY2lmaWMpXG4gICAgICAgICAgJy4uLy4uLy4uLy4uLy4uLyc7XG4gICAgcmV0dXJuIG5ldyBVUkwocm9vdCwgaW1wb3J0Lm1ldGEudXJsKTtcbn07XG5cbi8qKlxuICogIFRPRE86IEZpZ3VyZSB0aGlzIG91dCB3aGVuIHdvcmtpbmcgb24gYnVpbGRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4YW1wbGVSb290RmlsZVVybCA9ICgpOiBVUkwgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBnZXRSb290VXJsKCkucGF0aG5hbWU7XG4gICAgcmV0dXJuIG5ldyBVUkwoYCR7cm9vdH0vZGlzdC9nZW5lcmF0ZWQtZXhhbXBsZXMvYWctZ3JpZC1kb2NzL2AsIGltcG9ydC5tZXRhLnVybCk7XG59O1xuXG4vKipcbiAqIFRoZSBgYWctY2hhcnRzLXdlYnNpdGVgIHJvb3QgdXJsIHdoZXJlIHRoZSBtb25vcmVwbyBleGlzdHNcbiAqL1xuY29uc3QgZ2V0V2Vic2l0ZVJvb3RVcmwgPSAoeyBpc0RldiA9IGdldElzRGV2KCkgfTogeyBpc0Rldj86IGJvb2xlYW4gfSA9IHsgaXNEZXY6IGdldElzRGV2KCkgfSk6IFVSTCA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGlzRGV2XG4gICAgICAgID8gLy8gUmVsYXRpdmUgdG8gdGhlIGZvbGRlciBvZiB0aGlzIGZpbGVcbiAgICAgICAgICAnLi4vLi4vJ1xuICAgICAgICA6IC8vIFJlbGF0aXZlIHRvIGAvZGlzdC9jaHVua3MvcGFnZXNgIGZvbGRlciAoTnggc3BlY2lmaWMpXG4gICAgICAgICAgJy4uLy4uLy4uLyc7XG4gICAgcmV0dXJuIG5ldyBVUkwocm9vdCwgaW1wb3J0Lm1ldGEudXJsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb250ZW50Um9vdEZpbGVVcmwgPSAoeyBpc0RldiB9OiB7IGlzRGV2PzogYm9vbGVhbiB9ID0ge30pOiBVUkwgPT4ge1xuICAgIGNvbnN0IHdlYnNpdGVSb290ID0gZ2V0V2Vic2l0ZVJvb3RVcmwoeyBpc0RldiB9KTtcbiAgICBjb25zdCBjb250ZW50Um9vdCA9IHBhdGhKb2luKHdlYnNpdGVSb290LCAnc3JjL2NvbnRlbnQnKTtcbiAgICByZXR1cm4gbmV3IFVSTChjb250ZW50Um9vdCwgaW1wb3J0Lm1ldGEudXJsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXREZWJ1Z0ZvbGRlclVybCA9ICh7IGlzRGV2IH06IHsgaXNEZXY/OiBib29sZWFuIH0gPSB7fSk6IFVSTCA9PiB7XG4gICAgY29uc3Qgd2Vic2l0ZVJvb3QgPSBnZXRXZWJzaXRlUm9vdFVybCh7IGlzRGV2IH0pO1xuICAgIGNvbnN0IGNvbnRlbnRSb290ID0gcGF0aEpvaW4od2Vic2l0ZVJvb3QsICdzcmMvcGFnZXMvZGVidWcnKTtcbiAgICByZXR1cm4gbmV3IFVSTChjb250ZW50Um9vdCwgaW1wb3J0Lm1ldGEudXJsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXREZWJ1Z1BhZ2VVcmxzID0gYXN5bmMgKHtcbiAgICBhbGxGaWxlcyxcbn06IHtcbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGZpbGVzLCBieSBkZWZhdWx0IG9ubHkgcmV0dXJucyBgLmFzdHJvYCBwYWdlc1xuICAgICAqL1xuICAgIGFsbEZpbGVzPzogYm9vbGVhbjtcbn0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IGRlYnVnRm9sZGVyID0gZ2V0RGVidWdGb2xkZXJVcmwoKTtcbiAgICBjb25zdCBwYWdlcyA9IGF3YWl0IGZzLnJlYWRkaXIoZGVidWdGb2xkZXIpO1xuICAgIGNvbnN0IGZpbHRlcmVkUGFnZXMgPSBhbGxGaWxlc1xuICAgICAgICA/IHBhZ2VzXG4gICAgICAgIDogcGFnZXMuZmlsdGVyKChwYWdlTmFtZSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcGFnZU5hbWUubWF0Y2goL1xcLmFzdHJvJC8pO1xuICAgICAgICAgIH0pO1xuXG4gICAgY29uc3QgcGFnZVBhdGhQcm9taXNlcyA9IGZpbHRlcmVkUGFnZXNcbiAgICAgICAgLm1hcChhc3luYyAocGFnZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VOYW1lV2l0aG91dEV4dCA9IHBhZ2VOYW1lLnJlcGxhY2UoL1xcLlteLl0rJC8sICcnKTtcbiAgICAgICAgICAgIHJldHVybiB1cmxXaXRoQmFzZVVybChwYXRoSm9pbignL2RlYnVnJywgcGFnZU5hbWVXaXRob3V0RXh0KSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5mbGF0KCk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFnZVBhdGhQcm9taXNlcyk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNVc2luZ1B1Ymxpc2hlZFBhY2thZ2VzID0gKCkgPT4gVVNFX1BVQkxJU0hFRF9QQUNLQUdFUyA9PT0gdHJ1ZTtcblxuLyoqXG4gKiBHZXQgRGV2IEZpbGUgVVJMIGZvciByZWZlcmVuY2luZyBvbiB0aGUgZnJvbnQgZW5kXG4gKi9cbmV4cG9ydCBjb25zdCBnZXREZXZGaWxlTGlzdCA9ICgpID0+IHtcbiAgICBjb25zdCBkaXN0Rm9sZGVyID0gZ2V0Um9vdFVybCgpO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKEZJTEVTX1BBVEhfTUFQKS5tYXAoKGZpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHBhdGhKb2luKGRpc3RGb2xkZXIucGF0aG5hbWUsIGZpbGUgYXMgc3RyaW5nKTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRyYUZpbGVzKCk6IEV4dHJhRmlsZVJvdXRlW10ge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIHNvdXJjZUZpbGVQYXRoXSBvZiBPYmplY3QuZW50cmllcyhGSUxFU19QQVRIX01BUCkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2VGaWxlUGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxGaWxlUGF0aCA9IHBhdGhKb2luKGdldFJvb3RVcmwoKS5wYXRobmFtZSwgc291cmNlRmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKGZ1bGxGaWxlUGF0aC5pbmNsdWRlcygnKionKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXggPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgZmlsZVBhdGguaW5kZXhPZignKionKSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUHJlZml4ID0gZnVsbEZpbGVQYXRoLnN1YnN0cmluZygwLCBmdWxsRmlsZVBhdGguaW5kZXhPZignKionKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gZ2xvYi5zeW5jKGZ1bGxGaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gZmlsZXMgbWF0Y2ggdGhlIGdsb2IgJHtmdWxsRmlsZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBnbG9iRmlsZSBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZSA9IGdsb2JGaWxlLnJlcGxhY2Uoc291cmNlUHJlZml4LCAnJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7IGZpbGVQYXRoOiBgJHtwYXRoUHJlZml4fSR7cmVsYXRpdmVGaWxlfWAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiB7IGZ1bGxGaWxlUGF0aDogZ2xvYkZpbGUgfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQucHVzaCh7IHBhcmFtczogeyBmaWxlUGF0aCB9LCBwcm9wczogeyBmdWxsRmlsZVBhdGggfSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlRmlsZVBhdGggPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCB7IGdsb2JQYXR0ZXJuLCBnZXRGaWxlUGF0aCB9ID0gY3JlYXRlRmlsZVBhdGhGaW5kZXIoe1xuICAgICAgICAgICAgICAgIGJhc2VVcmw6IGdldFJvb3RVcmwoKS5wYXRobmFtZSxcbiAgICAgICAgICAgICAgICBnbG9iQ29uZmlnOiBzb3VyY2VGaWxlUGF0aCBhcyBHbG9iQ29uZmlnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBnbG9iLnN5bmMoZ2xvYlBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBmaWxlcyBtYXRjaCB0aGUgZ2xvYiAke2dsb2JQYXR0ZXJufSBmb3IgY29uZmlnICR7SlNPTi5zdHJpbmdpZnkoc291cmNlRmlsZVBhdGgpfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGdsb2JGaWxlIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVQYXRoKGdsb2JGaWxlKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7IGZpbGVQYXRoIH0sXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiB7IGZ1bGxGaWxlUGF0aDogZ2xvYkZpbGUgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogR2V0IHVybCBvZiBleGFtcGxlIGJvaWxlciBwbGF0ZSBmaWxlc1xuICovXG5leHBvcnQgY29uc3QgZ2V0Qm9pbGVyUGxhdGVVcmwgPSAoe1xuICAgIGxpYnJhcnksXG4gICAgaW50ZXJuYWxGcmFtZXdvcmssXG59OiB7XG4gICAgbGlicmFyeTogTGlicmFyeTtcbiAgICBpbnRlcm5hbEZyYW1ld29yazogSW50ZXJuYWxGcmFtZXdvcms7XG59KSA9PiB7XG4gICAgbGV0IGJvaWxlclBsYXRlRnJhbWV3b3JrO1xuICAgIHN3aXRjaCAoaW50ZXJuYWxGcmFtZXdvcmspIHtcbiAgICAgICAgY2FzZSAncmVhY3RGdW5jdGlvbmFsJzpcbiAgICAgICAgICAgIGJvaWxlclBsYXRlRnJhbWV3b3JrID0gJ3JlYWN0JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWFjdEZ1bmN0aW9uYWxUcyc6XG4gICAgICAgICAgICBib2lsZXJQbGF0ZUZyYW1ld29yayA9ICdyZWFjdC10cyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJvaWxlclBsYXRlRnJhbWV3b3JrID0gaW50ZXJuYWxGcmFtZXdvcms7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBib2lsZXJwbGF0ZVBhdGggPSBwYXRoSm9pbihcbiAgICAgICAgU0lURV9CQVNFX1VSTCxcbiAgICAgICAgJy9leGFtcGxlLXJ1bm5lcicsXG4gICAgICAgIGAke2xpYnJhcnl9LSR7Ym9pbGVyUGxhdGVGcmFtZXdvcmt9LWJvaWxlcnBsYXRlYFxuICAgICk7XG5cbiAgICByZXR1cm4gYm9pbGVycGxhdGVQYXRoO1xufTtcbiIsICJpbXBvcnQge1BST0RVQ1RJT05fU0lURV9VUkwsIFNJVEVfQkFTRV9VUkwsIFNJVEVfVVJMLCBTVEFHSU5HX1NJVEVfVVJMfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgZ2V0SXNEZXYgPSAoKSA9PiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyB8fCBpbXBvcnQubWV0YS5lbnY/LkRFVjtcbmV4cG9ydCBjb25zdCBnZXRJc1N0YWdpbmcgPSAoKSA9PiBTSVRFX1VSTCA9PT0gU1RBR0lOR19TSVRFX1VSTDtcbmV4cG9ydCBjb25zdCBnZXRJc1Byb2R1Y3Rpb24gPSAoKSA9PiBTSVRFX1VSTCA9PT0gUFJPRFVDVElPTl9TSVRFX1VSTDtcbmV4cG9ydCBjb25zdCBnZXRJc0FyY2hpdmUgPSAoKSA9PiBTSVRFX1VSTCA9PT0gUFJPRFVDVElPTl9TSVRFX1VSTCAmJiBTSVRFX0JBU0VfVVJMLmluY2x1ZGVzKFwiYXJjaGl2ZVwiKTtcbiIsICIvKipcbiAqIEpvaW4gcGF0aCBzZWdtZW50cy5cbiAqXG4gKiBXb3JrcyBvbiBzZXJ2ZXIgYW5kIGNsaWVudCBzaWRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXRoSm9pbiguLi5zZWdtZW50czogKHN0cmluZyB8IFVSTCB8IHVuZGVmaW5lZClbXSk6IHN0cmluZyB7XG4gICAgaWYgKCFzZWdtZW50cyB8fCAhc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnRzWzBdID09PSAnLycgJiYgc2VnbWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfVxuXG4gICAgY29uc3QgcmVtb3ZlZFNsYXNoZXMgPSBzZWdtZW50c1xuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgIC8vIENvbnZlcnQgc2VnbWVudHMgdG8gc3RyaW5nLCBpbiBjYXNlIGl0J3MgYSBVUkxcbiAgICAgICAgLm1hcCgoc2VnbWVudCkgPT4gc2VnbWVudCEudG9TdHJpbmcoKSlcbiAgICAgICAgLy8gUmVtb3ZlIGluaXRpYWwgL1xuICAgICAgICAubWFwKChzZWdtZW50KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2VnbWVudCAhPT0gJy8nICYmIHNlZ21lbnRbMF0gPT09ICcvJyA/IHNlZ21lbnQuc2xpY2UoMSkgOiBzZWdtZW50O1xuICAgICAgICB9KVxuICAgICAgICAvLyBSZW1vdmUgZW5kIHNsYXNoIC9cbiAgICAgICAgLm1hcCgoc2VnbWVudCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnQgIT09ICcvJyAmJiBzZWdtZW50W3NlZ21lbnQubGVuZ3RoIC0gMV0gPT09ICcvJ1xuICAgICAgICAgICAgICAgID8gc2VnbWVudC5zbGljZSgwLCBzZWdtZW50Lmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgOiBzZWdtZW50O1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKChzZWdtZW50KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2VnbWVudCAhPT0gJy8nO1xuICAgICAgICB9KTtcblxuICAgIGNvbnN0IFtmaXJzdFNlZ21lbnRdID0gc2VnbWVudHMgYXMgc3RyaW5nW107XG4gICAgY29uc3QgZmlyc3RTZWdtZW50SGFzU2xhc2ggPSBmaXJzdFNlZ21lbnQ/LlswXSA9PT0gJy8nO1xuICAgIHJldHVybiBmaXJzdFNlZ21lbnRIYXNTbGFzaCA/IGAvJHtyZW1vdmVkU2xhc2hlcy5qb2luKCcvJyl9YCA6IHJlbW92ZWRTbGFzaGVzLmpvaW4oJy8nKTtcbn1cbiIsICJpbXBvcnQgeyBNYXJrZG9jLCB0eXBlIFNjaGVtYSwgbm9kZXMgfSBmcm9tICdAYXN0cm9qcy9tYXJrZG9jL2NvbmZpZyc7XG5pbXBvcnQgeyBhZ0dyaWRWZXJzaW9uIH0gZnJvbSAnQGNvbnN0YW50cyc7XG5pbXBvcnQgeyB1cmxXaXRoUHJlZml4IH0gZnJvbSAnQHV0aWxzL3VybFdpdGhQcmVmaXgnO1xuXG5leHBvcnQgY29uc3QgbGluazogU2NoZW1hID0ge1xuICAgIC4uLm5vZGVzLmxpbmssXG4gICAgYXR0cmlidXRlczoge1xuICAgICAgICAuLi5ub2Rlcy5saW5rLmF0dHJpYnV0ZXMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcGVuIGxpbmsgaW4gZXh0ZXJuYWwgdGFiXG4gICAgICAgICAqL1xuICAgICAgICBpc0V4dGVybmFsOiB7IHR5cGU6IEJvb2xlYW4gfSxcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybSBtYXJrZG9jIGxpbmtzIHRvIGFkZCB1cmwgcHJlZml4IGFuZCBmcmFtZXdvcmsgdG8gaHJlZlxuICAgICAqL1xuICAgIHRyYW5zZm9ybShub2RlLCBjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBmcmFtZXdvcmsgfSA9IGNvbmZpZy52YXJpYWJsZXM7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS50cmFuc2Zvcm1DaGlsZHJlbihjb25maWcpO1xuICAgICAgICBjb25zdCBub2RlQXR0cmlidXRlcyA9IG5vZGUudHJhbnNmb3JtQXR0cmlidXRlcyhjb25maWcpO1xuXG4gICAgICAgIGNvbnN0IGhyZWZXaXRoRnJhbWV3b3JrID0gdXJsV2l0aFByZWZpeCh7IHVybDogbm9kZUF0dHJpYnV0ZXMuaHJlZiwgZnJhbWV3b3JrIH0pO1xuICAgICAgICAvLyBSZXBsYWNlIG1hcmtkb2MgdmFyaWFibGVzLCBhcyBtYXJrZG9jIGRvZXMgbm90IHBhcnNlIGF0dHJpYnV0ZXNcbiAgICAgICAgY29uc3QgaHJlZiA9IGhyZWZXaXRoRnJhbWV3b3JrLnJlcGxhY2UoJ3slICRhZ0dyaWRWZXJzaW9uICV9JywgYWdHcmlkVmVyc2lvbik7XG5cbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IHtcbiAgICAgICAgICAgIC4uLm5vZGVBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgLi4uKG5vZGVBdHRyaWJ1dGVzLmlzRXh0ZXJuYWwgPyB7IHRhcmdldDogJ19ibGFuaycgfSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICBocmVmLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgTWFya2RvYy5UYWcoJ2EnLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbik7XG4gICAgfSxcbn07XG4iLCAiaW1wb3J0IHsgU0lURV9CQVNFX1VSTF9TRUdNRU5UUyB9IGZyb20gJ0Bjb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgRE9DU19GUkFNRVdPUktfUEFUSF9JTkRFWCA9IFNJVEVfQkFTRV9VUkxfU0VHTUVOVFMgKyAxO1xuZXhwb3J0IGNvbnN0IERPQ1NfUEFHRV9OQU1FX1BBVEhfSU5ERVggPSBTSVRFX0JBU0VfVVJMX1NFR01FTlRTICsgMjtcblxuZXhwb3J0IGNvbnN0IERPQ1NfRlJBTUVXT1JLX1JFRElSRUNUX1BBR0UgPSAnZ2V0dGluZy1zdGFydGVkJztcbiIsICJpbXBvcnQgdHlwZSB7IEltcG9ydFR5cGUsIEludGVybmFsRnJhbWV3b3JrIH0gZnJvbSAnQGFnLWdyaWQtdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBGcmFtZXdvcmsgfSBmcm9tICdAYWctZ3JpZC10eXBlcyc7XG5pbXBvcnQgeyBTSVRFX0JBU0VfVVJMIH0gZnJvbSAnQGNvbnN0YW50cyc7XG5pbXBvcnQgeyBwYXRoSm9pbiB9IGZyb20gJ0B1dGlscy9wYXRoSm9pbic7XG5cbmltcG9ydCB7IERPQ1NfRlJBTUVXT1JLX1BBVEhfSU5ERVgsIERPQ1NfUEFHRV9OQU1FX1BBVEhfSU5ERVggfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJhbWV3b3JrUGF0aChmcmFtZXdvcms6IEZyYW1ld29yaykge1xuICAgIHJldHVybiBgJHtmcmFtZXdvcmt9LWRhdGEtZ3JpZGA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGcmFtZXdvcmtGcm9tUGF0aChwYXRoOiBzdHJpbmcpOiBGcmFtZXdvcmsge1xuICAgIGNvbnN0IGZyYW1ld29ya1BhdGggPSBwYXRoLnNwbGl0KCcvJylbRE9DU19GUkFNRVdPUktfUEFUSF9JTkRFWF07XG4gICAgY29uc3QgZnJhbWV3b3JrID0gZnJhbWV3b3JrUGF0aC5yZXBsYWNlKCctZGF0YS1ncmlkJywgJycpO1xuICAgIHJldHVybiBmcmFtZXdvcmsgYXMgRnJhbWV3b3JrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFnZU5hbWVGcm9tUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcvJylbRE9DU19QQUdFX05BTUVfUEFUSF9JTkRFWF07XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeGFtcGxlUGFnZVVybCA9ICh7IGZyYW1ld29yaywgcGF0aCB9OiB7IGZyYW1ld29yazogRnJhbWV3b3JrOyBwYXRoOiBzdHJpbmcgfSkgPT4ge1xuICAgIGNvbnN0IGZyYW1ld29ya1BhdGggPSBnZXRGcmFtZXdvcmtQYXRoKGZyYW1ld29yayk7XG4gICAgcmV0dXJuIHBhdGhKb2luKFNJVEVfQkFTRV9VUkwsIGZyYW1ld29ya1BhdGgsIHBhdGgpICsgJy8nO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBVcmxQYXJhbXMge1xuICAgIGludGVybmFsRnJhbWV3b3JrOiBJbnRlcm5hbEZyYW1ld29yaztcbiAgICBwYWdlTmFtZTogc3RyaW5nO1xuICAgIGV4YW1wbGVOYW1lOiBzdHJpbmc7XG4gICAgaW1wb3J0VHlwZTogSW1wb3J0VHlwZTtcbn1cblxuLyoqXG4gKiBEeW5hbWljIHBhdGggd2hlcmUgZXhhbXBsZXMgYXJlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeGFtcGxlVXJsID0gKHtcbiAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICBwYWdlTmFtZSxcbiAgICBleGFtcGxlTmFtZSxcbiAgICBpbXBvcnRUeXBlLFxufTogVXJsUGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIHBhdGhKb2luKFNJVEVfQkFTRV9VUkwsICdleGFtcGxlcycsIHBhZ2VOYW1lLCBleGFtcGxlTmFtZSwgaW1wb3J0VHlwZSwgaW50ZXJuYWxGcmFtZXdvcmspO1xufTtcblxuLyoqXG4gKiBEeW5hbWljIHBhdGggd2hlcmUgZG9jcyBleGFtcGxlIHJ1bm5lciBleGFtcGxlcyBhcmVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4YW1wbGVSdW5uZXJFeGFtcGxlVXJsID0gKHtcbiAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICBwYWdlTmFtZSxcbiAgICBleGFtcGxlTmFtZSxcbiAgICBpbXBvcnRUeXBlLFxufTogVXJsUGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZXhhbXBsZVVybCA9IGdldEV4YW1wbGVVcmwoe1xuICAgICAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICAgICAgcGFnZU5hbWUsXG4gICAgICAgIGV4YW1wbGVOYW1lLFxuICAgICAgICBpbXBvcnRUeXBlLFxuICAgIH0pO1xuICAgIHJldHVybiBwYXRoSm9pbihleGFtcGxlVXJsLCAnZXhhbXBsZS1ydW5uZXInKTtcbn07XG5cbi8qKlxuICogRHluYW1pYyBwYXRoIGZvciBQbHVua3IgZXhhbXBsZXMgdXJsXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeGFtcGxlUGx1bmtyVXJsID0gKHtcbiAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICBwYWdlTmFtZSxcbiAgICBleGFtcGxlTmFtZSxcbiAgICBpbXBvcnRUeXBlLFxufTogVXJsUGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZXhhbXBsZVVybCA9IGdldEV4YW1wbGVVcmwoe1xuICAgICAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICAgICAgcGFnZU5hbWUsXG4gICAgICAgIGV4YW1wbGVOYW1lLFxuICAgICAgICBpbXBvcnRUeXBlLFxuICAgIH0pO1xuICAgIHJldHVybiBwYXRoSm9pbihleGFtcGxlVXJsLCAncGx1bmtyJyk7XG59O1xuXG4vKipcbiAqIER5bmFtaWMgcGF0aCBmb3IgQ29kZSBTYW5kYm94IGV4YW1wbGVzIHVybFxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhhbXBsZUNvZGVTYW5kYm94VXJsID0gKHtcbiAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICBwYWdlTmFtZSxcbiAgICBleGFtcGxlTmFtZSxcbiAgICBpbXBvcnRUeXBlLFxufTogVXJsUGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZXhhbXBsZVVybCA9IGdldEV4YW1wbGVVcmwoe1xuICAgICAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICAgICAgcGFnZU5hbWUsXG4gICAgICAgIGV4YW1wbGVOYW1lLFxuICAgICAgICBpbXBvcnRUeXBlLFxuICAgIH0pO1xuICAgIHJldHVybiBwYXRoSm9pbihleGFtcGxlVXJsLCAnY29kZXNhbmRib3gnKTtcbn07XG5cbi8qKlxuICogRW5kcG9pbnQgZm9yIGFsbCBleGFtcGxlIGZpbGVzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeGFtcGxlQ29udGVudHNVcmwgPSAoe1xuICAgIGludGVybmFsRnJhbWV3b3JrLFxuICAgIHBhZ2VOYW1lLFxuICAgIGV4YW1wbGVOYW1lLFxuICAgIGltcG9ydFR5cGUsXG59OiBVcmxQYXJhbXMpID0+IHtcbiAgICBjb25zdCBleGFtcGxlVXJsID0gZ2V0RXhhbXBsZVVybCh7XG4gICAgICAgIGludGVybmFsRnJhbWV3b3JrLFxuICAgICAgICBwYWdlTmFtZSxcbiAgICAgICAgZXhhbXBsZU5hbWUsXG4gICAgICAgIGltcG9ydFR5cGUsXG4gICAgfSk7XG4gICAgcmV0dXJuIHBhdGhKb2luKGV4YW1wbGVVcmwsICdjb250ZW50cy5qc29uJyk7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEV4YW1wbGVGaWxlVXJsUGFyYW1zIGV4dGVuZHMgVXJsUGFyYW1zIHtcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xufVxuLyoqXG4gKiBEeW5hbWljIHBhdGggd2hlcmUgZXhhbXBsZSBmaWxlcyBhcmVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4YW1wbGVGaWxlVXJsID0gKHtcbiAgICBpbnRlcm5hbEZyYW1ld29yayxcbiAgICBwYWdlTmFtZSxcbiAgICBleGFtcGxlTmFtZSxcbiAgICBpbXBvcnRUeXBlLFxuICAgIGZpbGVOYW1lLFxufTogRXhhbXBsZUZpbGVVcmxQYXJhbXMpID0+IHtcbiAgICBjb25zdCBleGFtcGxlVXJsID0gZ2V0RXhhbXBsZVVybCh7XG4gICAgICAgIGludGVybmFsRnJhbWV3b3JrLFxuICAgICAgICBwYWdlTmFtZSxcbiAgICAgICAgZXhhbXBsZU5hbWUsXG4gICAgICAgIGltcG9ydFR5cGUsXG4gICAgfSk7XG4gICAgcmV0dXJuIHBhdGhKb2luKGV4YW1wbGVVcmwsIGZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRHaWZTdGlsbEltYWdlVXJsID0gKHsgcGFnZU5hbWUsIGltYWdlUGF0aCB9OiB7IHBhZ2VOYW1lOiBzdHJpbmc7IGltYWdlUGF0aDogc3RyaW5nIH0pID0+IHtcbiAgICBjb25zdCBzdGlsbEltYWdlUGF0aCA9IGltYWdlUGF0aC5yZXBsYWNlKCcuZ2lmJywgJy1zdGlsbC5wbmcnKTtcbiAgICByZXR1cm4gcGF0aEpvaW4oU0lURV9CQVNFX1VSTCwgJ2RvY3MnLCBwYWdlTmFtZSwgc3RpbGxJbWFnZVBhdGgpO1xufTtcbiIsICJpbXBvcnQgdHlwZSB7IEZyYW1ld29yayB9IGZyb20gJ0BhZy1ncmlkLXR5cGVzJztcbmltcG9ydCB7IFNJVEVfQkFTRV9VUkwgfSBmcm9tICdAY29uc3RhbnRzJztcbmltcG9ydCB7IGdldEZyYW1ld29ya1BhdGggfSBmcm9tICdAZmVhdHVyZXMvZG9jcy91dGlscy91cmxQYXRocyc7XG5pbXBvcnQgeyBnZXRJc0RldiB9IGZyb20gJ0B1dGlscy9lbnYnO1xuaW1wb3J0IHsgcGF0aEpvaW4gfSBmcm9tICdAdXRpbHMvcGF0aEpvaW4nO1xuXG5leHBvcnQgY29uc3QgdXJsV2l0aFByZWZpeCA9ICh7XG4gICAgdXJsID0gJycsXG4gICAgZnJhbWV3b3JrLFxuICAgIHNpdGVCYXNlVXJsID0gU0lURV9CQVNFX1VSTCxcbn06IHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBmcmFtZXdvcms/OiBGcmFtZXdvcms7XG4gICAgc2l0ZUJhc2VVcmw/OiBzdHJpbmc7XG59KTogc3RyaW5nID0+IHtcbiAgICBsZXQgcGF0aCA9IHVybDtcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy4vJykpIHtcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrUGF0aCA9IGdldEZyYW1ld29ya1BhdGgoZnJhbWV3b3JrISk7XG4gICAgICAgIHBhdGggPSBwYXRoSm9pbignLycsIHNpdGVCYXNlVXJsLCBmcmFtZXdvcmtQYXRoLCB1cmwuc2xpY2UoJy4vJy5sZW5ndGgpKTtcbiAgICB9IGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgcGF0aCA9IHBhdGhKb2luKCcvJywgc2l0ZUJhc2VVcmwsIHVybCk7XG4gICAgfSBlbHNlIGlmICghdXJsLnN0YXJ0c1dpdGgoJyMnKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJ21haWx0bycpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHVybDogJHt1cmx9IC0gdXNlICcuLycgZm9yIGZyYW1ld29yayB1cmxzLCAnLycgZm9yIHJvb3QgdXJscywgJyMnIGZvciBhbmNob3IgbGlua3MsIGFuZCBodHRwL21haWx0byBmb3IgZXh0ZXJuYWwgdXJsc2A7XG4gICAgICAgIGlmIChnZXRJc0RldigpKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXRoO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLGVBQTRCO0FBRzlCLElBQU0sTUFBOEI7QUFBQSxFQUN2QyxRQUFRO0FBQUEsRUFDUixZQUFZO0FBQUEsSUFDUixTQUFTLEVBQUUsTUFBTSxPQUFPO0FBQUEsRUFDNUI7QUFBQSxFQUNBLFVBQVUsTUFBTTtBQUNaLFdBQU8sSUFBSSxRQUFRLElBQUksS0FBSyxRQUFrQixDQUFDLEdBQUcsQ0FBQyxLQUFLLFdBQVcsT0FBTyxDQUFDO0FBQUEsRUFDL0U7QUFDSjs7O0FDVkEsU0FBUyxXQUFBQSxVQUFTLFdBQVcscUJBQXFCLFNBQUFDLGNBQWE7OztBQ0QvRDtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsY0FBZ0I7QUFBQSxJQUNkLE9BQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxNQUFRO0FBQUEsRUFDUixPQUFTO0FBQUEsRUFDVCxRQUFVO0FBQUEsRUFDVixTQUFXO0FBQUEsSUFDVCxRQUFVO0FBQUEsSUFDVixTQUFXO0FBQUEsSUFDWCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakIsZUFBZTtBQUFBLElBQ2YsTUFBUTtBQUFBLElBQ1IsMEJBQTBCO0FBQUEsRUFDNUI7QUFBQSxFQUNBLFlBQWM7QUFBQSxJQUNaLE1BQVE7QUFBQSxJQUNSLEtBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxVQUFZO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFB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LFlBQVk7QUFBQSxRQUNSLElBQUksRUFBRSxNQUFNLE9BQU87QUFBQSxRQUNuQixPQUFPLEVBQUUsTUFBTSxPQUFPO0FBQUEsUUFDdEIsWUFBWSxFQUFFLE1BQU0sUUFBUTtBQUFBLE1BQ2hDO0FBQUEsSUFDSjtBQUFBLElBQ0EsZ0JBQWdCO0FBQUEsTUFDWixRQUFRLFVBQVUsdURBQXVEO0FBQUEsTUFDekUsWUFBWTtBQUFBLFFBQ1IsSUFBSSxFQUFFLE1BQU0sT0FBTztBQUFBLFFBQ25CLE9BQU8sRUFBRSxNQUFNLE9BQU87QUFBQSxRQUN0QixZQUFZLEVBQUUsTUFBTSxRQUFRO0FBQUEsTUFDaEM7QUFBQSxJQUNKO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDUCxRQUFRLFVBQVUsOENBQThDO0FBQUEsTUFDaEUsWUFBWTtBQUFBLFFBQ1IsTUFBTSxFQUFFLE1BQU0sUUFBUSxVQUFVLEtBQUs7QUFBQSxRQUNyQyxNQUFNLEVBQUUsTUFBTSxRQUFRLFVBQVUsS0FBSztBQUFBLFFBQ3JDLE1BQU0sRUFBRSxNQUFNLE9BQU87QUFBQSxNQUN6QjtBQUFBLElBQ0o7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNWLFFBQVEsVUFBVSxtREFBbUQ7QUFBQSxJQUN6RTtBQUFBLElBQ0Esc0JBQXNCO0FBQUEsTUFDbEIsUUFBUSxVQUFVLG9FQUFvRTtBQUFBLElBQzFGO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbIk1hcmtkb2MiLCAibm9kZXMiLCAiX2EiLCAiX2EiLCAiX2IiLCAiX2EiLCAiTWFya2RvYyIsICJfYSIsICJub2RlcyIsICJwYXRoIiwgIk1hcmtkb2MiLCAibm9kZSIsICJNYXJrZG9jIiwgInBhdGgiLCAiTWFya2RvYyIsICJub2RlcyIsICJNYXJrZG9jIiwgIl9hIl0KfQo=
