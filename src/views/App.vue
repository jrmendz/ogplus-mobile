<template>
    <v-app id="app" :class="siteState.existPopups.length !== 0 && 'filter-blur'" dark>
        <v-content v-if="siteState.isActivedGame">
            <router-view />
            <UserSetting />
            <GameSetting />
            <LangSetting />
            <History />
            <Social />
            <PageLoading />
        </v-content>

        <div class="logout-icon" v-else>
            <img :src="require(`@/assets/images/img_logoPlus.png`)" />
            <div class="logout-text">{{ $t("logout") }}</div>
        </div>
        <MsgSnackbar />

        <!-- The images / textures for the roadmap feature -->
        <div v-if="siteState.canLoadAssets.roadmap" class="road-hidden">
            <template v-for="type in ['', '-game', '-mini']">
                <img :id="`grid${ type }`" :key="`grid${ type }`" :src="require(`@/assets/images/games/road/img_roadMapGrid${ type }.png`)" />
                <img :id="`grid${ type }-dark`" :key="`grid${ type }-dark`" :src="require(`@/assets/images/games/road/img_roadMapGrid${ type }-dark.png`)" />
                <img :id="`wheel${ type }`" :key="`wheel${ type }`" :src="require(`@/assets/images/games/road/img_moneywheelGrid${ type }.png`)" />
                <img :id="`wheel${ type }-dark`" :key="`wheel${ type }-dark`" :src="require(`@/assets/images/games/road/img_moneywheelGrid${ type }-dark.png`)" />
                <img :id="`roulet${ type }`" :key="`roulet${ type }`" :src="require(`@/assets/images/games/road/img_rouletteGrid${ type }.png`)" />
                <img :id="`roulet${ type }-dark`" :key="`roulet${ type }-dark`" :src="require(`@/assets/images/games/road/img_rouletteGrid${ type }-dark.png`)" />
                <img :id="`tcards${ type }`" :key="`tcards${ type }`" :src="require(`@/assets/images/games/road/img_tcardsGrid${ type }.png`)" />
                <img :id="`tcards${ type }-dark`" :key="`tcards${ type }-dark`" :src="require(`@/assets/images/games/road/img_tcardsGrid${ type }-dark.png`)" />
                <img :id="`niu${ type }`" :key="`niu${ type }`" :src="require(`@/assets/images/games/road/img_niuniuGrid${ type }.png`)" />
                <img :id="`niu${ type }-dark`" :key="`niu${ type }-dark`" :src="require(`@/assets/images/games/road/img_niuniuGrid${ type }-dark.png`)" />
                <template v-if="type !== '-mini'">
                    <img :id="`grid${ type }-lookup`" :key="`grid${ type }-lookup`" :src="require(`@/assets/images/games/road/img_roadMapGrid${ type }-lookup.png`)" />
                    <img :id="`grid${ type }-lookup-dark`" :key="`grid${ type }-lookup-dark`" :src="require(`@/assets/images/games/road/img_roadMapGrid${ type }-lookup-dark.png`)" />
                </template>
            </template>
            <img :id="`roulet-game-row`" :key="`roulet-game-row`" :src="require(`@/assets/images/games/road/img_rouletteGrid-game-row.png`)" />
            <img :id="`roulet-game-row-dark`" :key="`roulet-game-row-dark`" :src="require(`@/assets/images/games/road/img_rouletteGrid-game-row-dark.png`)" />
            <img :id="`bean-star`" :key="`bean-star`" :src="require(`@/assets/images/games/road/other/img_star.png`)" />
            <template v-for="type in gameInfo.beadIds.dragonTiger.slice(0, 2)">
                <img :id="`bean-${ type }`" :key="`bean-${ type }`" :src="require(`@/assets/images/games/road/bean/img_${ type }.png`)" />
                <img :id="`bean-${ type }-cn`" :key="`bean-${ type }-cn`" :src="require(`@/assets/images/games/road/bean-cn/img_${ type }.png`)" />
            </template>
            <template v-for="type in [gameInfo.beadIds.threeCards[1], ...gameInfo.beadIds.threeCards.slice(3, 5)]">
                <img :id="`bean-${ type }`" :key="`bean-${ type }`" :src="require(`@/assets/images/games/road/bean/img_${ type }.png`)" />
                <img :id="`bean-${ type }-cn`" :key="`bean-${ type }-cn`" :src="require(`@/assets/images/games/road/bean-cn/img_${ type }.png`)" />
            </template>
            <template v-for="type in gameInfo.beadIds.baccarat">
                <template v-for="pair in gameInfo.beadIds.pair">
                    <img :id="`bean-${ type }${ pair }`" :key="`bean-${ type }${ pair }`" :src="require(`@/assets/images/games/road/bean/img_${ type }${ pair }.png`)" />
                    <img :id="`bean-${ type }${ pair }-cn`" :key="`bean-${ type }${ pair }-cn`" :src="require(`@/assets/images/games/road/bean-cn/img_${ type }${ pair }.png`)" />
                    <template v-if="type !== 'tie'">
                        <img :id="`other-${ type }${ pair }`" :key="`other-${ type }${ pair }`" :src="require(`@/assets/images/games/road/other/img_${ type }${ pair }.png`)" />
                    </template>
                    <template v-if="type === 'banker'">
                        <img :id="`bean-${ type }${ pair }-s6`" :key="`bean-${ type }${ pair }-s6`" :src="require(`@/assets/images/games/road/other/img_${ type }${ pair }-s6.png`)" />
                    </template>
                </template>
                <template v-if="type !== 'tie'">
                    <img :id="`other-${ type }-fill`" :key="`other-${ type }-fill`" :src="require(`@/assets/images/games/road/other/img_${ type }-fill.png`)" />
                </template>
            </template>
            <img :id="`niu-win`" :key="`niu-win`" :src="require(`@/assets/images/games/road/niuniu/img_win.png`)" />
            <template v-for="i in 10">
                <img :id="`other-tie${ i }`" :key="`other-tie${ i }`" :src="require(`@/assets/images/games/road/other/img_tie${ i }.png`)" />
            </template>
            <template v-for="type in gameInfo.wheelIds">
                <img :id="`wheel-${ type }`" :key="`wheel-${ type }`" :src="require(`@/assets/images/games/road/wheel/img_${ type }.png`)" />
            </template>
            <template v-for="i in 37">
                <img :id="`roulet-s${ i - 1 }`" :key="`roulet-s${ i - 1 }`" :src="require(`@/assets/images/games/road/roulette/img_s${ i - 1 }.png`)" />
            </template>
        </div>

        <!-- The images / textures for the squeeze feature -->
        <div v-if="siteState.canLoadAssets.cards" class="card-hidden">
            <img id="card-finger" :src="require('@/assets/images/games/cards/img_finger.png')" />
            <img id="card-back-blue" :src="require('@/assets/images/games/cards/img_back-blue.png')" />
            <img id="card-back-red"  :src="require('@/assets/images/games/cards/img_back-red.png')" />
            <template v-for="suit in ['club/c', 'diamond/d', 'heart/h', 'spade/s']">
                <template v-for="num in 13">
                    <img :id="`card-${ suit.slice(0, -2) }${ num }`"       :key="`card-${ suit.slice(0, -2) }${ num }`"       :src="require(`@/assets/images/games/cards/sidebar/${ suit }${ num }.png`)" />
                    <img :id="`card-table-${ suit.slice(0, -2) }${ num }`" :key="`card-table-${ suit.slice(0, -2) }${ num }`" :src="require(`@/assets/images/games/cards/table/${ suit }${ num }.png`)" />
                </template>
            </template>
        </div>

        <!-- <div class="cssua-info">
            <div v-for="(value, key) in siteState.cssua" :key="key">{{ key }}: {{ value }}</div>
        </div> -->
    </v-app>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    GameSetting: () => import("@/views/settings/popups/GameSetting.vue"),
    History    : () => import("@/views/settings/popups/MsgSnackbar.vue"),
    LangSetting: () => import("@/views/settings/popups/PageLoading.vue"),
    MsgSnackbar: () => import("@/views/settings/popups/sub/Social.vue"),
    PageLoading: () => import("@/views/settings/popups/sub/History.vue"),
    Social     : () => import("@/views/settings/popups/sub/LangSetting.vue"),
    UserSetting: () => import("@/views/settings/popups/UserSetting.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    hasLoadingRemoved = false;

    routeNames: string[] = [];
    routeTransName: string = "slide-right";

// #[Props] ---------- + ---------- + ----------
    

// #[Watch] ---------- + ---------- + ----------
    @Watch("$route") onRouteChanged(val: Route, old: Route) {
        // Fix for iOS swipe (back)
        const { tableNumber } = this.userInfo.tableSelection;
        if (this.tableState.hasConfirmBets(tableNumber)) {
            
            const { code, subcode } = this.gameInfo.tableDetails(tableNumber)!;
            this.tableState.enterTable({ tableNumber, gameType: code, isBidding: subcode === "bidding" });
        }

        // console.log(`current route: ${ this.$route.path } ${ this.$route.name ? "(" + this.$route.name + ")" : "" }`);

        const oldIdx = old ? this.routeNames.indexOf(old.name!) : -1;
        const newIdx = val ? this.routeNames.indexOf(val.name!) : this.routeNames.length;

        this.routeTransName = (oldIdx < newIdx) ? "slide-right" : "slide-left";
    }

    @Watch("siteState.canLoadAssets", { deep: true }) onCanLoadAssetsChanged(val: boolean) {
        if (val) {
            this.mediaCtrl.initSounds();

            const raf = requestAnimationFrame || webkitRequestAnimationFrame /*|| mozRequestAnimationFrame || msRequestAnimationFrame*/;
                  raf ? raf(this.onLoadFonts) : window.addEventListener("load", this.onLoadFonts);
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    created() {
        // Get all routing page names
        const router: any = this.$router;
        for (const route of router.options.routes)
            this.routeNames.push(route.name);

        // Ban zooming when double-click or zoom-gesture for iOS
        if (this.siteState.platform.device.isIOS) {
            let lastTouchEnd = 0;

            document.addEventListener("touchstart", event => (event.touches.length > 1) && event.preventDefault(), false);
            document.addEventListener("touchend", event => {
                const now = new Date().getTime();
                if (now - lastTouchEnd <= 300) event.preventDefault();
                lastTouchEnd = now;
            }, false);
            document.addEventListener("gesturestart", event => event.preventDefault());
        }
    }

    mounted() {
        window.addEventListener("resize", this.onResize);
    }

    updated() {
        // Remove the pre-loading animation 
        if (!this.hasLoadingRemoved) {
            if (document.getElementById("pre-loading")) document.getElementById("pre-loading")!.remove();
            this.hasLoadingRemoved = true;
        }
    }

// #[Events] ---------- + ---------- + ----------
    onLoadFonts() {
        const head = document.getElementsByTagName("head")[0];
        const langs = [/*"TC",*/ "SC", "JP", "KR"];

        for (const lang of langs) {
            const noto = document.createElement("link");
                  noto.rel = "stylesheet";
                  noto.href = `https://fonts.googleapis.com/css?family=Noto+Sans+${ lang }:400,700.css`;
            head.appendChild(noto);
        }

        // const roboto = document.createElement("link");
        //       roboto.rel = "stylesheet";
        //       roboto.href = `https://fonts.googleapis.com/css?family=Roboto+Slab:400,700.css`;
        // head.appendChild(roboto);
    }

    onResize() {
        this.siteState.upPlatformScreen();
    }
    
    onFocusInput(isFocus: boolean) {
        if (this.siteState.platform.device.isAndroid) {
            const appHeight = this.siteState.appHeight;
            window.addEventListener("resize", () => this.eventBus.$emit(Events.ON_FOCUS_INPUT, isFocus, appHeight, this.siteState.platform.orientation.isPortrait));
        }
    }
    
// #[Methods] ---------- + ---------- + ----------
    

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
@import "ceaser-easing";

body, input, label, button, .application {
    font-family: "Times New Roman", /*"Roboto Slab", "Noto Sans TC",*/ "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", "Noto Color Emoji", monospace, sans-serif !important;
    text-align: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    margin: 0;
}
body {
    color: #ffffff;
    background-color: $c-black; 

    a {
        text-decoration: none;
    }

    // Ban selecting text
    @include prefix(user-select, none, ms moz khtml webkit);
    -webkit-touch-callout: none;

    // Safe area for iOS 11.0+, 11.2+
    @include ios-left("padding", "0px");
    @include ios-right("padding", "0px");
}

#app {
    #menu {
        padding: 30px;

        a {
            font-weight: bold;
            color: #2c3e50;

            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }

    .v-overlay::before {
        background-color: #808080;
    }
    .v-overlay--active::before {
        opacity: 0.15;
    }

    .road-hidden, .card-hidden {
        display: none;
    }

    .cssua-info {
        position: absolute;
        left: 0;
        top: 0;
        width: 150px;
        height: 100px;

        color: black;
        background: rgba(#ffffff, 0.5);
    }

    .logout-icon {
        position: fixed;
        width: 100%;
        height: 100%;

        img {
            height: 120px;
            margin-top: calc(100% - 60px);

            opacity: 0.4;
        }
    }
    .logout-text {
        padding: 0 20px;
        margin-top: 10px;
        font-size: 18px;
        color: #a0a0a0;
    }
}
</style>
