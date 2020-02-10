import Vue from "vue";
import App from "./views/App.vue";
import Platform from "./models/helper/platform";
import router from "./models/router";
import store from "./models/store";
import i18n from "./models/lang";

const Port = +window.location.port;
if (Platform.device.isMobile && Port >= 8080 && Port <= 8090) Platform.openDebugConsole();

// Vuetify
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
Vue.use(Vuetify, { iconfont: "md" });

// Video.js
import videojs from "video.js";
(window as any).videojs = videojs;

import "video.js/dist/video-js.css";
require("video.js/dist/lang/zh-CN.js");
require("videojs-flash/dist/videojs-flash.min.js");
require("videojs-contrib-hls/dist/videojs-contrib-hls.min.js");

Vue.config.productionTip = false;

// Timestamp: YYMMDD.HHmm for development version
console.info("Dev Ver. 191213.1600");

export const app = new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
});

setTimeout(() => app.$mount("#app"), 200);
