
require.config({
    paths: {
        angular: "lib/angular",
        css: "lib/css",
        text: "lib/text"
    },
    shim: {
        angular: {
            exports: "angular"
        }
    },
    deps: ["src/test"]
});
