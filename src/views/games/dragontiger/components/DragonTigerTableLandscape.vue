<template>
    <v-container class="dragontiger-table landscape-wrap" pa-0 ma-0>
        <v-img class="dragontiger-table landscape" :src="require('@/assets/images/games/tables/img_dragontigerTable-land.png')" width="100%" height="100%" contain>
            <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
                <!-- Dragon -->
                <div class="bet-table-all bet-table-dragon" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Dragon)">
                        <v-layout align-end align-content-end row wrap pb-2 pl-3>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.dragon") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:1</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-dragon" :src="require(`@/assets/images/games/areas/img_dragon.svg`)" width="100%" height="75%" position="55% 50%" contain />

                        <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.dragon) }}</span></div>
                        <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.dragon * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[0]" size="36" :value="percentages.dragon || 0">
                            {{ `${ (percentages.dragon || 0).toFixed() }%` }}
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

                <!-- Tie -->
                <div class="bet-table-all bet-table-tie" xs4>
                    <v-container class="bet-table-tie" fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tie)">
                        <v-layout align-end align-content-end row wrap pb-2>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.tie") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:8</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-tie" :src="require(`@/assets/images/games/areas/img_tie.svg`)" width="100%" height="65%" position="50% 50%" contain />

                        <v-progress-circular :color="gameInfo.beadColors[1]" size="36" :value="percentages.tie || 0">
                            {{ `${ (percentages.tie || 0).toFixed() }%` }}
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
                </div>

                <!-- Tiger -->
                <div class="bet-table-all bet-table-tiger" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tiger)">
                        <v-layout align-end align-content-end row wrap pb-2 pr-3>
                            <v-flex :class="['bet-title', ($i18n.locale === 'cn') && 'bet-title-large']" xs12>{{ $t("tableAreas.tiger") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:1</v-flex>
                        </v-layout>

                        <v-img class="area-icon area-tiger" :src="require(`@/assets/images/games/areas/img_tiger.svg`)" width="100%" height="75%" position="45% 50%" contain />

                        <div class="total-money text-xxs-right"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings.tiger) }}</span></div>
                        <div class="total-people text-xxs-right"><v-icon color="#ffffff" small>person</v-icon><span>{{ players.tiger * PLAYERS_MULTIPLE }}</span></div>
                        <v-progress-circular :color="gameInfo.beadColors[2]" size="36" :value="percentages.tiger || 0">
                            {{ `${ (percentages.tiger || 0).toFixed() }%` }}
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
export default class DragonTigerTableLandscape extends Mixins(BettingTableMixin)
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
             Utils.addStyles(".dragontiger-table.landscape-wrap", { bottom: `${ (window.innerHeight - appHeight) + 30 }px` });
        else Utils.addStyles(".dragontiger-table.landscape-wrap", { bottom: "" });
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.dragontiger-table.landscape-wrap {
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
.dragontiger-table.landscape {
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
        &.bet-table-tie {
            left: 36%;
            width: 28%;
            height: 90%;
                
            .bet-title, .bet-odds {
                color: $c-light-green;
            }
            .v-progress-circular {
                left: calc((100% - 36px) * 0.5);
            }
        }
        &.bet-table-tiger {
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

        &.bet-title-large {
            font-size: 7.5vh;
            line-height: 32px;
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

        &.chip-done.chip-Dragon, &.chip-temp.first-bet.chip-Dragon { top: 20%; left : calc((100% - 36px) * 0.5); }
        &.chip-done.chip-Tiger , &.chip-temp.first-bet.chip-Tiger  { top: 20%; right: calc((100% - 36px) * 0.5); }
        &.chip-done.chip-Tie   , &.chip-temp.first-bet.chip-Tie    { top: 25%; left : calc((100% - 36px) * 0.8); }

        &.chip-temp.chip-Dragon { top: 40%; left : calc((100% - 36px) * 0.75); }
        &.chip-temp.chip-Tiger  { top: 40%; right: calc((100% - 36px) * 0.75); }
        &.chip-temp.chip-Tie    { top: 35%; left : calc((100% - 36px) * 0.25); }

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
        &.area-tie {
            top: 20%;
        }
        &.area-tiger {
            top: 15%;
        }
    }
}
</style>
