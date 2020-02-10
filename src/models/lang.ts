import Vue from "vue";
import VueI18n from "vue-i18n";

import en from "./langs/en.json";
import cn from "./langs/cn.json";
import ja from "./langs/ja.json";
import kr from "./langs/ko.json";
import id from "./langs/id.json";
import th from "./langs/th.json";
import vi from "./langs/vi.json";

Vue.use(VueI18n);

/** Default language */
const locale = "en";
const messages = { en, cn, ja, kr, id, th, vi };

export default new VueI18n({ locale, fallbackLocale: locale, messages });
