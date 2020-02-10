<template>
    <v-container class="moneywheel-table landscape-wrap" pa-0 ma-0>
        <v-img class="moneywheel-table landscape" :src="require('@/assets/images/games/tables/img_moneywheelTable-land.png')" width="100%" height="100%" contain>
            <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
                <v-layout fill-height row wrap>
                    <v-flex v-for="item in betItems" :key="item" :class="`bet-table-${ ((num = +item.substr(1)) <= 5) ? 'top' : 'bottom' }`" xs4>
                        <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(item)">
                            <v-layout align-end align-content-end justify-center row wrap>
                                <v-flex class="bet-title" xs9>
                                    <v-img v-if="num === 40" :src="require(`@/assets/images/games/tables/img_jackpot.png`)" height="48px" contain />
                                    <span v-else>{{ num }}</span>
                                </v-flex>
                            </v-layout>

                            <div class="bet-ratio">{{ formatRatio(num) }}</div>
                            <div class="total-money"><v-icon color="#ffffff" small>attach_money</v-icon><span>{{ formatAmount(bettings[`mw${ (num === 40) ? "OG" : num }`]) }}</span></div>
                            <div class="total-people"><v-icon color="#ffffff" small>person</v-icon><span>{{ players[`mw${ (num === 40) ? "OG" : num }`] }}</span></div>

                            <v-img :class="['user-bet-chip', 'chip-temp', `chip-${ item }`, $parent.getTotalChipBy(item) || 'first-bet', $parent.getTotalChipTempBy(item) || 'hidden-chip']"
                                   :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(item) }.png`)" contain>
                                <span>{{ $parent.formatChipTempBy(item) }}</span>
                            </v-img>
                            <v-img :class="['user-bet-chip', 'chip-done', `chip-${ item }`, $parent.getTotalChipBy(item) || 'hidden-chip']"
                                   :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSets(item) }.png`)" contain>
                                <span>{{ $parent.formatChipBy(item) }}</span>
                            </v-img>
                        </v-container>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-img>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events, { MoneywheelItems } from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class MoneywheelTableLandscape extends Mixins(BettingTableMixin)
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
             Utils.addStyles(".moneywheel-table.landscape-wrap", { bottom: `${ (window.innerHeight - appHeight) + 30 }px` });
        else Utils.addStyles(".moneywheel-table.landscape-wrap", { bottom: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    formatRatio(ratio: number) {
        return Utils.format(this.$t("tableAreas.ratio").toString(), ratio);
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.moneywheel-table.landscape-wrap {
    position: fixed;
    bottom: 30px;
    height: 125px;

    // perspective: 500px;

    @include md-and-up {
        height: 27.5% !important;
    }

    @include ios-right("", "15%");
    @include ios-width("", "70%");
}
.moneywheel-table.landscape {
    position: absolute;

    // transform: rotateX(45deg);
    // transform-origin: bottom;

    > .v-image__image {
        background-size: 100% 100%;
    }

    .bet-table-layout {
        padding: 0 2%;
    }

    .bet-table-top, .bet-table-bottom {
        position: relative;
        padding-bottom: 1.5% !important;
        height: 48.5%;
    }
    .bet-table-top {
        margin-top: 1%;
    }

    .total-money, .total-people, .bet-ratio {
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

        @include xxs-land-only {
            font-size: 11px;
            line-height: 11px;

            .v-icon {
                font-size: 11px !important;
                transform: translateY(0px);
            }
        }
        @include md-and-up {
            font-size: 16px;
            line-height: 16px;

            .v-icon {
                font-size: 16px !important;
            }
        }
    }
    .bet-ratio {
        top: 5%;
        right: 7.5px;
        text-align: right;
    }
    .total-money {
        top: 5%;
        left: 7.5px;
        text-align: left;
    }
    .total-people {
        top: calc(5% + 16px);
        left: 7.5px;
        text-align: left;

        .v-icon {
            transform: translate(-1px, -1px) !important;
        }

        @include xxs-land-only {
            top: calc(5% + 12px);
        }
        @include md-and-up {
            top: calc(5% + 18px);
        }
    }

    .bet-title {
        width: 100%;
        z-index: -1;

        font-size: 18px;
        font-weight: bold;
        line-height: 46px;

        color: $c-main;
        font-size: 42px;
        font-weight: bold;

        background: -webkit-linear-gradient($c-main, #da3c20);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        @include xxs-land-only {
            font-size: 32px;
            line-height: 38px;

            .v-image {
                height: 32px !important;
            }
        }
    }

    .user-bet-chip {
        position: absolute;
        z-index: 1;
        left: calc(50% + 5px);
        top: calc((100% - 40px) * 0.65);

        height: 36px;
        width: 36px;

        pointer-events: none;
        overflow: visible;

        &.chip-done.hidden-chip { display: none; }
        &.chip-temp.hidden-chip { display: none; }

        &.chip-done, &.chip-temp.first-bet { left: calc(50% - 40px); top: calc((100% - 60px) * 0.65); }

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

        @include md-and-up {
            height: 52px;
            width: 52px;

            .v-responsive__content span {
                margin-top: 15px;
                font-size: 18px;
            }
        }
    }
}
</style>
