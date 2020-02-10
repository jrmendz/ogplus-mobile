/**
 * Declare for the module without Typescript definition
 */
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "vue-awesome-swiper" {
    export const swiper: any;
    export const swiperSlide: any;
}

declare module "vue-cookies" {
    export const set: any;
    export const get: any;
    export const remove: any;
}

declare module "v-emoji-picker" {
    import Vue from "vue";
    export default Vue;
}

declare module "vue-video-player" {
    import Vue from "vue";
    export const videoPlayer: Vue.Component;
}

//NOTE cssuseragent/cssua.js add `module.exports.cssua = cssua;`
declare module "cssuseragent" {
    export const cssua: {
        ua: {
            [key: string]: string,
        },
    };
}
