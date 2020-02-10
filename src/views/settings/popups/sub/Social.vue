<template>
    <SettingPopup ref="settingPopup" id="social" :event="event" no-scroll hasTitle>
        <template v-slot:title>{{ $t("subSetting.social.title") }}</template>
        <v-tabs v-model="tabSelection" slider-color="slider-style" :height="platform.orientation.isLandscape ? '32px' : '46px'" centered grow @change="onTabChange()">
            <v-tab v-for="(tab, i) in tabList" :key="i">{{ tab }}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabSelection">
            <v-tab-item v-for="(tab, i) in tabList" :key="i">
                <v-card flat>
                    <v-layout row wrap>
                        <!-- Ranking -->
                        <v-flex v-if="i === 0" xs12>
                            <v-data-table class="data-table ranking" :headers="rankingHeader" :items="socialInfo.rankingList" :pagination.sync="rankingPagination" hide-actions>
                                <template v-slot:items="props">
                                    <td><v-icon class="icon-add" @click="onAddFriend(props.item)">{{ props.item.add && props.item.name !== userInfo.nickname ? "add_circle_outline" : "" }}</v-icon></td>
                                    <td>{{ props.item.name }}</td>
                                    <td><v-icon class="icon-online" :color="props.item.online ? 'green' : 'red'">lens</v-icon></td>
                                    <td>{{ props.item.amount }}</td>
                                </template>
                                <template v-slot:no-data>
                                    <v-icon id="none-icon" class="pr-2">warning</v-icon><span>{{ $t("noData") }}</span>
                                </template>
                            </v-data-table>
                        </v-flex>

                        <!-- Friends -->
                        <v-flex v-if="i === 1" xs12>
                            <v-data-table class="data-table friends" :headers="friendHeader" :items="socialInfo.followedUsersList" :pagination.sync="friendPagination" hide-actions>
                                <template v-slot:items="props">
                                    <td><v-icon class="icon-remove" @click="onRemoveFriend(props.item)">{{ props.item.remove ? "remove_circle_outline" : "" }}</v-icon></td>
                                    <td @click="onItemClick(props.item)">{{ props.item.name }}</td>
                                    <td @click="onItemClick(props.item)"><v-icon class="icon-online" :color="props.item.online ? 'green' : 'red'">lens</v-icon></td>
                                    <td @click="onItemClick(props.item)">{{ props.item.table === "Lobby" ? $t("sidebar.lobby") : props.item.table }}</td>
                                    <td @click="onItemClick(props.item)">{{ props.item.followers }}</td>
                                </template>
                                <template v-slot:no-data>
                                    <v-icon id="none-icon" class="pr-2">warning</v-icon><span>{{ $t("noData") }}</span>
                                </template>
                            </v-data-table>
                        </v-flex>

                        <!-- Dealers -->
                        <v-flex v-if="i === 2" xs12>
                            <v-data-table class="data-table dealers" :headers="friendHeader" :items="socialInfo.followedDealersList" :pagination.sync="dealerPagination" hide-actions>
                                <template v-slot:items="props">
                                    <td><v-icon class="icon-remove" @click="onRemoveDealer(props.item)">{{ props.item.remove ? "remove_circle_outline" : "" }}</v-icon></td>
                                    <td @click="onItemClick(props.item)">{{ props.item.name }}</td>
                                    <td @click="onItemClick(props.item)"><v-icon class="icon-online" :color="props.item.online ? 'green' : 'red'">lens</v-icon></td>
                                    <td @click="onItemClick(props.item)">{{ props.item.table }}</td>
                                    <td @click="onItemClick(props.item)">{{ props.item.followers }}</td>
                                </template>
                                <template v-slot:no-data>
                                    <v-icon id="none-icon" class="pr-2">warning</v-icon><span>{{ $t("noData") }}</span>
                                </template>
                            </v-data-table>
                        </v-flex>

                        <!-- Join Buttons -->
                        <v-container v-if="i === 1 || i === 2" class="table-view">
                            <v-layout row wrap>
                                <v-flex :class="['img-table', (['cn', 'ja'].includes($i18n.locale) ? 'lang-kanji' : '')]" xs12>
                                    <v-img :src="require('@/assets/images/games/img_tableView.png')" height="76px" @click="onEnterTable()" contain>{{ $t("subSetting.social.enterTable") }}</v-img>
                                </v-flex>
                                <div v-for="i in 5" :key="i" :class="`table-join table-join-${ i }`">
                                    <v-img v-if="!itemTablePlayers[i-1]" :src="require('@/assets/images/games/img_tableJoin.png')" width="46px" @click="onEnterTable()" contain>{{ $t("subSetting.social.joinTable") }}</v-img>
                                    <div v-else>
                                        <div class="player-name">{{ itemTablePlayers[i-1]['playerName'] }}</div>
                                        <v-img :src="itemTablePlayers[i-1] !== '/static/avatar/avatar9a.png' ? itemTablePlayers[i-1]['playerImg'] : 'https://og-333.s3.amazonaws.com/panda/assets/avatar/avtr_01.png'" width="46px" @click="onEnterTable()" contain></v-img>
                                    </div>
                                </div>
                            </v-layout>
                        </v-container>
                    </v-layout>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </SettingPopup>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";
