module.exports = {
    css: {
        loaderOptions: {
            sass: {
                data: `
                    @import "src/assets/scss/themes.scss";
                    @import "src/assets/scss/mixins.scss";
                `,
            },
        },
    },
}
