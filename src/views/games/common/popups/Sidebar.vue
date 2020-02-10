<template>
    <v-navigation-drawer id="sidebar" v-model="isOpening" width="240" fixed temporary right>
        <v-container v-if="isVisibleCotnent" fluid fill-height>
            <v-layout align-start justify-center row wrap>
                <v-tabs v-model="tabSelection" slider-color="slider-style" height="46px" centered grow @change="onTabChange()">
                    <v-tab v-for="(tab, i) in tabList" :key="i">{{ tab }}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tabSelection" :touchless="true">
                    <v-tab-item v-for="(tab, i) in tabList" :key="i">
                        <div class="tab-content" @scroll="onScroll($event)"><v-layout row wrap>
                            <!-- Good tips -->
                            <template v-if="i === 0">
                                <TableCardMini v-for="(data, key) in goodTipsTableDatas" :key="key" :ref="`tableCardTip${ key }`" :tableNumber="key" :tableData="data" />
                            </template>

                            <!-- Lobby -->
                            <template v-if="i === 1" >
                                <TableCardMini v-for="(data, key) in activeTableDatas" :key="key" :ref="`tableCard${ key }`" :tableNumber="key" :tableData="data" />
                            </template>

                            <div class="tab-padding"></div>
                        </v-layout></div>
                    </v-tab-item>
                </v-tabs-items>
            </v-layout>
        </v-container>
    </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import Utils from "@/models/helper/utils"; 
import Events, { GameTypes, TableData, TableStatus } from "@/models/helper/types";


import ModulesMixin from "@/models/mixins/modulesMixin";

const TableCardMini = () => import("@/views/lobby/components/TableCardMini.vue");

@Component({ components: { TableCardMini }})
export default class Sidebar extends Mixins(ModulesMixin)
{
    isOpening: boolean = false;
    isVisibleCotnent: boolean = false;
    visibleTimeout = -1;

    tabSelection = 0;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("isOpening") onOpenChanged(val: boolean, old: boolean) {
        setTimeout(() => {
            if (val) {
                window.clearTimeout(this.visibleTimeout);
                this.isVisibleCotnent = true;
                Utils.addClass(".v-overlay", "v-overlay-transparency");
            }
            else {
                this.userInfo.tempSbBalance(0);
                this.cancelAllUnconfirmedBets();
                this.visibleTimeout = window.setTimeout(() => this.isVisibleCotnent = false, 500);
                Utils.removeClass(".v-overlay", "v-overlay-transparency");
            }
        }, 1);
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_SIDEBAR, this.onOpen);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_CHAT_BOX, this.onOpen);
    }

// #[Events] ---------- + ---------- + ----------
    onOpen(isOpening: boolean) {
        this.mediaCtrl.spotFxSound.play("click");
        this.isOpening = isOpening;
        this.tabSelection = 0;
    }

    onTabChange() {
        // console.log(`onTabChange: ${ this.tabSelection }`);
        Object.keys(this.activeTableDatas).forEach(key => (this.$refs[`tableCard${ key }`] as any)[0].$refs.roadmap && (this.$refs[`tableCard${ key }`] as any)[0].$refs.roadmap.onRedraw());
    }

// #[Methods] ---------- + ---------- + ----------
    cancelAllUnconfirmedBets(tableNum: any = "") {
        if (tableNum) this.tableState.cancelBets(tableNum);
        else {
            Object.keys(this.activeTableDatas).forEach(value => this.tableState.cancelBets(value));
        }
    }

    onScroll(event: Event) {
        // To disable the bounce effect bug when scrolling in iPhone
        const target = event.target as HTMLDivElement;
        if ((target.scrollTop <= 0) || (target.scrollTop + target.offsetHeight >= target.scrollHeight)) {
            target.style.overflow = "hidden";
            setTimeout(() => target.style.overflow = "", 200);
        }
    }

