<template>
    <v-container class="threecards-table landscape-wrap" pa-0 ma-0>
        <v-img class="threecards-table landscape" :src="require('@/assets/images/games/tables/img_threecardsTable-land.png')" width="100%" height="100%" contain>
            <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
                <!-- Dragon -->
                <div class="bet-table-all bet-table-dragon" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Dragon)">
                        <v-layout align-end align-content-end row wrap pb-2 pl-3>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2']" xs12>{{ $t("tableAreas.dragon") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:0.95</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-dragon" :src="require(`@/assets/images/games/areas/img_dragon.svg`)" width="100%" height="75%" position="55% 50%" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ bettings.tcdragon || 0 }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tcdragon * PLAYERS_MULTIPLE || 0 }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[0]" size="36" :value="percentages.tcdragon || 0">
                            {{ `${ (percentages.tcdragon || 0).toFixed() }%` }}
                        </v-progress-circular>

                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Dragon }`, $parent.getTotalChipBy(betItems.Dragon) || 'first-bet', $parent.getTotalChipTempBy(betItems.Dragon) || 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Dragon) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Dragon) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Dragon }`, $parent.getTotalChipBy(betItems.Dragon) || 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Dragon) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Dragon) }}</span>
                        </v-img>
                    </v-container>
                </div>

                <!-- Lucky -->
                <div class="bet-table-all bet-table-lucky" xs4>
                    <v-container class="bet-table-lucky" fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Lucky)">
                        <v-layout align-end align-content-end row wrap pb-2>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large1']" xs12>{{ $t("tableAreas.lucky") }}</v-flex>
                            <v-flex class="bet-text" xs12>{{ $t("tableAreas.luckyText") }}</v-flex>
                            <!-- <v-flex class="bet-odds" xs12>1:8</v-flex> -->
                        </v-layout>

                        <v-img class="area-icon area-lucky" :src="require(`@/assets/images/games/areas/img_lucky.png`)"  width="25px" contain />

                        <v-progress-circular :color="gameInfo.beadColors[1]" size="36" :value="percentages.tclucky || 0">
                            {{ `${ (percentages.tclucky || 0).toFixed() }%` }}
                        </v-progress-circular>
                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Lucky }`, $parent.getTotalChipBy(betItems.Lucky) || 'first-bet', $parent.getTotalChipTempBy(betItems.Lucky) || 'hidden-chip']"
                            :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Lucky) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Lucky) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Lucky }`, $parent.getTotalChipBy(betItems.Lucky) || 'hidden-chip']"
                            :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Lucky) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Lucky) }}</span>
                        </v-img>
                    </v-container>
                </div>

                <!-- Phoenix -->
                <div class="bet-table-all bet-table-phoenix" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Phoenix)">
                        <v-layout align-end align-content-end row wrap pb-2 pr-3>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2']" xs12>{{ $t("tableAreas.phoenix") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:0.95</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-phoenix" :src="require(`@/assets/images/games/areas/img_phoenix.svg`)" width="100%" height="75%" position="45% 50%" contain />

                        <div class="total-money text-xxs-right"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ bettings.tcphoenix || 0 }}</span></div>
                        <div class="total-people text-xxs-right"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tcphoenix * PLAYERS_MULTIPLE || 0 }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[2]" size="36" :value="percentages.tcphoenix || 0">
                            {{ `${ (percentages.tcphoenix || 0).toFixed() }%` }}
                        </v-progress-circular>

                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Phoenix }`, $parent.getTotalChipBy(betItems.Phoenix) || 'first-bet', $parent.getTotalChipTempBy(betItems.Phoenix) || 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Phoenix) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Phoenix) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Phoenix }`, $parent.getTotalChipBy(betItems.Phoenix) || 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Phoenix) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Phoenix) }}</span>
                        </v-img>
                    </v-container>
                </div>
            </v-container>
        </v-img>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class ThreeCardsTableLandscape extends Mixins(BettingTableMixin)
{
    

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus)
             Utils.addStyles(".threecards-table.landscape-wrap", { bottom: `${ (window.innerHeight - appHeight) + 30 }px` });
        else Utils.addStyles(".threecards-table.landscape-wrap", { bottom: "" });
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.threecards-table.landscape-wrap {
    position: fixed;
    left: 100px;
    bottom: 30px;

    height: calc(35% - 10px);
    width: calc(100% - 200px);

    perspective: 450px;

    @include md-and-up {
        height: 27.5% !important;
    }

    @include ios-left("", "100px");
    @include ios-width("", "100% - 200px");
}
.threecards-table.landscape {
    position: absolute;

    transform: rotateX(50deg) translateY(10px);
    transform-origin: bottom;

    color: $c-main-light;

    > .v-image__image {
        background-size: 100% 100%;
    }

    .v-progress-circular {
        position: absolute;
        top: 0;

        background-color: rgba(#000000, 0.5);
        border-radius: 50%;
        font-size: 11px;
    }

    .bet-table-all {
        position: absolute;
        bottom: 0;

        .total-money, .total-people {
            position: absolute;
            top: 15%;
            width: 20%;

            font-size: 14px;
            line-height: 14px;

            font-weight: bold;
            text-shadow: 1px 1px #000000;
            white-space: nowrap;

            .v-icon {
                font-size: 14px !important;
                transform: translateY(-1px);
            }
        }
        .total-people {
            top: 30%;
        }

        &.bet-table-dragon {
            transform: rotate(6deg);
            left: 2%;
            bottom: 10%;
            width: 34%;
            height: 90%;

            .total-money {
                left: 5%;
                text-align: left;
            }
            .total-people {
                left: 5%;
                text-align: left;
            }
            .bet-title, .bet-odds {
                color: $c-light-blue;
            }
            .v-progress-circular {
                right: calc((100% - 36px) * 0.1);
            }
        }
        &.bet-table-lucky {
            left: 36%;
            width: 28%;
            height: 90%;
                
            .bet-title, .bet-odds {
                color: $c-light-green;
            }
            .bet-text {
                font-size: 65%;
                letter-spacing: -0.5px;
                line-height: 120%;
                color: rgba(#ffffff, 0.65);
            }
            .v-progress-circular {
                left: calc((100% - 36px) * 0.5);
            }
        }
        &.bet-table-phoenix {
            transform: rotate(-6deg);
            right: 2%;
            bottom: 10%;
            width: 34%;
            height: 90%;

            .total-money {
                right: 5.5%;
                text-align: right;
            }
            .total-people {
                right: 5.5%;
                text-align: right;
            }
            .bet-title, .bet-odds {
                color: $c-light-red;
            }
            .v-progress-circular {
                left: calc((100% - 36px) * 0.1);
            }
        }
    }

    .bet-title {
        font-size: 5vh;
        font-weight: bold;
        line-height: 20px;

        &.bet-title-large1 {
            font-size: 6.5vh;
            line-height: 28px;
        }
        &.bet-title-large2 {
            font-size: 7.5vh;
            line-height: 36px;
        }
    }
    .bet-odds {
        font-size: 12px;
        line-height: 12px;
    }

    .user-bet-chip {
        position: absolute;
        z-index: 1;

        height: 36px;
        width: 36px;

        pointer-events: none;
        overflow: visible;

        &.chip-done.hidden-chip { display: none; }
        &.chip-temp.hidden-chip { display: none; }

        &.chip-done.chip-Dragon , &.chip-temp.first-bet.chip-Dragon  { top: 20%; left : calc((100% - 36px) * 0.5); }
        &.chip-done.chip-Phoenix, &.chip-temp.first-bet.chip-Phoenix { top: 20%; right: calc((100% - 36px) * 0.5); }
        &.chip-done.chip-Lucky  , &.chip-temp.first-bet.chip-Lucky   { top: 25%; left : calc((100% - 36px) * 0.8); }

        &.chip-temp.chip-Dragon  { top: 40%; left : calc((100% - 36px) * 0.75); }
        &.chip-temp.chip-Phoenix { top: 40%; right: calc((100% - 36px) * 0.75); }
        &.chip-temp.chip-Lucky   { top: 35%; left : calc((100% - 36px) * 0.25); }

        .v-responsive__content span {
            display: inline-block;
            margin-top: 8px;
            padding: 0 5px;

            color: #000000;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            white-space: nowrap;
            letter-spacing: -1px;
        }
    }

    .area-icon {
        position: absolute;
        opacity: 0.8;
        z-index: -1;
        left: 0;

        &.area-dragon {
            top: 15%;
        }
        &.area-lucky {
            top: 5%;
            left: unset;
            right: 5%;
        }
        &.area-phoenix {
            top: 15%;
        }
    }
}
</style>
