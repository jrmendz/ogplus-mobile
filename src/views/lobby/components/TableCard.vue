<template>
    <v-flex class="table-card" xs12 sm6 md4>
        <v-card flat @click="onEnter()">
            <v-layout class="card-header" row wrap justify-space-between caption>
                <v-flex xs8 text-xs-left pl-3>
                    <span>{{ modTableNumber }}</span><span class="point">{{ tableName }}</span>
                </v-flex>
                <v-flex xs4 text-xs-right pr-3 class="card-shoeno">
                    <span>{{ $t("shoeNo") }}: </span><span class="point">{{ tableData.shoeGame }}</span>
                </v-flex>
                <div class="total-money">
                    <v-icon color="#daa520" small>attach_money</v-icon>
                    <span>{{ formattedBalance(tableTotalMoney) }}</span>
                </div>
            </v-layout>
            <v-layout class="dealer-road" row wrap>
                <v-flex class="dealer-image" xs3>
                    <v-img class="dealer-bg" height="140px" :src="require('@/assets/images/games/img_dealerBg.png')" />
                    <v-img class="dealer" :src="dealerImage" height="130px" position="left bottom" />
                    <v-progress-circular class="table-time" :value="`${ (progress / maxTime * 100) }`" size="28" width="3" :color="timerColor">
                        <span ref="timer">{{ timer.toFixed(0) }}</span>
                    </v-progress-circular>
                </v-flex>
                <v-flex class="dealer-road-map" xs9>
                    <RoadMap :gameType="tableData.code" :tableNumber="tableNumber" disabled-theme />
                </v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex class="dealer-name" xs3 text-xs-center>
                    <span class="point">{{ dealerName }}</span>
                </v-flex>
                <v-flex xs5 text-xs-left pa-0>
                    <template v-if="isBaccarat || isDragonTiger">
                        <span v-for="(color, i) in gameInfo.beadColors" :key="color">
                            <!-- <v-icon :color="color">lens</v-icon> -->
                            <span class="title-text" :style="`color: ${ color }`">{{ $t(`tableAreas.${ beadNames[i] }`).substr(0, 1) }}</span>
                            <span class="bead-result">{{ gameResult[i] }}</span>
                        </span>
                        <!-- <v-img v-for="(name, i) in beadNames" :key="name" width="42.5px" height="16px" position="left center"
                               :src="require(`@/assets/images/games/road/bean${ $i18n.locale === 'cn' ? '-cn' : '' }/img_${ name }.png`)" contain>{{ gameResult[i] }}</v-img> -->
                    </template>
                </v-flex>
                <v-flex xs4 text-xs-right pr-3 class="btn-enter">
                    <v-btn class="button" color="#975e0e" @click.stop="onEnter()">{{ $t("enterGame") }}</v-btn>
                </v-flex>
                <div class="total-people">
                    <v-img :src="require('@/assets/images/settings/img_people.png')" width="18px" height="100%" contain />
                    <span>{{ players || 0 }}</span>
                </div>
            </v-layout>
        </v-card>
    </v-flex>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Howl, Howler } from "howler";
import { TweenLite, Back, Linear } from "gsap";

