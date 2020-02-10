import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import Cookies from "vue-cookies";

import { app } from "@/main";
import Axios from "@/models/helper/axiosConfig";
import Events from "@/models/helper/types";
import Router from "@/models/router";
import store from "@/models/store";
import Utils from "@/models/helper/utils";

@Module({ namespaced: true, dynamic: true, store, name: "userInfo" })
export default class UserInfo extends VuexModule
{
    readonly avatarUrl = `http://static.oriental-game.com/avatars/mobile/avatar{0}a.png`;
    readonly balanceRequirement = 0;

    /** Login status */
    hasLoggedIn = false;
    isInLobby = false;

    /** If the table number is empty, it means that the player isn't in the game */
    tableSelection = { tableNumber: "", gameType: "",  isBidding: false };
    tableSelectionChanged = false;

    canChat = false;

    // User data from backend
    imgname = "";
    nickname = "OG_Player";
    balance = 0;
    tempInGameBalance = 0;
    tempSideBarBalance = 0;
    id = "";
    avatarId = 9;
    user_settings = {
        desktop: {},
        mobile: {
            lang: "",
            chips: [],
        },
    };
    max_bet_limit = 0;
    min_bet_limit = 0;

// #[Getters] ---------- + ---------- + ----------
    get getUserId() {
        return this.id;
    }

    get getUserLang() {
        const urlLang = Cookies.get("language") as string;
        Cookies.remove("language");

        // Check the language from the database
        if (this.user_settings && this.user_settings.mobile && this.user_settings.mobile.lang) {
            return this.user_settings.mobile.lang as string;
        }
        else {
            // Check the language from the browswer
            if (navigator.language.includes("zh-")) return "cn";
            else {
                const browserLang = (navigator.language.length === 2) ? navigator.language : navigator.language.substring(3).toLowerCase();

                // Check the language from the url
                if (Object.keys(app.$i18n.messages).includes(browserLang)) return browserLang;
                else if (urlLang && urlLang !== "undefined") return urlLang;
            }
        }

        // Use the default language
        return app.$i18n.fallbackLocale;
    }

    get getUserChips() {
        if (!this.user_settings) return [10, 50, 100, 500, 1000];
        return this.user_settings.mobile.chips;
    }

    get userMaxBet() {
        return this.max_bet_limit;
    }

    get userMinBet() {
        return this.min_bet_limit;
    }

    /** Check if the balance is sufficient */
    get isBalanceSufficient() {
        return this.balance >= this.balanceRequirement;
    }

    get tableTheme() {
        return ({ C: "-green", G: "-yellow" } as { [key: string]: string })[this.tableSelection.tableNumber[0]] || "";
    }
// #[Mutations] ---------- + ---------- + ----------
    /** Set login status is success */
    @Mutation setLoginData(name: string) {
        this.hasLoggedIn = true;
        this.isInLobby = !!this.tableSelection.tableNumber;
    }

    @Mutation setUser(user: any) {
        if (Object.keys(user).length)
            user.user_settings = typeof user.user_settings === "string" ? JSON.parse(user.user_settings) : user.user_settings;

        try {
            this.avatarId = (user && user.imgname_mobile && parseInt(user.imgname_mobile.match(/avatar(\d+)a.png/)[1], 10)) || 9;
            if (this.avatarId < 9) this.avatarId = 9;
        }
        catch {
            this.avatarId = 9;
        }

        Object.assign(this, user);
    }

    @Mutation setAvatarId(id: number) {
        this.avatarId = id;
    }

    @Mutation setNickname(name: string) {
        this.nickname = name;
    }

    @Mutation setAvatar(imgLink: string) {
        this.imgname = imgLink;
    }

    @Mutation updateBalance(balance: number) {
        this.balance = balance;
    }

    @Mutation updateTempInGameBalance(num: number) {
        this.tempInGameBalance = num;
    }

    @Mutation updateTempSideBarBalance(num: number) {
        this.tempSideBarBalance = num;
    }