import Cookies from "vue-cookies";

import Events, { FollowDealerData, FollowUserData, RankingData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Socket from "@/models/helper/socket";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    readonly event = Events.ON_SOCIAL;

    tabSelection = 0;
    itemTable: string = "";
    itemTablePlayers: {playerImg: string, playerName: string}[] = [];

    rankingPagination = {
        descending: true, page: 1, rowsPerPage: -1, sortBy: "amount", totalItems: 0,
    };
    friendPagination = {
        descending: true, page: 1, rowsPerPage: -1, sortBy: "online", totalItems: 0,
    };
    dealerPagination = {
        descending: true, page: 1, rowsPerPage: -1, sortBy: "online", totalItems: 0,
    };

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(this.event, this.onGetSocials);
    }
    beforeDestroy() {
        this.eventBus.$off(this.event, this.onGetSocials);
    }

// #[Events] ---------- + ---------- + ----------
    onTabChange() {
        // console.log(`onTabChange: ${ this.tabSelection }`);
        this.onGetSocials();
    }

    onAddFriend(prop: any) {
        const data = this.socialInfo.followUser({ userId: prop.id });
        if (data) this.socialInfo.rankingList.map(player => player.id === prop.id ? (player.add = false) : player);
    }
    onRemoveFriend(prop: any) {
        const data = this.socialInfo.unfollowUser({ userId: prop.id });
        if (data) this.socialInfo.rankingList.map(player => player.id === prop.id ? (player.add = true) : player);
    }
    onRemoveDealer(prop: any) {
        const index = this.socialInfo.followedDealersList.indexOf(prop);
        this.socialInfo.followedDealersList.splice(index, 1);
        const data = this.socialInfo.unfollowDealer({ dealersCode: prop.dealersCode });
    }

    onEnterTable() {
        if (!this.tableState.hasConfirmBets(this.tableNumber) && this.tableNumber !== this.itemTable) {
            this.mediaCtrl.spotFxSound.play("click");
            if (this.itemTable !== "Lobby") {
                const code = this.gameInfo.tableDetails(this.itemTable)!.code;
                const subcode = this.gameInfo.tableDetails(this.itemTable)!.subcode === "bidding" ;
                if (this.userInfo.isBalanceSufficient) {
                    if (this.tableNumber) {
                        Socket.post("/tables/exitTable", { token: Cookies.get("panda_token"), tableid: this.tableNumber })
                            .then(res => {
                                this.tableState.enterTable({ tableNumber: this.itemTable, gameType: code, isBidding: subcode });
                            });
                    } else 
                        this.tableState.enterTable({ tableNumber: this.itemTable, gameType: code, isBidding: subcode });
                } else 
                    this.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, this.$t("messages.lobby.minCredit", [10]));
            } else {
                this.gameInfo.currentTableInfo.tableNumber = null;
                this.tableState.exitTable({ tableNumber: this.tableNumber, gameType: this.$route.params.id });
            }
        }
        (this.$refs.settingPopup as any).onOpen(false);
    }

    onGetSocials() {
        const dealerList = this.socialInfo.getFollowedDealers();
        const playerList = this.socialInfo.getFollowedPlayers();
        const playerRanking = this.socialInfo.getPlayerRanking();
        
        this.itemTable = "";
        this.itemTablePlayers = [];
    }

    onItemClick(itemObj: {table: string, name: string}) {
        this.itemTablePlayers = [];
        this.itemTable = itemObj.table;
        if (!this.gameInfo.tableDetails(this.itemTable)) return;

        const players = this.gameInfo.tableDetails(this.itemTable)!.players;
        if (!players) return;

        players.forEach(player => {
            const playerData = {
                playerImg: player.imgname_mobile,
                playerName: player.nickname
            };
            if (player.nickname === itemObj.name) this.itemTablePlayers.unshift(playerData);
            else this.itemTablePlayers.push(playerData);
        });
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get tableNumber() {
        return this.userInfo.tableSelection.tableNumber;
    }

    get tabList() {
        return [this.$t("subSetting.social.ranking"), this.$t("subSetting.social.friends"), this.$t("subSetting.social.dealers")];
    }
 
    get rankingHeader() {
        return [
            { value: "add"   , align: "center", text: "" },
            { value: "name"  , align: "center", text: this.$t("subSetting.social.name")   },
            { value: "online", align: "center", text: "" },
            { value: "amount", align: "center", text: this.$t("subSetting.social.amount") },
        ];
    }

    get friendHeader() {
        return [
            { value: "remove"   , align: "center", text: "" },
            { value: "name"     , align: "center", text: this.$t("subSetting.social.name")      },
            { value: "online"   , align: "center", text: "" },
            { value: "table"    , align: "center", text: this.$t("subSetting.social.table")     },
            { value: "followers", align: "center", text: this.$t("subSetting.social.followers") },
        ];
    }
}
</script>

