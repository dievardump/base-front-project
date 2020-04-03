module.exports = ctx => {
    return {
        ...ctx,
        plugins: [
            require("postcss-import")(),
            require("postcss-mixins")(),
            require("postcss-conditionals")(),
            require("postcss-for")(),
            require("postcss-each")(),
            require("postcss-preset-env")({
            stage: 3,
            features: {
                "nesting-rules": false,
                "color-mod-function": { unresolved: "warn" }
            }
            }),
            require("postcss-nested")(),
            require("postcss-extend")(),
            require("postcss-easings")(),
            ctx.env === 'production' &&
            require("cssnano")({
                autoprefixer: false
            })
        ]
    };
};
