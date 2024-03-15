module.exports = {
    plugins: [
      "stylelint-scss"
    ],
    customSyntax: "postcss-scss",
    rules: {
      "at-rule-no-unknown": null,
      "scss/at-rule-no-unknown": true,
      "scss/comment-no-loud": true,
      "scss/no-global-function-names": true,
      "scss/no-duplicate-mixins": true
    }
  }