<style lang="scss">
#social {
    .v-tabs {
        margin-top: 5px;
        z-index: 2;
        border: 1.5px solid #80818a;
        border-radius: 7.5px;
        overflow: hidden;
        .v-tabs__bar {
            background-color: transparent;
        }
        .v-tabs__div {
            text-transform: unset;
            font-size: 18px;
            font-weight: bold;

            .v-tabs__item {
                width: 25vw;
            }
            .v-tabs__item--active {
                background-color: #ffffff;
                background: linear-gradient(to bottom, #f5f6f6 0%,#dbdce2 21%,#b8bac6 92%);
                color: #000000;
            }
            &:not(:last-of-type) {
                border-right: 1px solid #80818a;
            }
            &:nth-of-type(2) .v-tabs__item--active {
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
            }
            &:last-of-type .v-tabs__item--active {
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
            }
        }
    }
    .v-window {
        margin-top: 10px;
        width: 100%;

        .v-card {
            height: calc(100vh - 340px);
            background-color: transparent;

            @include land-only {
                height: calc(100vh - 200px);
            }

            .data-table {
                &.ranking {
                    @include data-table-outline(calc(100vh - 340px), calc(100vh - 200px));
                }
                &.friends, &.dealers {
                    @include data-table-outline(calc(100vh - 340px - 145px), calc(100vh - 200px));

                    @include land-only {
                        width: calc(100% - 280px);
                    }
                }

                table.v-datatable {
                    thead {
                        th:first-of-type, th:nth-of-type(3) {
                            .v-icon {
                                transform: translate(8.5px, -2px);
                            }
                            &.column.sortable.active.desc .v-icon {
                                transform: translate(8.5px, -2px) rotate(-180deg);
                            }
                        }
                    }

                    .icon-add, .icon-remove {
                        transform: translateY(1px);
                    }
                    .icon-online {
                        transform: translateY(1px) scale(0.5);
                    }
                }
            }
            .table-view {
                position: absolute;
                bottom: 4%;
                height: 120px;

                @include land-only {
                    width: 210px;
                    right: 25px;
                }

                .flex, div {
                    color: #d7d1b5;
                    font-size: 14px;

                    .v-responsive__content {
                        margin-top: 12px;
                    }
                    &.img-table {
                        font-weight: bold;

                        .v-responsive__content {
                            margin-top: 20px;
                            font-size: 32px;
                        }

                        &.lang-kanji {
                            .v-responsive__content {
                                margin-top: 26px;
                                font-size: 28px;
                            }
                        }
                    }
                }
                .table-join {
                    position: absolute;
                    left: calc(50% - 23px);

                    &.table-join-1, &.table-join-5 {
                        top: 40px;
                    }
                    &.table-join-2, &.table-join-3, &.table-join-4 {
                        top: 95px;
                    }

                    &.table-join-1 {
                        transform: translateX(-110px);
                    }
                    &.table-join-2 {
                        transform: translateX(-70px);
                    }
                    &.table-join-4 {
                        transform: translateX(70px);
                    }
                    &.table-join-5 {
                        transform: translateX(110px);
                    }
                    .player-name {
                        position: absolute;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        bottom: 45px;
                        padding: 0 2px;
                        left: -25%;
                        width: 150%;
                        border-radius: 5px;
                        background-color: rgba(0, 0, 0, 0.6);
                        font-size: 11.5px;
                        line-height: 14px;
                        pointer-events: none;
                    }
                }
            }
        }
    }
}
@media (orientation: landscape) {
    #social .v-window .v-card .table-view {
        position: absolute;
        top: 3.5%;
        height: 100%;
        .img-table {
            .v-image {
                height: 80% !important;
                .v-responsive__content {
                    font-size: 22px;
                }
            }
        }
        .table-join {
                left: calc(50% - 28px);

                    &.table-join-1, &.table-join-5 {
                        top: 40px;
                    }
                    &.table-join-2, &.table-join-3, &.table-join-4 {
                        top: 90px;
                    }
                    &.table-join-1 {
                        transform: translateX(-90px);
                    }
                    &.table-join-2 {
                        transform: translateX(-60px);
                    }
                    &.table-join-4 {
                        transform: translateX(60px);
                    }
                    &.table-join-5 {
                        transform: translateX(100px);
                    }
        }
        div {
            .v-responsive__content {
                font-size: 12px;
            }
        }
    }
}
</style>
