<template>
    <v-flex class="table-card-emcee" xs6 sm3 md2>
        <v-card flat @click="onEnter()">
            <div class="card-content">
                <v-img :class="['emcee-image', (!emceeData || emceeData.status === 'OFFLINE') && 'grayscale']" height="100%" :src="dealerImage" />
                <div class="total-people">
                    <v-img :src="require('@/assets/images/settings/img_people.png')" width="18px" height="100%" contain />
                    <span>{{ tableData.playerCount || 0 }}</span>
                </div>
                <div class="dealer-name">{{ dealerName }}</div>
                <v-img class="game-icon" width="30%" height="20%" :src="gameIcon" position="center right" contain></v-img>
                <div class="game-name">{{ tableName }}</div>
                <div v-if="tableState.isEmceeRestTime" class="offline-text">{{ $t("emceeTime") }} <br>10 AM</div>
            </div>
        </v-card>
    </v-flex>
</template>

<script lang="ts">
/* eslint-disable */
// import $ from "jquery";
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import { GameTypes, TableData } from "@/models/helper/types";
import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {} })
export default class extends Mixins(ModulesMixin)
{


// [Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;
    @Prop() readonly tableData!: TableData;

// [Watch] ---------- + ---------- + ----------
    @Watch("emceeDatas") onEmceeDatasChanged() {
        this.$forceUpdate();
    }

// [Life Cycle] ---------- + ---------- + ----------


// [Methods] ---------- + ---------- + ----------
    onEnter() {
        if (this.emceeData.status !== "LIVE") return;

        this.mediaCtrl.spotFxSound.play("click");

        if (this.userInfo.isBalanceSufficient)
             this.tableState.enterTable({ tableNumber: this.tableNumber, gameType: this.tableData.code, isBidding: this.tableData.subcode === "bidding", isEmcee: this.$route.path.includes("emcee") });
        else this.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, this.$t("messages.lobby.minCredit", [this.userInfo.balanceRequirement]));
    }

// [Computed] ---------- + ---------- + ----------
    get isBaccarat() { return this.tableData.code === GameTypes.Baccarat; }
    get isDragonTiger() { return this.tableData.code === GameTypes.DragonTiger; }

    get tableName() {
        let name: string = "";

             if (this.tableData.code === GameTypes.Baccarat   ) name = "gameNames.baccarat";
        else if (this.tableData.code === GameTypes.DragonTiger) name = "gameNames.dragonTiger";
        else if (this.tableData.code === GameTypes.Moneywheel ) name = "gameNames.moneywheel";
        else if (this.tableData.code === GameTypes.Roulette   ) name = "gameNames.roulette";
        else if (this.tableData.code === GameTypes.ThreeCards ) name = "gameNames.threecards";
        else if (this.tableData.code === GameTypes.Niuniu     ) name = "gameNames.niuniu";

        name += (this.tableData.subcode === "bidding" ? "Bid" : "");
        name += (this.tableData.name.search("SPEED") !== -1 ? "Speed" : "");
        name += (this.tableData.name.search("CLASSIC") !== -1 ? "Classic" : "");

        return this.$t(name);
    }
    get dealerName() {
        const name = this.emceeData ? this.emceeData.nickname : "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    get dealerImage() {
        return this.emceeData ? this.gameInfo.emceeDatas[this.tableNumber].image : "";
    }

    get gameIcon() {
        return require(`@/assets/images/games/icons/img_${ this.codeName }.png`);
    }

    get codeName() {
        if (this.tableData.code === "dragontiger") return "dragonTiger";
        return this.tableData.code;
    }

    get emceeData() {
        return this.gameInfo.emceeDatas[this.tableNumber];
    }
}
</script>

<style lang="scss">
.table-card-emcee {
    position: relative;

    .v-card {
        padding: 1.5px 0;
        // border: 2px solid $c-main;
        border-radius: 7.5px;
        background-color: transparent;

        color: $c-main;

        .card-content {
            pointer-events: none;
            height: 194px;
            overflow: hidden;
        }
        .emcee-image {
            background-color: #000000;

            &.grayscale {
                border-radius: 7.5px;

                filter: grayscale(100%);
            }
        }

        .dealer-name {
            position: absolute;
            bottom: 5px;
            left: 10px;

            font-size: 16px;
            color: #ffffff;
            white-space: nowrap;
        }

        .offline-text {
            position: absolute;
            font-size: 22px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(219, 112, 147, .75);
            border-radius: 5px;
            color: #FFFFFF;
            width: 55%;
        }
        .game-icon {
            position: absolute;
            bottom: 30px;
            right: 10px;
        }
        .game-name {
            position: absolute;
            bottom: 7px;
            right: 10px;

            font-size: 12px;
            color: #ffffff;
            white-space: nowrap;
        }

        .total-people {
            position: absolute;
            top: 5px;
            left: 10px;
            width: 50%;
            height: 18px;

            text-align: left;

            .v-image {
                display: inline-table;
                margin-right: 7px;

                filter: brightness(0) invert(1);
            }
            span {
                display: inline-table;

                color: #ffffff;
                font-weight: bold;
                font-size: 14px;
                line-height: 12px;
            }
        }
    }
    .v-card.in-evnet {
        border: 3px solid #de10ec;
        background-color: rgba(#67256d, 0.5);
    }
    .table-flag {
        position: absolute;
        z-index: 1;
        top: -4px;
        left: 10px;
        width: 68px;
        height: 60px;

        .v-responsive__content {
            padding: 10px 4px 0 0;
        }
    }

    .enable-mask {
        position: absolute;
        top: 25%;
        left: 12.5%;
        width: 75%;
        height: 50%;

        padding-top: calc(12.5% - 20.5px);
        font-size: 18px;
        line-height: 26px;

        background: rgba(#000000, 0.6);
        border-radius: 5px;

        div {
            width: 100%;
        }
    }
}
</style>
