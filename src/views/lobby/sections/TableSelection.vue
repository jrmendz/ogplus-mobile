<template>
    <v-container id="table-selection" grid-list-md justify-center align-start fluid ma-0 
                 @touchstart="onTouch('start', $event)" @touchmove="onTouch('move', $event)" @touchend="onTouch('end', $event)">
        <v-container class="scroll-area" fluid ma-0 pa-0 />
        <v-layout ref="tableSelection" align-start row wrap>
            <!-- <div class="banner-wrap">
                <v-img class="banner" :src="require(`@/assets/images/banners/img_banner0.jpg`)" width="100%" height="194px" />
                <v-carousel class="banner" height="194px">
                    <v-carousel-item v-for="i in 4" :key="i" :src="require(`@/assets/images/banners/img_banner${ i - 1 }.jpg`)"></v-carousel-item>
                </v-carousel>
            </div> -->
            <template v-if="isEmcee">
                <TableCardEmcee v-for="(data, key) in activeTableDatas" :key="`emcee-${ key }`" :tableNumber="key" :tableData="data" />
            </template>
            <template v-else>
                <TableCard v-for="(data, key) in activeTableDatas" :key="key" :tableNumber="key" :tableData="data" />
            </template>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";
import { TweenLite, Back, Power2 } from "gsap";
import Cookies from "vue-cookies";

