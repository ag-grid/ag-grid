
require.config({
    paths: {
        angular: "lib/angular",
        css: "lib/css"
    },
    shim: {
        angular: {
            exports: "angular"
        }
    },
    deps: ["src/test"]
});
