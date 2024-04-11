import { transformMarkdoc } from './transformMarkdoc';

describe('transformMarkdoc', () => {
    it('renders enterprise icons', () => {
        const framework = 'javascript';
        const markdocContent = 'enterprise: {% enterpriseIcon /%}';
        const { renderTree } = transformMarkdoc({ framework, markdocContent });

        expect(renderTree).toMatchInlineSnapshot(`
          Tag {
            "$$mdtype": "Tag",
            "attributes": {},
            "children": [
              Tag {
                "$$mdtype": "Tag",
                "attributes": {},
                "children": [
                  "enterprise: ",
                  Tag {
                    "$$mdtype": "Tag",
                    "attributes": {},
                    "children": [],
                    "name": {
                      "namedExport": "EnterpriseIcon",
                      "path": "../../external/ag-website-shared/src/components/icon/EnterpriseIcon",
                      "type": "local",
                      Symbol(@astrojs/markdoc/component-config): true,
                    },
                  },
                ],
                "name": "p",
              },
            ],
            "name": "article",
          }
        `);
    });

    it('renders links', () => {
        const framework = 'javascript';
        const markdocContent = '[AG Grid](https://ag-grid.com/)';
        const { renderTree } = transformMarkdoc({ framework, markdocContent });

        expect(renderTree).toMatchInlineSnapshot(`
          Tag {
            "$$mdtype": "Tag",
            "attributes": {},
            "children": [
              Tag {
                "$$mdtype": "Tag",
                "attributes": {},
                "children": [
                  Tag {
                    "$$mdtype": "Tag",
                    "attributes": {
                      "href": "https://ag-grid.com/",
                    },
                    "children": [
                      "AG Grid",
                    ],
                    "name": "a",
                  },
                ],
                "name": "p",
              },
            ],
            "name": "article",
          }
        `);
    });

    it('partialRenderTree strips out document and paragraph tags', () => {
        const framework = 'javascript';
        const markdocContent = '**hello**';
        const { renderTree, partialRenderTree } = transformMarkdoc({ framework, markdocContent });

        expect(renderTree).toMatchInlineSnapshot(`
          Tag {
            "$$mdtype": "Tag",
            "attributes": {},
            "children": [
              Tag {
                "$$mdtype": "Tag",
                "attributes": {},
                "children": [
                  Tag {
                    "$$mdtype": "Tag",
                    "attributes": {},
                    "children": [
                      "hello",
                    ],
                    "name": "strong",
                  },
                ],
                "name": "p",
              },
            ],
            "name": "article",
          }
        `);
        expect(partialRenderTree).toMatchInlineSnapshot(`
          [
            Tag {
              "$$mdtype": "Tag",
              "attributes": {},
              "children": [
                "hello",
              ],
              "name": "strong",
            },
          ]
        `);
    });

    it('renders react without outer document/p wrapper', () => {
        const framework = 'javascript';
        const markdocContent = 'hello';
        const { MarkdocContent } = transformMarkdoc({ framework, markdocContent });

        expect(MarkdocContent()).toMatchInlineSnapshot(`
          <React.Fragment>
            hello
          </React.Fragment>
        `);
    });
});
