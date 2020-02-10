import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import { cssua } from "cssuseragent";
import Screenfull from "screenfull";
import Vue from "vue";

import { app } from "@/main";
import Axios from "@/models/helper/axiosConfig";
import Events from "@/models/helper/types";
import Platform from "@/models/helper/platform";
import Socket from "@/models/helper/socket";
import store from "@/models/store";

@Module({ namespaced: true, dynamic: true, store, name: "siteState" })
export default class SiteState extends VuexModule
{
    /** Production Version */
    readonly version = "2.0.72.0000";
    readonly eventBus = new Vue();

    readonly license = "博彩执照 001";
    readonly copyright = "Copyright © 2019 Oriental Game. All rights reserved.";

    readonly cssua = cssua.ua;

    /** Check sockets if they are connected already */
    isInitialized = false;

    siteTitle = "";

    marqueeMessages = [];

    appHeight = 0;
    isPageChanging = false;
    isTapHintVisible = true;
    isScrollHintVisible = false;

    playFlag = false;

    isActivedGame = true;
    canLoadAssets = {
        roadmap: false,
        cards: false,
    };

    /** The status of current platform */
    platform = {
        screen: Platform.screen,
        orientation: Platform.orientation,
        device: Platform.device,
        browser: Platform.browser,
    };

    onlinePlayers = 0;

    existPopups: string[] = [];

// #[Getters] ---------- + ---------- + ----------


// #[Mutations] ---------- + ---------- + ----------
    /** Update the information of the platform and the screen */
    @Mutation upPlatformScreen() {
        this.platform.screen = Platform.screen;
        this.platform.orientation = Platform.orientation;

        this.appHeight = window.innerHeight;
    }

    /** Set language and change its state */
    @Mutation setLanguage(lang: string) {
        app.$i18n.locale = lang;
        this.siteTitle = app.$t("siteTitle[0]").toString();

        if (store.state.siteState.eventBus) store.state.siteState.eventBus.$emit(Events.ON_LANG_CHANGED);
    }

    @Mutation toggleFullscreen(isOn?: boolean) {
        if (!this.platform.device.isMobile) return;

        const screenfull = Screenfull as Screenfull.Screenfull;
        if (screenfull.enabled) {
            if (isOn !== undefined) {
                if (isOn) screenfull.request();
                else screenfull.exit();
            }
            else screenfull.toggle();
        }
    }

    @Mutation toggleTapHint(visible?: boolean) {
        this.isTapHintVisible = (visible === undefined) ? !this.isTapHintVisible : visible;
    }

    @Mutation toggleScrollHint(visible?: boolean) {
        this.isScrollHintVisible = (visible === undefined) ? !this.isScrollHintVisible : visible;
    }

    @Mutation setOnlinePlayers(count: number) {
        this.onlinePlayers = count;
    }

    @Mutation addExistPopup(name: string) {
        this.existPopups.push(name);
    }

    @Mutation removeExistPouup(name: string) {
        const i = this.existPopups.indexOf(name);
        if (i !== -1) this.existPopups.splice(i, 1);
    }

    @Mutation startLoadingAssets(res: "roadmap" | "cards") {
        this.canLoadAssets[res] = true;
    }

    @Mutation updateAnnouncement(messages: any) {
        this.marqueeMessages = messages;
    }

// #[Actions] ---------- + ---------- + ----------
    /** Load and set the language */
    @Action setLang({ lang, init }: { lang: string, init?: boolean }) {
        if (lang in app.$i18n.messages){
            this.context.commit("setLanguage", lang);
            if (!init) this.context.dispatch("userInfo/updateUser", { settings: { lang }}, { root: true });
        }
        else {
            // Load language data using lazy loading
            if (lang) {
                Axios.get(`.src/models/langs/${ lang }.json`)
                .then(res => {
                    app.$i18n.setLocaleMessage(lang, res.data);
                    this.context.commit("setLanguage", lang);
                    if (!init) this.context.dispatch("userInfo/updateUser", { settings: { lang }}, { root: true });
                })
                .catch(err => console.warn(`Failed to load language file: ${ lang }.json`, err));
            }
        }
    }

    @Action updateMarqueeMessage() {
        Socket.get("/announcement/getAnnouncementsBy", null, true)
              .then(res => this.context.commit("updateAnnouncement", res.data));
    }
}
