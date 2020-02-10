<template>
    <v-img class="threecards-table portrait" :src="require('@/assets/images/games/tables/img_threecardsTable.png')" width="100%" height="calc(40% - 120px)" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <!-- Dragon -->
                <v-flex class="bet-table-all bet-table-dragon" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Dragon)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2']" offset-xs3 xs9>{{ $t("tableAreas.dragon") }}</v-flex>
                            <v-flex class="bet-odds" offset-xs3 xs9>1:0.95</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-dragon" :src="require(`@/assets/images/games/areas/img_dragon.svg`)" :width="isSmallPhone ? '50%' :　'70%'" height="100%" :position="isSmallPhone ? '50% 10%' : '50% 30%'" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ bettings.tcdragon || 0 }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tcdragon * PLAYERS_MULTIPLE || 0 }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[0]" size="36" :value="percentages.tcdragon || 0">
                            <span>{{ `${ (percentages.tcdragon || 0).toFixed() }%` }}</span>
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
                </v-flex>

                <!-- Lucky -->
                <v-flex class="bet-table-all bet-table-lucky" xs4-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Lucky)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large1']" xs12>{{ $t("tableAreas.lucky") }}</v-flex>
                            <v-flex class="bet-text" xs12>{{ $t("tableAreas.luckyText") }}</v-flex>
                            <!-- <v-flex class="bet-odds" xs12>1:8</v-flex> -->
                        </v-layout>

                        <v-img class="area-icon area-lucky" :src="require(`@/assets/images/games/areas/img_lucky.png`)" width="25px" contain />

                        <v-progress-circular :color="gameInfo.beadColors[1]" size="36" :value="percentages.tclucky || 0">
                            <span>{{ `${ (percentages.tclucky || 0).toFixed() }%` }}</span>
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
                </v-flex>

                <!-- Phoenix -->
                <v-flex class="bet-table-all bet-table-phoenix" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Phoenix)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2']" xs9>{{ $t("tableAreas.phoenix") }}</v-flex>
                            <v-flex class="bet-odds" xs9>1:0.95</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-phoenix" :src="require(`@/assets/images/games/areas/img_phoenix.svg`)" :width="isSmallPhone ? '50%' :　'70%'" height="70%" :position="isSmallPhone ? '50% 10%' : '50% 30%'" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ bettings.tcphoenix || 0 }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tcphoenix * PLAYERS_MULTIPLE || 0 }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[2]" size="36" :value="percentages.tcphoenix || 0">
                            <span>{{ `${ (percentages.tcphoenix || 0).toFixed() }%` }}</span>
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
                </v-flex>
            </v-layout>
        </v-container>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class ThreeCardsTablePortrait extends Mixins(BettingTableMixin)
{
    isSmallPhone = false;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);

        this.onResize();
        window.addEventListener("resize", this.onResize);
    }

    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            Utils.addStyles(".threecards-table.portrait", {
                bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.235 + 120 }px`,
                height: `${ appHeight * 0.4 - 120 }px`
            });
            Utils.addStyles(".threecards-table.portrait .super6-switch", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.2 + 105 }px` });
        }
        else {
            Utils.addStyles(".threecards-table.portrait", { bottom: "", height: "calc(40% - 120px)" });
            Utils.addStyles(".threecards-table.portrait .super6-switch", { bottom: "" });
        }
    }

    onResize() {
        this.isSmallPhone = window.innerHeight < 560;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.threecards-table.portrait {
    position: fixed;
    left: 0;
    bottom: calc(23.5% + 120px);

    > .v-image__image {
        background-size: 100% 100%;
    }

    .v-progress-circular {
        position: absolute;
        transform: scale(0.9);
        top: 1.5%;

        background-color: rgba(#000000, 0.5);
        border-radius: 50%;
        font-size: 11px;

        @include sm-and-up {
            transform: scale(1.35);
            top: 10%;
        }

        // &.small-phone {
        //     transform: scale(0.5);
        //     top: -15%;
        // }
    }

    .bet-table-all {
        position: relative;
        margin-top: 2%;
        padding: 10% 0 10% 0 !important;
        height: 98%;

        .total-money {
            top: 5%;
        }
        .total-people {
            top: calc(5% + 16px);

            @include xxs-only {
                top: calc(5% + 12px);
            }
            @include sm-and-up {
                top: calc(5% + 18px);
            }
        }
        .total-money, .total-people {
            position: absolute;
            padding: 0 5px;
            width: 100%;

            font-size: 14px;
            line-height: 14px;

            font-weight: bold;
            text-shadow: 1px 1px #000000;
            white-space: nowrap;

            .v-icon {
                font-size: 14px !important;
                transform: translateY(-1px);
            }

            @include xxs-only {
                font-size: 11px;
                line-height: 11px;

                .v-icon {
                    font-size: 11px !important;
                    transform: translateY(0px);
                }
            }
            @include sm-and-up {
                font-size: 16px;
                line-height: 16px;

                .v-icon {
                    font-size: 16px !important;
                }
            }
        }

        &.bet-table-dragon {
            .total-money {
                left: 7.5%;
                text-align: left;
            }
            .total-people {
                left: 7.5%;
                text-align: left;
            }
            .bet-title, .bet-odds {
                color: $c-light-blue;
            }
            .v-progress-circular {
                right: 10%;
            }
        }
        &.bet-table-phoenix {
            .total-money {
                right: 8.5%;
                text-align: right;
            }
            .total-people {
                right: 8.5%;
                text-align: right;
            }
            .bet-title, .bet-odds {
                color: $c-light-red;
            }
            .v-progress-circular {
                left: 10%;
            }
        }
        &.bet-table-lucky {
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
    }

    .bet-title {
        font-size: 4vw;
        font-weight: bold;
        line-height: 20px;

        &.bet-title-large1 {
            font-size: 5.5vw;
            line-height: 28px;
        }
        &.bet-title-large2 {
            font-size: 9vw;
            line-height: 36px;
        }

        @include xxs-only {
            font-size: 14px;
            line-height: 12px;
        }
        @include sm-and-up {
            font-size: 20px;
            line-height: 24px;
        }
    }
    .bet-odds {
        font-size: 12px;
        line-height: 12px;

        @include xxs-only {
            font-size: 10px;
            line-height: 10px;
        }
        @include sm-and-up {
            font-size: 16px;
            line-height: 18px;
        }
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

        &.chip-done.chip-Dragon , &.chip-temp.first-bet.chip-Dragon  { top: calc((100% - 36px) * 0.3 ); left : calc((100% - 36px) * 0.4 ); }
        &.chip-done.chip-Phoenix, &.chip-temp.first-bet.chip-Phoenix { top: calc((100% - 36px) * 0.3 ); right: calc((100% - 36px) * 0.4 ); }
        &.chip-done.chip-Lucky  , &.chip-temp.first-bet.chip-Lucky   { top: calc((100% - 36px) * 0.35); left : calc((100% - 36px) * 0.15); }

        &.chip-temp.chip-Dragon  { top: calc((100% - 36px) * 0.4 ); left : calc((100% - 36px) * 0.8 ); }
        &.chip-temp.chip-Phoenix { top: calc((100% - 36px) * 0.4 ); right: calc((100% - 36px) * 0.8 ); }
        &.chip-temp.chip-Lucky   { top: calc((100% - 36px) * 0.45); left : calc((100% - 36px) * 0.85); }

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

        @include sm-and-up {
            height: 52px;
            width: 52px;

            .v-responsive__content span {
                margin-top: 15px;
                font-size: 18px;
            }
        }
    }

    .area-icon {
        position: absolute;
        opacity: 0.9;
        z-index: -1;

        &.area-dragon {
            left: 20%;
        }
        &.area-lucky {
            top: 42.5px;
            left: calc(50% - 12.5px);
        }
        &.area-phoenix {
            top: 5%;
            right: 20%;
        }
    }
}
</style>
