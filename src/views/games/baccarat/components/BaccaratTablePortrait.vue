<template>
    <v-img :class="['baccarat-table', 'portrait', isEmcee && 'is-emcee']" :src="require(`@/assets/images/games/tables/img_baccaratTable${ isEmcee ? '-mc' : '' }${ isSuper6 ? '-super6' : '' }${ userInfo.tableTheme }.png`)" width="100%" height="calc(40% - 120px)" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <!-- P Pair -->
                <v-flex :class="['bet-table-top bet-table-ppair', isSuper6 ? 'xs4' : 'xs6']">
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.PPair)">
                        <v-layout align-content-center row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large1']" xs12>{{ $t("tableAreas.ppair") }}</v-flex>
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
                </v-flex>

                <!-- Super 6 -->
                <v-flex v-if="isSuper6" class="bet-table-top" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Super6)">
                        <v-layout align-content-center row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large1']" xs12>{{ $t("tableAreas.super6") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:12</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Super6 }`, $parent.getTotalChipBy(betItems.Super6) || 'first-bet', $parent.getTotalChipTempBy(betItems.Super6) || 'hidden-chip', isSuper6 && 'super6']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Super6) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Super6) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Super6 }`, $parent.getTotalChipBy(betItems.Super6) || 'hidden-chip', isSuper6 && 'super6']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Super6) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Super6) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- B Pair -->
                <v-flex :class="['bet-table-top bet-table-bpair', isSuper6 ? 'xs4' : 'xs6']">
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.BPair)">
                        <v-layout align-content-center row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large1']" xs12>{{ $t("tableAreas.bpair") }}</v-flex>
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
                </v-flex>

                <!-- Player -->
                <v-flex class="bet-table-bottom bet-table-player" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Player)">
                        <v-layout :class="isEmcee ? 'align-content-center' : 'align-content-end'" row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2', isEmcee ? 'offset-xs2' : 'offset-xs1']" xs9>{{ $t("tableAreas.player") }}</v-flex>
                            <v-flex :class="['bet-odds', isEmcee ? 'offset-xs2' : 'offset-xs1']" xs9>1:1</v-flex>
                        </v-layout>

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.player) }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.player * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :class="[isSuper6 && 'super6', isSmallPhone && 'small-phone']" :color="gameInfo.beadColors[0]" size="36" :value="percentages.player || 0">
                            <span>{{ `${ (percentages.player || 0).toFixed() }%` }}</span>
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
                </v-flex>

                <!-- Tie -->
                <v-flex class="bet-table-bottom bet-table-tie" xs4-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tie)">
                        <v-layout :class="isEmcee ? 'align-content-center' : 'align-content-end'" row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2']" xs12>{{ $t("tableAreas.tie") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:8</v-flex>
                        </v-layout>

                        <v-progress-circular :class="[isSuper6 && 'super6', isSmallPhone && 'small-phone']" :color="gameInfo.beadColors[1]" size="36" :value="percentages.tie || 0">
                            <span>{{ `${ (percentages.tie || 0).toFixed() }%` }}</span>
                        </v-progress-circular>
                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Tie }`, $parent.getTotalChipBy(betItems.Tie) || 'first-bet', $parent.getTotalChipTempBy(betItems.Tie) || 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Tie) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Tie) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Tie }`, $parent.getTotalChipBy(betItems.Tie) || 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Tie) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Tie) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Banker -->
                <v-flex class="bet-table-bottom bet-table-banker" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Banker)">
                        <v-layout :class="isEmcee ? 'align-content-center' : 'align-content-end'" row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large2', isEmcee ? 'offset-xs1' : 'offset-xs2']" xs9>{{ $t("tableAreas.banker") }}</v-flex>
                            <v-flex :class="['bet-odds', isEmcee ? 'offset-xs1' : 'offset-xs2']" xs9>{{ isSuper6 ? "1:1" : "1:0.95" }}</v-flex>
                        </v-layout>

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.banker) }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.banker * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :class="[isSuper6 && 'super6', isSmallPhone && 'small-phone']" :color="gameInfo.beadColors[2]" size="36" :value="percentages.banker || 0">
                            <span>{{ `${ (percentages.banker || 0).toFixed() }%` }}</span>
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
                </v-flex>
            </v-layout>
            <v-img :class="['super6-switch', isSuper6 ? 'super6' : '', hasConfirmedBets ? 'disabled' : '']" :src="require(`@/assets/images/settings/img_super6-mc.png`)" width="40px" height="40px" @click="onToggleSuper6()">
                <div class="text-super">{{ $t("tableAreas.super6").toString().slice(0, -2) }}</div><div class="text-six">6</div>
            </v-img>
        </v-container>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class BaccaratTablePortrait extends Mixins(BettingTableMixin)
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
            if (this.tableState.isEmcee) {
                Utils.addStyles(".baccarat-table.portrait", {
                    bottom: `${ window.innerHeight - appHeight }px`,
                    height: `${ appHeight * 0.4 - 120 }px`
                });
                Utils.addStyles(".baccarat-table.portrait .super6-switch", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.4 - 120 + 10 }px` });
            }
            else {
                Utils.addStyles(".baccarat-table.portrait", {
                    bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.235 + 120 }px`,
                    height: `${ appHeight * 0.4 - 120 }px`
                });
                Utils.addStyles(".baccarat-table.portrait .super6-switch", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.2 + 105 }px` });
            }
        }
        else {
            Utils.addStyles(".baccarat-table.portrait", { bottom: "", height: "calc(40% - 120px)" });
            Utils.addStyles(".baccarat-table.portrait .super6-switch", { bottom: "" });
        }
    }

    onResize() {
        this.isSmallPhone = window.innerHeight < 560 && window.innerWidth < 330;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------

}
</script>

<style lang="scss">
.baccarat-table.portrait {
    position: fixed;
    overflow: visible;
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

        &.small-phone {
            transform: scale(0.5);
            top: -15%;
        }
    }

    .bet-table-top {
        margin-top: 2%;
        height: 30%;
        color: $c-main-light;

        &.bet-table-ppair {
            .bet-title, .bet-odds {
                color: $c-light-blue;
            }
        }
        &.bet-table-bpair {
            .bet-title, .bet-odds {
                color: $c-light-red;
            }
        }
    }
    .bet-table-bottom {
        position: relative;
        padding-bottom: 1.5% !important;
        margin-bottom: 5.5%;
        height: 52.5%;

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

        &.bet-table-player {
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
                right: 20%;
            }
        }
        &.bet-table-banker {
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
                left: 20%;
            }
        }
        &.bet-table-tie {
            .bet-title, .bet-odds {
                color: $c-light-green;
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

        text-shadow: 0px 1px 0.05px #333333;

        &.bet-title-large1 {
            font-size: 5.5vw;
        }
        &.bet-title-large2 {
            font-size: 9vw;
            line-height: 36px;
        }

        @include xxs-only {
            font-size: 14px;
            line-height: 14px;
        }
        @include sm-and-up {
            font-size: 22px;
            line-height: 26px;
        }
    }
    .bet-odds {
        font-size: 12px;
        line-height: 12px;
        
        text-shadow: 0px 1px 0.05px #333333;

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

        &.chip-done.chip-Player, &.chip-temp.first-bet.chip-Player { top: calc((100% - 36px) * 0.25      ); left : calc((100% - 36px) * 0.35 ); }
        &.chip-done.chip-Banker, &.chip-temp.first-bet.chip-Banker { top: calc((100% - 36px) * 0.25      ); right: calc((100% - 36px) * 0.35 ); }
        &.chip-done.chip-Tie   , &.chip-temp.first-bet.chip-Tie    { top: calc((100% - 36px) * 0.5       ); left : calc((100% - 36px) * 0.15 ); }
        &.chip-done.chip-PPair , &.chip-temp.first-bet.chip-PPair  { top: calc((100% - 36px) * 0.1   + 2%); left : calc((100% - 36px) * 0.275); }
        &.chip-done.chip-BPair , &.chip-temp.first-bet.chip-BPair  { top: calc((100% - 36px) * 0.1   + 2%); right: calc((100% - 36px) * 0.275); }
        &.chip-done.chip-Super6, &.chip-temp.first-bet.chip-Super6 { top: calc((100% - 36px) * 0.12  + 2%); left : calc((100% - 36px) * 0.435); }

        &.chip-temp.chip-Player { top: calc((100% - 36px) * 0.45      ); left : calc((100% - 36px) * 0.75 ); }
        &.chip-temp.chip-Banker { top: calc((100% - 36px) * 0.45      ); right: calc((100% - 36px) * 0.75 ); }
        &.chip-temp.chip-Tie    { top: calc((100% - 36px) * 0.55      ); right: calc((100% - 36px) * 0.15 ); }
        &.chip-temp.chip-PPair  { top: calc((100% - 36px) * 0.075 + 2%); left : calc((100% - 36px) * 0.4  ); }
        &.chip-temp.chip-BPair  { top: calc((100% - 36px) * 0.075 + 2%); right: calc((100% - 36px) * 0.4  ); }
        &.chip-temp.chip-Super6 { top: calc((100% - 36px) * 0.1   + 2%); left : calc((100% - 36px) * 0.565); }

        &.super6 {
            &.chip-done.chip-PPair, &.chip-temp.first-bet.chip-PPair { left : calc((100% - 36px) * 0.15 ); }
            &.chip-done.chip-BPair, &.chip-temp.first-bet.chip-BPair { right: calc((100% - 36px) * 0.15 ); }

            &.chip-temp.chip-PPair { left : calc((100% - 36px) * 0.275); }
            &.chip-temp.chip-BPair { right: calc((100% - 36px) * 0.275); }
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

        @include xxs-only {
            &.chip-PPair, &.chip-BPair {
                top: calc((100% - 36px) * 0.05);
            }
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

    .super6-switch {
        position: fixed;
        right: 5px;
        bottom: calc(20% + 90px + 15px);

        opacity: 0.8;

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
.baccarat-table.portrait.is-emcee {
    bottom: 0;

    .bet-title, .bet-odds {
        color: #dadada !important;
    }
    .total-money, .total-people, .v-progress-circular {
        display: none;
    }

    .super6-switch {
        right: 15px;
        bottom: calc(40% - 120px + 10px);
    }

    .bet-table-bottom {
        
    }
    .bet-title {
        font-size: 5.5vw;
        font-weight: bold;
        line-height: 20px;

        &.bet-title-large2 {
            font-size: 9vw;
            line-height: 36px;
        }
    }
}
</style>
