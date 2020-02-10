<template>
    <v-container class="baccarat-table landscape-container" pa-0 ma-0>
        <v-container class="baccarat-table landscape-wrap" pa-0 ma-0>
            <v-img class="baccarat-table landscape" :src="require(`@/assets/images/games/tables/img_baccaratTable-land${ isSuper6 ? '-super6' : '' }.png`)" width="100%" height="100%" contain>
                <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
                    <!-- Player -->
                    <div class="bet-table-side bet-table-player">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Player)">
                            <v-layout align-end align-content-end row wrap pb-2 pl-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.player") }}</v-flex>
                                <v-flex class="bet-odds" xs12>1:1</v-flex>
                            </v-layout>

                            <div class="total-money"><v-icon color="#fff0d7" small>attach_money</v-icon><span>{{ formatAmount(bettings.player) }}</span></div>
                            <div class="total-people"><v-icon color="#fff0d7" small>person</v-icon><span>{{ players.player * PLAYERS_MULTIPLE }}</span></div>
                            <v-progress-circular :class="isSuper6 && 'super6'" :color="gameInfo.beadColors[0]" size="36" :value="percentages.player || 0">
                                {{ `${ (percentages.player || 0).toFixed() }%` }}
                            </v-progress-circular>

                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Player }`, $parent.getTotalChipBy(betItems.Player) || 'first-bet', $parent.getTotalChipTempBy(betItems.Player) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Player) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.Player) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Player }`, $parent.getTotalChipBy(betItems.Player) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Player) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.Player) }}</span>
                            </v-img>
                        </v-container>
                    </div>

                    <!-- P Pair -->
                    <div :class="['bet-table-ppair', isSuper6 && 'super6']">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.PPair)">
                            <v-layout align-end align-content-end row wrap pb-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.ppair") }}</v-flex>
                                <v-flex class="bet-odds" xs12>1:11</v-flex>
                            </v-layout>
                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.PPair }`, $parent.getTotalChipBy(betItems.PPair) || 'first-bet', $parent.getTotalChipTempBy(betItems.PPair) || 'hidden-chip', isSuper6 && 'super6']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.PPair) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.PPair) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.PPair }`, $parent.getTotalChipBy(betItems.PPair) || 'hidden-chip', isSuper6 && 'super6']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.PPair) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.PPair) }}</span>
                            </v-img>
                        </v-container>
                    </div>

                    <!-- Tie -->
                    <div class="bet-table-tie">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tie)">
                            <v-layout align-end align-content-end row wrap pb-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.tie") }}</v-flex>
                                <v-flex class="bet-odds" xs12>1:8</v-flex>
                            </v-layout>

                            <v-progress-circular :class="isSuper6 && 'super6'" :color="gameInfo.beadColors[1]" size="36" :value="percentages.tie || 0">
                                {{ `${ (percentages.tie || 0).toFixed() }%` }}
                            </v-progress-circular>
                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Tie }`, $parent.getTotalChipBy(betItems.Tie) || 'first-bet', $parent.getTotalChipTempBy(betItems.Tie) || 'hidden-chip', isSuper6 && 'super6']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Tie) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.Tie) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Tie }`, $parent.getTotalChipBy(betItems.Tie) || 'hidden-chip', isSuper6 && 'super6']"
                                :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Tie) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.Tie) }}</span>
                            </v-img>
                        </v-container>
                    </div>

                    <!-- B Pair -->
                    <div :class="['bet-table-bpair', isSuper6 && 'super6']">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.BPair)">
                            <v-layout align-end align-content-end row wrap pb-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.bpair") }}</v-flex>
                                <v-flex class="bet-odds" xs12>1:11</v-flex>
                            </v-layout>
                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.BPair }`, $parent.getTotalChipBy(betItems.BPair) || 'first-bet', $parent.getTotalChipTempBy(betItems.BPair) || 'hidden-chip', isSuper6 && 'super6']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.BPair) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.BPair) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.BPair }`, $parent.getTotalChipBy(betItems.BPair) || 'hidden-chip', isSuper6 && 'super6']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.BPair) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.BPair) }}</span>
                            </v-img>
                        </v-container>
                    </div>

                    <!-- Banker -->
                    <div class="bet-table-side bet-table-banker">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Banker)">
                            <v-layout align-end align-content-end row wrap pb-2 pr-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.banker") }}</v-flex>
                                <v-flex class="bet-odds" xs12>{{ isSuper6 ? "1:1" : "1:0.95" }}</v-flex>
                            </v-layout>

                            <div class="total-money text-xxs-right"><v-icon color="#fff0d7" small>attach_money</v-icon><span>{{ formatAmount(bettings.banker) }}</span></div>
                            <div class="total-people text-xxs-right"><v-icon color="#fff0d7" small>person</v-icon><span>{{ players.banker * PLAYERS_MULTIPLE }}</span></div>
                            <v-progress-circular :class="isSuper6 && 'super6'" :color="gameInfo.beadColors[2]" size="36" :value="percentages.banker || 0">
                                {{ `${ (percentages.banker || 0).toFixed() }%` }}
                            </v-progress-circular>

                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Banker }`, $parent.getTotalChipBy(betItems.Banker) || 'first-bet', $parent.getTotalChipTempBy(betItems.Banker) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Banker) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.Banker) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Banker }`, $parent.getTotalChipBy(betItems.Banker) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Banker) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.Banker) }}</span>
                            </v-img>
                        </v-container>
                    </div>

                    <!-- Super 6 -->
                    <div v-if="isSuper6" class="bet-table-super6">
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Super6)">
                            <v-layout align-end align-content-end row wrap pb-2>
                                <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.super6") }}</v-flex>
                                <v-flex class="bet-odds" xs12>1:12</v-flex>
                            </v-layout>

                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Super6 }`, $parent.getTotalChipBy(betItems.Super6) || 'first-bet', $parent.getTotalChipTempBy(betItems.Super6) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Super6) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(betItems.Super6) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Super6 }`, $parent.getTotalChipBy(betItems.Super6) || 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Super6) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(betItems.Super6) }}</span>
                            </v-img>
                        </v-container>
                    </div>
                </v-container>
            </v-img>
        </v-container>
        <v-img :class="['super6-switch', isSuper6 ? 'super6' : '', hasConfirmedBets ? 'disabled' : '']" :src="require(`@/assets/images/settings/img_super6-mc.png`)" width="40px" height="40px" @click="onToggleSuper6()">
            <div class="text-super">{{ $t("tableAreas.super6").toString().slice(0, -2) }}</div><div class="text-six">6</div>
        </v-img>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class BaccaratTableLandscape extends Mixins(BettingTableMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            Utils.addStyles(".baccarat-table.landscape-wrap", { bottom: `${ (window.innerHeight - appHeight) + 30 }px` });
            Utils.addStyles(".baccarat-table.landscape-container .super6-switch", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.225 }px` });
        }
        else {
            Utils.addStyles(".baccarat-table.landscape-wrap", { bottom: "" });
            Utils.addStyles(".baccarat-table.landscape-container .super6-switch", { bottom: "" });
        }
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    
    
}
</script>

<style lang="scss">
.baccarat-table.landscape-container {
    .super6-switch {
        position: fixed;
        right: 110px;
        bottom: 22.5%;

        opacity: 0.8;

        @include ios-right("", "110px");

        .text-super, .text-six {
            color: $c-main-light;
        }
        .text-super {
            margin-top: 4px;
            letter-spacing: -2px;

            font-size: 14px;
            line-height: 16px;
        }
        .text-six {
            margin-top: -6px;

            font-size: 20px;
            line-height: 24px;
        }
            
        &::before {
            content: "";

            position: absolute;
            width: 40px;
            height: 40px;

            border-radius: 5px;
        }

        &.super6 {
            opacity: 1;
            
            &::before {
                background-color: rgba($c-main-light, 0.2);
            }

            .text-super, .text-six {
                color: $c-main;
                font-weight: bold;
                text-shadow: 1px 1px #000000;
            }
        }
        &.disabled {
            &::before {
                background-color: rgba(#000000, 0.3);
            }

            .text-super, .text-six {
                color: #dadada;
            }

            &.super6 {
                &::before {
                    background-color: rgba($c-bead-red, 0.3);
                }

                .text-super, .text-six {
                    color: $c-bead-red;
                }
            }
        }
    }
}
.baccarat-table.landscape-wrap {
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
.baccarat-table.landscape {
    position: absolute;

    transform: rotateX(50deg) translateY(10px);
    transform-origin: bottom;

    color: $c-main-light;

    > .v-image__image {
        background-size: 100% 100%;
    }

    .v-progress-circular {
        position: absolute;
        top: 5px;

        background-color: rgba(#000000, 0.5);
        border-radius: 50%;
        font-size: 11px;
    }

    .bet-table-side {
        position: absolute;
        bottom: 12%;
        width: 32%;
        height: 50%;

        .total-money, .total-people {
            position: absolute;
            top: 5%;
            width: 50%;

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

        &.bet-table-player {
            transform: rotate(6deg);
            left: 4%;

            .total-money {
                left: 1%;
                text-align: left;
            }
            .total-people {
                left: 1%;
                text-align: left;
            }
            .bet-title, .bet-odds {
                color: $c-light-blue;
            }
            .v-progress-circular {
                right: 7.5px;
            }
        }
        &.bet-table-banker {
            transform: rotate(-6deg);
            right: 4%;

            .total-money {
                right: 1.5%;
                text-align: right;
            }
            .total-people {
                right: 1.5%;
                text-align: right;
            }
            .bet-title, .bet-odds {
                color: $c-light-red;
            }
            .v-progress-circular {
                left: 7.5px;
            }
        }
    }
    .bet-table-tie {
        position: absolute;
        left: 36%;
        bottom: 3%;
        width: 28%;
        height: 50%;

        .bet-title, .bet-odds {
            color: $c-light-green;
        }
        .v-progress-circular {
            top: 5px;
            right: 7.5px;
        }
    }
    .bet-table-ppair {
        position: absolute;
        transform: rotate(4deg);
        width: 40%;
        height: 50%;
        left: 10%;
        top: -10%;

        .bet-title, .bet-odds {
            color: $c-light-blue;
        }

        &.super6 {
            transform: rotate(6deg);
            width: 26%;
            top: -11%;
        }
    }
    .bet-table-bpair {
        position: absolute;
        transform: rotate(-4deg);
        width: 40%;
        height: 50%;
        right: 10%;
        top: -10%;

        .bet-title, .bet-odds {
            color: $c-light-red;
        }

        &.super6 {
            transform: rotate(-6deg);
            width: 26%;
            top: -11%;
        }
    }
    .bet-table-super6 {
        position: absolute;
        width: 28%;
        height: 50%;
        left: 36%;
        top: -3%;
    }

    .bet-title {
        font-size: 5vh;
        font-weight: bold;
        line-height: 20px;

        &.bet-title-large {
            font-size: 6.5vh;
        }
    }
    .bet-odds {
        font-size: 12px;
        line-height: 12px;
    }

    .user-bet-chip {
        position: absolute;
        z-index: 1;
        bottom: 7.5%;

        height: 36px;
        width: 36px;

        pointer-events: none;
        overflow: visible;

        &.chip-done.hidden-chip { display: none; }
        &.chip-temp.hidden-chip { display: none; }

        &.chip-done.chip-Player, &.chip-temp.first-bet.chip-Player { left : calc((100% - 36px) * 0.25); bottom:  7.5%; }
        &.chip-done.chip-Banker, &.chip-temp.first-bet.chip-Banker { right: calc((100% - 36px) * 0.25); bottom:  7.5%; }
        &.chip-done.chip-Tie   , &.chip-temp.first-bet.chip-Tie    { left : calc((100% - 36px) * 0.2 ); bottom:  7.5%; }
        &.chip-done.chip-PPair , &.chip-temp.first-bet.chip-PPair  { right: calc((100% - 36px) * 0.15); bottom:  7.5%; }
        &.chip-done.chip-BPair , &.chip-temp.first-bet.chip-BPair  { left : calc((100% - 36px) * 0.15); bottom:  7.5%; }
        &.chip-done.chip-Super6, &.chip-temp.first-bet.chip-Super6 { right: calc((100% - 36px) * 0.45); bottom: 22.5%; }

        &.chip-temp.chip-Player { left : calc((100% - 36px) * 0.65 ); bottom: 22.5%; }
        &.chip-temp.chip-Banker { right: calc((100% - 36px) * 0.65 ); bottom: 22.5%; }
        &.chip-temp.chip-Tie    { left : calc((100% - 36px) * 0.65 ); bottom: 22.5%; }
        &.chip-temp.chip-PPair  { right: calc((100% - 36px) * 0.35 ); bottom: 17.5%; }
        &.chip-temp.chip-BPair  { left : calc((100% - 36px) * 0.35 ); bottom: 17.5%; }
        &.chip-temp.chip-Super6 { right: calc((100% - 36px) * 0.135); bottom: 12.5%; }

        &.super6 {
            &.chip-done.chip-PPair, &.chip-temp.first-bet.chip-PPair { right: calc((100% - 36px) * 0.15 ); bottom: 12.5%; }
            &.chip-done.chip-BPair, &.chip-temp.first-bet.chip-BPair { left : calc((100% - 36px) * 0.15 ); bottom: 12.5%; }

            &.chip-temp.chip-PPair { right: calc((100% - 36px) * 0.55 ); bottom: 22.5%; }
            &.chip-temp.chip-BPair { left : calc((100% - 36px) * 0.55 ); bottom: 22.5%; }
        }

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
}
</style>