import { GameTypes, TableData, TableStatus } from "@/models/helper/types";
import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    RoadMap: () => import("@/views/games/common/components/RoadMap.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    timerElement!: HTMLSpanElement;

    progress = 0;
    timerColor = "rgba(0, 255, 0, 0.8)";

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;
    @Prop() readonly tableData!: TableData;

// #[Watch] ---------- + ---------- + ----------
    @Watch("tableData.status", { immediate: true }) onStatusChanged(val: TableStatus) {
        if (val === TableStatus.Betting || val.includes("squeeze")) this.startTimer();
    }

    @Watch("tableData.game.timer", { deep: true }) onTimerChanged(val: string, old: string) {
        if (+val <= 5) TweenLite.fromTo(this.timerElement, 0.5, { scale: 1.5 }, { scale: 1, ease: Back.easeOut });
        this.startTimer();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.timerElement = this.$refs.timer as HTMLSpanElement;
        this.timer = this.tableData.game.timer || 0;
    }
    destroyed() {
        TweenLite.killTweensOf(this);
        TweenLite.killTweensOf(this.startTimer);
    }

// #[Events] ---------- + ---------- + ----------
    onEnter() {
        this.mediaCtrl.spotFxSound.play("click");

        if (this.userInfo.isBalanceSufficient)
             this.tableState.enterTable({ tableNumber: this.tableNumber, gameType: this.tableData.code, isBidding: this.tableData.subcode === "bidding", isEmcee: this.$route.path.includes("emcee") });
        else this.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, this.$t("messages.lobby.minCredit", [this.userInfo.balanceRequirement]));
    }

// #[Methods] ---------- + ---------- + ----------
    startTimer() {
        // console.log(this.timer, this.tableData.tableNumber)
        TweenLite.killTweensOf(this);
        TweenLite.fromTo(this, this.timer, { timer: this.timer }, { timer: 0, ease: Linear.easeNone });
    }

    formattedBalance(balance: number) {
        return Utils.currency(balance, 3, 2);
    }

// #[Computed] ---------- + ---------- + ----------
    get isBaccarat()    { return this.tableData.code === GameTypes.Baccarat;    }
    get isDragonTiger() { return this.tableData.code === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.tableData.code === GameTypes.Moneywheel;  }
    get isRoulette()    { return this.tableData.code === GameTypes.Roulette;    }
    get isThreeCards()  { return this.tableData.code === GameTypes.ThreeCards;  }
    get isNiuniu()      { return this.tableData.code === GameTypes.Niuniu;      }

    get tableName() {
        let name: string = "";

             if (this.isBaccarat   ) name = "gameNames.baccarat";
        else if (this.isDragonTiger) name = "gameNames.dragonTiger";
        else if (this.isMoneywheel ) name = "gameNames.moneywheel";
        else if (this.isRoulette   ) name = "gameNames.roulette";
        else if (this.isThreeCards ) name = "gameNames.threecards";
        else if (this.isNiuniu     ) name = "gameNames.niuniu";

        name += (this.tableData.subcode === "bidding" ? "Bid" : "");
        name += (this.tableData.name.search("SPEED") !== -1 ? "Speed" : "");
        name += (this.tableData.name.search("CLASSIC") !== -1 ? "Classic" : "");

        return this.$t(name);
    }
    
    get dealerName() {
        const name = this.tableData.dealer ? this.tableData.dealer.name : "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    get dealerImage() {
        return this.gameInfo.dealerImageUrl(this.tableData.dealer.name.toLowerCase());
    }

    get gameResult() {
        const result = this.tableData.totalResult;
        const shoeGame = this.tableData.shoeGame;
        if (this.tableData.status === TableStatus.Shuffling || shoeGame.slice(shoeGame.indexOf("-") + 1) === "1") return [0, 0, 0];
        else return [result.player | result.dragon, result.tie, result.banker | result.tiger];
    }

    get maxTime() {
        return this.tableData.maxtime || this.tableData.maxTime;
    }

    get timer() {
        return this.tableData.game.timer ? +this.tableData.game.timer : 0;
    }
    set timer(value: number) {
        const ratio = value / this.maxTime;
        const red = (ratio <= 0.5) ? 255 : ((1 - ratio) * 2 * 255);
        const green = (ratio >= 0.5) ? 255 : (ratio * 2 * 255);

        this.progress = value;
        this.timerColor = `rgba(${ red }, ${ green }, 0, 0.8)`;
    }

    get players() {
        return this.tableData.playerCount;
    }

    get tableBets() {
        return this.gameInfo.tableBetResults[this.tableNumber] ? this.gameInfo.tableBetResults[this.tableNumber].totalUsersAndBettings : null;
    }

    get tableTotalMoney() {
        if (this.tableData.status === TableStatus.Shuffling) return 0;
        return this.tableBets ? Object.values(this.tableBets).map((a: any) => a[0].total_bets).reduce((a, b) => a + b) : 0;
    }

    get beadNames() {
        if (this.isBaccarat) return ["player", "tie", "banker"];
        else if (this.isDragonTiger) return ["dragon", "tie", "tiger"];

        return [];
    }

    get modTableNumber() {
        return this.$route.path.includes("emcee") ? this.tableNumber.replace(/[a-zA-Z]+/g, "MC") : this.tableNumber;
    }
}
</script>