import { GameTypes, TableData, TableStatus } from "@/models/helper/types";
import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    TableCard: () => import("@/views/lobby/components/TableCard.vue"),
    TableCardEmcee: () => import("@/views/lobby/components/TableCardEmcee.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    tableSelection!: HTMLDivElement;
    clientWidth = -1;

    canScrollVertical = true;
    touch = {
        start: { x: -1, y: -1 },
        end:   { x: -1, y: -1 },
    };
    
    serverTimeInterval!: number;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly isOpen!: boolean;

// #[Watch] ---------- + ---------- + ----------
    @Watch("$route") onRouteChanged(val: Route, old: Route) {
        this.clientWidth = window.innerWidth;

        const newPageIndex = this.gameInfo.gameList.findIndex(game => game.name === val.path.substr("/lobby/".length));
        const oldPageIndex = this.gameInfo.gameList.findIndex(game => game.name === old.path.substr("/lobby/".length));

        // To previous page
        if (newPageIndex < oldPageIndex) {
            TweenLite.killTweensOf(this.tableSelection);
            TweenLite.fromTo(this.tableSelection, 0.5, { x: -this.clientWidth / 2, opacity: 0 }, { x: 0, opacity: 1, ease: Back.easeOut });
        }
        // To next page
        else if (newPageIndex > oldPageIndex) {
            TweenLite.killTweensOf(this.tableSelection);
            TweenLite.fromTo(this.tableSelection, 0.5, { x: this.clientWidth / 2, opacity: 0 }, { x: 0, opacity: 1, ease: Back.easeOut });
        }

        if (val.path.includes("emcee")) this.gameInfo.updateEmceeDatas();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.tableSelection = this.$refs.tableSelection as HTMLDivElement;
        this.clientWidth = window.innerWidth;
        this.gameInfo.updateEmceeDatas();
        this.tableState.updateServerTime();
        this.serverTimeInterval = setInterval(() => this.tableState.updateServerTime(), 30000);

        window.onmessage = this.onMessage;

        setTimeout(() => this.mediaCtrl.randomBgm(), 200);
    }

    beforeDestroy() {
        TweenLite.killTweensOf(this.tableSelection);
        clearInterval(this.serverTimeInterval);
    }

// #[Events] ---------- + ---------- + ----------
    onTouch(pharse: string, e: TouchEvent) {
        if ((e.target as Element).className === "v-responsive__content") return;

        TweenLite.killTweensOf(this.tableSelection);

        switch (pharse) {
            case "start":
                this.touch.start.x = e.touches[0].clientX;
                this.touch.start.y = e.touches[0].clientY;
                break;

            case "move":
                this.touch.end.x = e.touches[0].clientX;
                this.touch.end.y = e.touches[0].clientY;

                if (Math.abs(this.touch.end.y - this.touch.start.y) < 20 && Math.abs(this.touch.end.x - this.touch.start.x) >= 40) {
                    TweenLite.set(this.tableSelection, { x: (this.touch.end.x - this.touch.start.x) / 2 });
                    this.canScrollVertical = false;
                }
                if (!this.canScrollVertical) e.preventDefault();
                break;

            case "end":
                const transX = this.touch.end.x - this.touch.start.x;
                const pageIndex = this.gameInfo.gameList.findIndex(game => game.name === this.$route.path.substr("/lobby/".length));

                let prevPageIndex = -1;
                for (let i = pageIndex - 1; i >= 0; i--) {
                    if (this.gameInfo.gameList[i].enabled) {
                        prevPageIndex = i;
                        break;
                    }
                }

                let nextPageIndex = -1;
                for (let i = pageIndex + 1; i < this.gameInfo.gameList.length; i++) {
                    if (this.gameInfo.gameList[i].enabled) {
                        nextPageIndex = i;
                        break;
                    }
                }

                // To previous page
                if (this.touch.end.x !== -1 && transX >= 180 && prevPageIndex !== -1)
                    this.$router.push(`/lobby/${ this.gameInfo.gameList[prevPageIndex].name }`);

                // To next page
                else if (this.touch.end.x !== -1 &&  transX <= -180 && nextPageIndex !== -1)
                    this.$router.push(`/lobby/${ this.gameInfo.gameList[nextPageIndex].name }`);
                    
                // No page changed, recover the position
                else TweenLite.to(this.tableSelection, 0.3, { x: 0, ease: Power2.easeInOut });

                this.canScrollVertical = true;
                this.touch.start.x = this.touch.end.x = this.touch.start.x = this.touch.end.y = -1;
                break;
        }
    }

    onMessage(e: MessageEvent) {
        const { id, gameId, ...data } = e.data as { id: string, gameId: "niuniu" | "threecards", [key: string]: string };

        if (id === "ready_game") {
            let el: HTMLIFrameElement;
                 if (gameId === "niuniu") el = this.$refs.gameNiuniu as HTMLIFrameElement;
            else if (gameId === "threecards") el = this.$refs.game3Games as HTMLIFrameElement;
            else return;

            el.contentWindow!.postMessage({
                id: "init_game",
                token: Cookies.get("panda_token"),
                userId: this.userInfo.getUserId,
            }, "*");
        }
        else if (id === "enter_game") {
            this.mediaCtrl.toggleAllSounds(false);
            this.gameInfo.setIsInIframeGame(true);
        }
        else if (id === "exit_game" ) {
            this.mediaCtrl.toggleAllSounds(true);
            this.gameInfo.setIsInIframeGame(false);
        }

        else if (id === "show_loading") this.eventBus.$emit(Events.ON_OPEN_LOADING, true);
        else if (id === "hide_loading") this.eventBus.$emit(Events.ON_OPEN_LOADING, false);

        else if (id === "open_userinfo") this.eventBus.$emit(Events.ON_USER_SETTING, true);
        else if (id === "open_setting") this.eventBus.$emit(Events.ON_GAME_SETTING, true);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get activeTableDatas(): { [tableNumber: string]: TableData } {
        return Object.keys(this.gameInfo.tableDatas)
                     .filter(tableNumber => {
                        const tableData = this.gameInfo.tableDatas[tableNumber];
                        if (!tableData || !tableData.code) return false;
                        
                        const isActive = tableData.status !== TableStatus.Disconnected;
                        let isTarget = false;
                             if (this.$route.path.includes("classic") && tableNumber[0] === "C") isTarget = true;
                        else if (this.$route.path.includes("grand"  ) && tableNumber[0] === "G") isTarget = true;
                        else isTarget = this.$route.path.includes(tableData.code);

                        const isSpecTables = tableNumber.includes("MX");
                        const hasStatus = tableData.status !== undefined;

                        const gameMenu = this.gameInfo.gameList.find(value => value.name === tableData.code);
                        const gameEnabled = gameMenu ? gameMenu.enabled : true;

                        if (this.isEmcee) return isActive && hasStatus && !isSpecTables;
                        else return isActive && hasStatus && (isTarget || this.isAllGames) && !isSpecTables && gameEnabled;
                     })
                     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
                     .sort((a, b) => {
                        if (this.isEmcee && this.gameInfo.emceeDatas[a] && this.gameInfo.emceeDatas[b]) {
                            if (this.gameInfo.emceeDatas[a].status === this.gameInfo.emceeDatas[b].status) return 0;
                            return (this.gameInfo.emceeDatas[a].status === "OFFLINE") ? 1 : -1; 
                        }
                        else return 0;
                     })
                     .reduce<{ [tableNumber: string]: TableData }>((result, value) => { result[value] = this.gameInfo.tableDatas[value]; return result; }, {});
    }

    get isLive() {
        return this.$route.path.includes("live");
    }
    get isEmcee() {
        return this.$route.path.includes("emcee");
    }
    get isAllGames() {
        return this.$route.path.includes("all");
    }
}
</script>

<style lang="scss">
#table-selection {
    padding: 80px 7.5px 75px 7.5px;
    
    @include land-only {
        padding: 55px 7.5px 75px 7.5px;
    }

    .banner-wrap {
        padding: 4px;
        width: 100%;

        @include sm-and-up {
            width: 50%;
        }

        .banner {
            border: 2px solid $c-main;
            border-radius: 7.5px;

            .v-carousel__controls {
                background: transparent;
                height: 30px;

                // justify-content: flex-end;

                .v-btn {
                    margin: 0 !important;
                }
                .v-btn--active i {
                    color: $c-main;
                    opacity: 0.85;
                }
            }
        }
    }

    .scroll-area {
        position: absolute;
        top: 0;
        left: 0;

        height: 100%;
        // min-height: 960px;

        // background-color: $c-black;
        // background-image: linear-gradient(147deg, #233d60, #09101b);

        // @include land-only {
        //     min-height: 480px;
        // }
    }

    .iframe-game {
        position: fixed;
        left: 0;
        top: 72px;
        width: 100%;
        height: calc(100% - 56px);

        @include land-only {
            @include ios-left("", "0px");
            @include ios-width("", "100%");
        }

        &.in-iframe-game {
            z-index: 10;
            top: 0;
            height: 100%;

            background-color: #000000;
        }
    }
}
</style>