    @Mutation selectTable(tableSelection: { tableNumber: string, gameType: string, isBidding: boolean }) {
        this.isInLobby = false;
        this.tableSelectionChanged = (this.tableSelection.tableNumber !== "");
        this.tableSelection = tableSelection;
    }

    @Mutation backToLobby() {
        this.isInLobby = true;
        this.tableSelectionChanged = false;
        this.tableSelection = { tableNumber: "", gameType: "", isBidding: false };
    }

    @Mutation enableChat(enable = true) {
        this.canChat = enable;
    }

    @Mutation updateUserSettings(data: any) {
        this.updateUserSettings = data;
    }

// #[Actions] ---------- + ---------- + ----------
    @Action tempBalance(num: number) {
        this.context.commit("updateTempInGameBalance", num);
    }

    @Action tempSbBalance(num: number) {
        this.context.commit("updateTempSideBarBalance", num);
    }

    @Action doLogout(clearCookies = true) {
        if (clearCookies) {
            Cookies.remove("panda_token");
            Cookies.remove("panda_id");
        }

        this.context.dispatch("mediaCtrl/toggleAllSounds", false, { root: true });
        this.context.rootState.siteState.isActivedGame = false;
    }

    @Action doLogin({ username, password }: { username: string, password: string }) {
        store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, true);
        Axios.post("/user/login", { username, password })
             .then(res => {
                Cookies.set("panda_token", res.data.credentials.token, "1d");
                Cookies.set("panda_id", res.data.credentials.user.id, "1d");

                const user = res.data.credentials.user;
                if (user && user.imgname_mobile && user.imgname_mobile.match(/avtr_(\d+).png/)) {
                    const url = Utils.format((this.context.state as this).avatarUrl, parseInt(user.imgname_mobile.match(/avtr_(\d+).png/)[0], 10));
                    user.imgname_mobile = url;
                    this.context.dispatch("updateUser", { imgname: url, imgname_mobile: url });
                }

                this.context.commit("siteState/toggleFullscreen", true, { root: true });
                this.context.commit("setUser", res.data.credentials.user);
                this.context.commit("setLoginData");
                this.context.dispatch("siteState/setLang", { lang: this.getUserLang, init: true }, { root: true });
                this.context.rootState.siteState.eventBus.$emit(Events.ON_MSG_SNACKBAR, false);

                Router.push("/lobby");
             })
             .catch(e => {
                // Error handle
                store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                this.context.rootState.siteState.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, app.$t("messages.error.login"));
                console.log(e);
             });
    }

    @Action async verifyLogin({token, playerLocation }: { token: string, playerLocation: boolean }) {
        return await Axios.post("/verifyLogin", { token, playerLocation })
            .then(res => {
                this.context.commit("setUser", res.data.userdata);
                this.context.commit("setLoginData");
                this.context.dispatch("siteState/setLang", { lang: this.getUserLang, init: true }, { root: true });
                return res.data.userdata;
            })
            .catch(e => {
                console.error(e);
                return null;
            });
    }

    @Action async updateUser(updates: any) {
        const token = Cookies.get("panda_token");
        
        updates = constructUserSettingUpdate(updates, this);

        return Axios.put("/user/update-information", { token, params: updates })
                    .then(res => {
                        if (updates.hasOwnProperty("imgname"))
                            this.context.commit("setAvatar", updates.imgname);
                    })
                    .catch(e => console.log(e));
    }
}

function constructUserSettingUpdate(args: any, instance: any) {
    const nickname = args.nickname || instance.nickname;
    const imgname = args.imgname || instance.imgname;

    let settings = instance.user_settings;
    if (args.settings) {
        settings = {
            desktop: { lang: args.settings.lang, chips: args.settings.chips },
            mobile: { lang: args.settings.lang, chips: args.settings.chips },
        };
        instance.updateUserSettings(settings);
    }
    const user_settings = JSON.stringify(settings);
    
    return { nickname, user_settings, imgname, imgname_mobile: imgname };
}