<style lang="scss">
.table-card {
    .v-card {
        padding: 1.5px 0;
        border: 2px solid $c-main;
        border-radius: 7.5px;
        background-color: transparent;

        color: $c-main;

        .point {
            font-size: 110%;
            color: #ffffff;
            padding-left: 5px;
        }
        .card-shoeno{
            display: flex;
            flex-wrap: wrap;
            padding: 4px 8px 4px 0 !important;
            justify-content:flex-end;
            span{
                &:first-child{
                    flex: 0 1 50px;
                }
                &:last-child{
                    flex: 0 1 auto;
                    padding-left: 3px !important;
                }
            }
        }
        .total-people {
            position: absolute;
            bottom: 4px;
            right: 30%;
            width: 60px;
            height: 18px;

            text-align: right;

            .v-image {
                display: inline-table;
                margin-right: 3px;
            }
            span {
                display: inline-table;
                transform: translateY(2px);

                font-weight: bold;
                font-size: 14px;
                line-height: 12px;
            }
        }
        .total-money {
            position: absolute;
            top: 4px;
            right: 32%;
            max-width: 120px;
            width: auto;
            height: 20px;
            overflow: hidden;

            > i {
                display: block;
                float: left;
            }
            .v-image {
                display: block;
                margin-right: 4px;
            }
            span {
                display: inline-block;
                transform: translateY(1px);

                font-weight: bold;
                font-size: 110%;
                line-height: 15px;
                max-width: 100px;
                display: block;
                text-align: left !important;
                text-decoration: none;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                padding: 0;
            }
        }

        .dealer-name {
            height: 30px;
            margin-top: -2px;
            white-space: nowrap;
        }
        .dealer-road {
            margin: 0 !important;
            background-color: #000000;

            .flex {
                padding: 0;
                height: 140px;
            }
            .dealer-image {
                position: relative;
                height: 140px;

                .dealer {
                    position: absolute;
                    width: 100%;
                    bottom: 0;
                }
                .table-time {
                    position: absolute;
                    right: 5px;
                    top: 5px;

                    .v-progress-circular__underlay {
                        stroke: rgba(#000000, 0.4);
                    }
                    .v-progress-circular__overlay {
                        transition: none;
                    }

                    span {
                        position: absolute;
                        width: 25px;
                        top: -10px;
                        left: -12px;

                        font-weight: bold;
                    }
                }
            }
        }
        .btn-enter {
            padding: 2px 7px 0 0 !important;
        }
        .title-text {
            margin-right: 5px;
            font-weight: bold;
        }
        .bead-result {
            color: #ffffff;
            margin-right: 12.5px;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .v-icon {
                transform: translateY(3px) scale(0.5);
                margin-right: -2px;
            }
        }
        .button {
            margin: 0 0 2px 0;
            padding: 0 8px 0 8px;
            height: 20px;

            // background-image: linear-gradient(to bottom, #a67939, #845108);
            background-image: linear-gradient(to bottom, #feb645 0%,#d67c22 63%,#a67939 99%);
            border-radius: 5px;

            div.v-btn__content {
                color: #000000;
                font-weight: bold;
                font-size: 14px;
                text-transform: none;
            }
        }
    }
}
</style>
