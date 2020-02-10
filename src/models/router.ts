import Cookies from "vue-cookies";
import Router, { Route } from "vue-router";
import Vue from "vue";

import { app } from "@/main";
import Events, { GameTypes } from "@/models/helper/types";
import store from "@/models/store";
import Socket from "@/models/helper/socket";

Vue.use(Router);

const router =  new Router({
    routes: [
        {
            path: "/",
            alias: "/login",
            name: "login",
            component: () => import(/* webpackChunkName: "login" */ "../views/login/Login.vue"),
        },
        {
            path: "/lobby",
            name: "lobby",
            component: () => import(/* webpackChunkName: "lobby" */ "../views/lobby/Lobby.vue"),
            children: [
                {
                    path: ":id",
                    component: () => import(/* webpackChunkName: "tableSelection" */ "../views/lobby/sections/TableSelection.vue"),
                },
            ],
            beforeEnter: async (to: Route, from: Route, next: any) => {
                if (sessionStorage.tbl) {
                    await store.dispatch("tableState/exitTable", { tableNumber: sessionStorage.tbl, gameType: to.params.id, fromRoute: true });
                    return next();
                }
                return next();
            },
        },
        {
            path: "/game",
            name: "game",
            component: () => import(/* webpackChunkName: "game" */ "../views/games/Game.vue"),
            children: [
                {
                    path: ":id",
                    component: () => import(/* webpackChunkName: "gameContent" */ "../views/games/common/sections/GameContent.vue"),
                },
            ],
            beforeEnter: async (to: Route, from: Route, next: any) => {
                if (!sessionStorage.tbl) return next(`/lobby/${ to.params.id }`);
                
                if (sessionStorage.tbl && from.name === null) {
                    await store.dispatch("tableState/enterTable", { tableNumber: sessionStorage.tbl, gameType: to.params.id, isBidding: false, fromRoute: true })
                               .then(Response => next())
                               .catch(err => next(`/lobby/${ to.params.id }`));
                }
                return next();
            },
        },
    ],
});

let popStateDetected = false;
window.addEventListener("popstate", () => popStateDetected = true);

// Detect changed history or closed tab
window.addEventListener("beforeunload", () => {
    if (!store.state.siteState.isActivedGame) Cookies.set("panda_logout", new Date().getTime(), "5s");
});

// Detect focused windows
window.addEventListener("focus", () => {
    if (Socket.socketTime && Socket.socketTime !== Cookies.get("panda_socketTime")) {
        store.dispatch("userInfo/doLogout", false, { root: true });
        store.state.siteState.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, app.$t("messages.error.duplicate"), 60000);
    }
});

router.beforeEach(async (to: Route, from: Route, next: any) => {
    // Check whether already logouted or not
    if (new Date().getTime() - +Cookies.get("panda_logout") < 5000) {
        Cookies.remove("panda_logout");
        store.dispatch("userInfo/doLogout", false, { root: true });

        document.getElementById("pre-loading")!.remove();
        return next(false);
    }

    store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, true);
    store.state.siteState.isPageChanging = true;

    const isBack = popStateDetected;
    let isPlay = false;
    popStateDetected = false;

    // Fix for maximum call stack size, if token is invalid, just return next() to elude loop
    if (to.path === "/" && from.path === "/") return next();
    
    // Prohibit user from returning to other tabs in the Lobby page
    else if (to.path.includes("lobby") && from.path.includes("lobby")) {
        if (isBack) {
            store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
            return next(false);
        }
        else return next();
    }

    // Open the app from the official website
    else if (to.path.includes("play")) {
        store.state.siteState.playFlag = true;
        setTimeout(() => document.getElementById("page-loading")!.remove(), 3000);
        isPlay = true;
        return next(redirectPlay(to));
    }

    else if (to.path.includes("game") && from.path === "/") {
        return next(`/lobby/${ store.state.gameInfo.gameList[0].name }`);
    }

    // Switch to other game through the side bar
    else if (to.path.includes("game") && from.path.includes("game")) {
        if (store.state.userInfo.tableSelectionChanged) {
            store.state.userInfo.tableSelectionChanged = false;
            return next();
        }
        else return next(false);
    }

    const token = Cookies.get("panda_token");
    if (token) {
        const isVerified = await store.dispatch("userInfo/verifyLogin", { token, playerLocation: isPlay });

        // If the login isn't verified or passed, the app will back to Login page
        if (!isVerified) {
            Cookies.remove("panda_token");
            store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
            return next("/");
        }

        store.commit("userInfo/setLoginData");

        if (!store.state.siteState.isInitialized) {
            try {
                await store.dispatch("setSocket");
            }
            catch (e) {
                console.error(e);
                // setInterval(() => Store.dispatch("setSocket"), 5000);
            }
            store.state.siteState.isInitialized = true;
        }

        // The page will automatically jump to lobby if the path isn't legal
        const paths = to.path.split("/");
        const gameList = store.state.gameInfo.gameList;
        // const gameTypes = Object.values(GameTypes) as string[];

        // if (to.path.includes("game") && gameTypes.includes(paths[2])) next();
        // else if (paths.length !== 3 || gameList.findIndex(el => el.name === paths[2]) === -1)
        //      next(`/lobby/${ gameList[0].name }`);
        // else next();

        if (paths.length !== 3 || gameList.findIndex(el => el.name === paths[2]) === -1)
             next(`/lobby/${ gameList[0].name }`);
        else next();
    }
    else next("/");
});

router.afterEach((to: Route, from: Route) => {
    store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
});

function redirectPlay(to: Route) {
    const { query } = to;
    if (query.platform && query.platform === "desktop") {
        const link = location.host.substring(2, location.host.length);
        location.href = `https://${ link }/${ location.hash }`;
        return false;
    }
    if (query.t) {
        sessionStorage.session = `${ query.t }${ new Date().getTime() }`;
        sessionStorage.queryString = JSON.stringify(query);
        Cookies.set("panda_token", query.t);
        Cookies.set("language", query.lang);
        return "/lobby/baccarat";
    }
    else return "/";
}

export default router;
