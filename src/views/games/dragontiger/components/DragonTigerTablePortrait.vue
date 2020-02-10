<template>
    <v-img class="dragontiger-table portrait" :src="require(`@/assets/images/games/tables/img_dragontigerTable${ userInfo.tableTheme }.png`)" width="100%" height="calc(40% - 120px)" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <!-- Dragon -->
                <v-flex class="bet-table-all bet-table-dragon" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Dragon)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" offset-xs1 xs9>{{ $t("tableAreas.dragon") }}</v-flex>
                            <v-flex class="bet-odds" offset-xs1 xs9>1:1</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-dragon" :src="require(`@/assets/images/games/areas/img_dragon.svg`)" :width="isSmallPhone ? '50%' :　'70%'" height="100%" :position="isSmallPhone ? '50% 10%' : '50% 30%'" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.dragon) }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.dragon * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[0]" size="36" :value="percentages.dragon || 0">
                            <span>{{ `${ (percentages.dragon || 0).toFixed() }%` }}</span>
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

                <!-- Tie -->
                <v-flex class="bet-table-all bet-table-tie" xs4-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tie)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.tie") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:8</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-tie" :src="require(`@/assets/images/games/areas/img_tie.svg`)" width="90%" :height="isSmallPhone ? '60%' : '100%'" position="50% 35%" contain />

                        <v-progress-circular :color="gameInfo.beadColors[1]" size="36" :value="percentages.tie || 0">
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

                <!-- Tiger -->
                <v-flex class="bet-table-all bet-table-tiger" xs6-16>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tiger)">
                        <v-layout align-content-end row wrap>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" offset-xs2 xs9>{{ $t("tableAreas.tiger") }}</v-flex>
                            <v-flex class="bet-odds" offset-xs2 xs9>1:1</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-tiger" :src="require(`@/assets/images/games/areas/img_tiger.svg`)" :width="isSmallPhone ? '50%' :　'70%'" height="100%" :position="isSmallPhone ? '50% 10%' : '50% 30%'" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.tiger) }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tiger * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[2]" size="36" :value="percentages.tiger || 0">
                            <span>{{ `${ (percentages.tiger || 0).toFixed() }%` }}</span>
                        </v-progress-circular>

                        <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ betItems.Tiger }`, $parent.getTotalChipBy(betItems.Tiger) || 'first-bet', $parent.getTotalChipTempBy(betItems.Tiger) || 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(betItems.Tiger) }.png`)" contain>
                            <span>{{ $parent.formatChipTempBy(betItems.Tiger) }}</span>
                        </v-img>
                        <v-img :class="['user-bet-chip', 'chip-done', `chip-${ betItems.Tiger }`, $parent.getTotalChipBy(betItems.Tiger) || 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(betItems.Tiger) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(betItems.Tiger) }}</span>
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
export default class DragonTigerTablePortrait extends Mixins(BettingTableMixin)
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
            Utils.addStyles(".dragontiger-table.portrait", {
                bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.235 + 120 }px`,
                height: `${ appHeight * 0.4 - 120 }px`
            });
        }
        else Utils.addStyles(".dragontiger-table.portrait", { bottom: "", height: "calc(40% - 120px)" });
    }

    onResize() {
        this.isSmallPhone = this.siteState.appHeight < 560 && window.innerWidth < 330;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------

}
</script>

<style lang="scss">
.dragontiger-table.portrait {
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
        &.bet-table-tiger {
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

        &.bet-title-large {
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

        &.chip-done.chip-Dragon, &.chip-temp.first-bet.chip-Dragon { top: calc((100% - 36px) * 0.3 ); left : calc((100% - 36px) * 0.4 ); }
        &.chip-done.chip-Tiger , &.chip-temp.first-bet.chip-Tiger  { top: calc((100% - 36px) * 0.3 ); right: calc((100% - 36px) * 0.4 ); }
        &.chip-done.chip-Tie   , &.chip-temp.first-bet.chip-Tie    { top: calc((100% - 36px) * 0.35); left : calc((100% - 36px) * 0.15); }

        &.chip-temp.chip-Dragon { top: calc((100% - 36px) * 0.4 ); left : calc((100% - 36px) * 0.8 ); }
        &.chip-temp.chip-Tiger  { top: calc((100% - 36px) * 0.4 ); right: calc((100% - 36px) * 0.8 ); }
        &.chip-temp.chip-Tie    { top: calc((100% - 36px) * 0.45); left : calc((100% - 36px) * 0.85); }

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
            left: 12.5%;
        }
        &.area-tie {
            left: 5%;
        }
        &.area-tiger {
            right: 12.5%;
        }
    }
}
</style>