// [Computed] ---------- + ---------- + ----------
    get tabList() {
        return [this.$t("sidebar.goodTips"), this.$t("sidebar.lobby")];
    }

    get goodTipsTableDatas() {
        const tableDatas: {[tableNumber: string]: TableData} = {};
        this.tableState.goodTipsTables.forEach((value, index) => {
            if (!this.gameInfo.tableDatas[value]) return false;
            
            const tableNumber = this.gameInfo.tableDatas[value].tableNumber;
            tableDatas[tableNumber] = this.gameInfo.tableDatas[value];
        });

        return Object.keys(tableDatas)
                     .filter(tableNumber => {
                        const tableData = this.gameInfo.tableDatas[tableNumber];
                        if (!tableData || !tableData.code) return false;

                        const isActive = tableData.status !== TableStatus.Disconnected;
                        const isBaccarat = tableData.code === GameTypes.Baccarat;
                        const isSelf = tableNumber === this.gameInfo.currentTableInfo.tableNumber;
                        const isSpecTables = tableNumber.includes("MX");
                        const hasStatus = tableData.status !== undefined;

                        const gameMenu = this.gameInfo.gameList.find(value => value.name === tableData.code);
                        const gameEnabled = gameMenu ? gameMenu.enabled : true;
                        return isActive && isBaccarat && hasStatus && !isSelf && !isSpecTables && gameEnabled;
                     })
                     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
                     .reduce<{ [tableNumber: string]: TableData }>((result, value) => { result[value] = this.gameInfo.tableDatas[value]; return result; }, {});
    }

    get activeTableDatas(): { [tableNumber: string]: TableData } {
        return Object.keys(this.gameInfo.tableDatas)
                     .filter(tableNumber => {
                        const tableData = this.gameInfo.tableDatas[tableNumber];
                        if (!tableData || !tableData.code) return false;

                        const isActive = tableData.status !== TableStatus.Disconnected;
                        const isLiveGame = this.gameInfo.liveGame.indexOf(tableNumber[0]) > -1;
                        const isSelf = tableNumber === this.gameInfo.currentTableInfo.tableNumber;
                        const isSpecTables = tableNumber.includes("MX");
                        const hasStatus = tableData.status !== undefined;

                        const gameMenu = this.gameInfo.gameList.find(value => value.name === tableData.code);
                        const gameEnabled = gameMenu ? gameMenu.enabled : true;
                        return isActive && isLiveGame && hasStatus && !isSelf && !isSpecTables && gameEnabled;
                     })
                     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
                     .reduce<{ [tableNumber: string]: TableData }>((result, value) => { result[value] = this.gameInfo.tableDatas[value]; return result; }, {});
    }
}
</script>

<style lang="scss">
#app .v-overlay-transparency::before {
    opacity: 0.2;
}
#sidebar {
    background-color: rgba(#000000, 0.7);
    font-size: 16px;
    letter-spacing: -1px;
    overflow: hidden;

    .v-tabs {
        border: 2px solid $c-main;
        border-radius: 10px;

        .v-tabs__bar {
            background-color: transparent;
        }
        .v-tabs__div {
            text-transform: unset;
            font-size: 1.1rem !important;
            font-size: 3.5vw;
            font-weight: bold;

            .v-tabs__item {
                padding: 6px;
                width: 100px;
                color: $c-main;
            }
            .v-tabs__item--active {
                background-color: $c-main;
                color: #000000;
            }
            &:not(:last-of-type) {
                border-right: 1px solid $c-main;
            }
            &:nth-of-type(2) .v-tabs__item--active {
                border-top-left-radius: 7.5px;
                border-bottom-left-radius: 7.5px;
            }
            &:last-of-type .v-tabs__item--active {
                border-top-right-radius: 7.5px;
                border-bottom-right-radius: 7.5px;
            }
        }
    }

    .v-window {
        width: 100%;
        padding: 10px 0;

        .tab-content {
            height: calc(100vh - 80px);
            overflow-x: hidden;
            overflow-y: scroll;

            border: none;
            background-color: transparent;

            -webkit-overflow-scrolling: auto;
        }
        .tab-padding {
            width: 100%;
            height: 120px;
        }
    }
}
</style>
