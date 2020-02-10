<template>
    <v-img :class="`roulette-table portrait ${ mediaCtrl.isVideoNormalSize && 'normal-video' } ${ $parent.isRoundTable && 'round-table' }`" :src="require(`@/assets/images/games/tables/img_rouletteTable${ $parent.isRoundTable ? '-round' : '' }.png`)" width="calc(100% - 120px)" contain>
        <v-container v-if="canLoad" grid-list-xs fluid fill-height align-content-start justify-start ma-0 pa-0>
            <template v-for="(data, area) in $parent.betAreas">
                <template v-for="i in data.count">
                    <div v-if="$parent.isRoundTable && area === 's'" :key="`round-${ id = `${ area }${ i - 1 }` }`" :class="`round-area round-${ area } round-${ id }`">
                        <svg viewBox="0 0 100 222.19" preserveAspectRatio="none" @click="$parent.onBetInRound(i - 1)">
                            <polygon :class="`bet-active ${ $parent.getIsRollingResult(id) && 'is-result' }`" :set="areaData = getAreaData(i - 1)" :points="areaData.points" :style="$parent.getIsExistChips(`${ id }`) || 'transform: scale(0)'" />
                            <polygon :points="areaData.points" style="fill: transparent" />
                            <text :x="areaData.textPos.x" :y="areaData.textPos.y" fill="#ffffff" font-size="7" font-weight="bold" text-anchor="middle">{{ i - 1 }}</text>
                        </svg>

                        <v-img :class="`user-bet-chip chip-${ id } ${ $parent.getTotalChipBy(id) || 'hidden-chip' }`"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(id) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(id) }}</span>
                        </v-img>
                    </div>
                    <div v-else-if="!$parent.isRoundTable" :key="id = `${ area }${ i - (data.startAt0 ? 1 : 0) }`" :class="`bet-area ${ area } ${ id }`" @click="onBetItem(`${ area }${ i - (data.startAt0 ? 1 : 0) }`)">
                        <div v-if="['s', 'row', 'dozen', 'other'].includes(area)" :class="`bet-active ${ $parent.getIsRollingResult(id) && 'is-result' }`" :style="$parent.getIsExistChips(id) || 'transform: scale(0)'"></div>

                        <div v-if="area === 's'" class="bet-area-text"><span>{{ i - 1 }}</span></div>
                        <div v-else-if="area === 'row'" class="bet-area-text"><span v-html="getRowName(i - 1)"></span></div>
                        <div v-else-if="area === 'dozen'" class="bet-area-text"><span v-html="getDozenName(i - 1)"></span><span>12</span></div>
                        <div v-else-if="area === 'other'" class="bet-area-text">
                            <span>{{ $t(`tableAreas.roulette.${ $parent.betOthers[i - 1] }`) }}</span>
                            <span v-if="$parent.betOthers[i - 1] === 'small'">1 - 18</span>
                            <span v-if="$parent.betOthers[i - 1] === 'big'">19 - 36</span>
                        </div>

                        <v-img :class="`user-bet-chip chip-${ id } ${ $parent.getTotalChipBy(id) || 'hidden-chip' }`"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(id) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(id) }}</span>
                        </v-img>
                    </div>
                </template>
            </template>
            <template v-if="$parent.isRoundTable">
                <template v-for="(series, i) in roundBetSeries">
                    <svg :key="`round-series${ i }`" class="round-area" viewBox="0 0 100 222.19" preserveAspectRatio="none" @click="$parent.onBetSeries(i)">
                        <polygon :points="series.points" style="fill: transparent" />
                        <text :y="series.textPos.y" fill="#ffffff" font-size="5" font-weight="bold" text-anchor="middle" class="adjust-text">
                            <tspan v-for="(text, j) in $t(`tableAreas.roulette.series[${ i }]`).toString().split('{n}')" :key="text" :x="series.textPos.x" :dy="j * 6">{{ text }} </tspan>
                        </text>
                    </svg>
                </template>
                <!-- <div class="bet-num" @click="$parent.onChangeBetNum()">{{ `x ${ $parent.numBetsInRound }` }}</div> -->
            </template>
        </v-container>
        <v-switch :class="`round-switch ${ $parent.isRoundTable && 'round-table' }`" v-model="$parent.isRoundTable" hide-details :disabled="currentTableData.status !== 'betting'">
            <template v-slot:label>{{ $t("raceTracker") }}</template>
        </v-switch>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Utils from "@/models/helper/utils";
import Events from "@/models/helper/types";

@Component({ components: {}})
export default class RouletteTablePortrait extends Mixins(BettingTableMixin)
{
    canLoad: boolean = true;
    
    betSingleDatas = [
        { id:  0, points: "59,  1 55, 18 64, 23 80, 12 72,  5", textPos: { x: 65.3, y:  14.5 } },
        { id: 32, points: "64, 23 67, 30 87, 30 85, 20 80, 12", textPos: { x: 76.1, y:  25.8 } },
        { id: 15, points: "67, 30 67, 42 87, 42        87, 30", textPos: { x: 77.2, y:  38.2 } },
        { id: 19, points: "67, 42 67, 54 87, 54        87, 42", textPos: { x: 77.2, y:  50   } },
        { id:  4, points: "67, 54 67, 66 87, 66        87, 54", textPos: { x: 77.2, y:  61.8 } },
        { id: 21, points: "67, 66 67, 76 87, 76        87, 66", textPos: { x: 77.2, y:  72.6 } },
        { id:  2, points: "67, 76 67, 88 87, 88        87, 76", textPos: { x: 77.2, y:  84.4 } },
        { id: 25, points: "67, 88 67,100 87,100        87, 88", textPos: { x: 77.2, y:  96.2 } },
        { id: 17, points: "67,100 67,119 87,119        87,100", textPos: { x: 77.2, y: 112.3 } },
        { id: 34, points: "67,119 67,140 87,140        87,119", textPos: { x: 77.2, y: 131.7 } },
        { id:  6, points: "67,140 67,158 87,158        87,140", textPos: { x: 77.2, y: 151   } },
        { id: 27, points: "67,158 67,170 87,170        87,158", textPos: { x: 77.2, y: 166.1 } },
        { id: 13, points: "67,170 67,182 87,182        87,170", textPos: { x: 77.2, y: 177.9 } },
        { id: 36, points: "67,182 67,194 87,194        87,182", textPos: { x: 77.2, y: 189.7 } },
        { id: 11, points: "67,194 64,201 83,206 85,202 87,194", textPos: { x: 76.1, y: 200.5 } },
        { id: 30, points: "64,201 57,204 69,218 78,213 83,206", textPos: { x: 69.6, y: 210.7 } },
        { id:  8, points: "57,204 50,205 50,223 59,221 69,218", textPos: { x: 56.7, y: 216.1 } },
        { id: 23, points: "50,205 41,204 30,218 40,221 50,223", textPos: { x: 42.8, y: 216.1 } },
        { id: 10, points: "41,204 36,200 16,206 25,215 30,218", textPos: { x: 28.8, y: 210.7 } },
        { id:  5, points: "36,200 33,192 13,192        16,206", textPos: { x: 23.4, y: 200.5 } },
        { id: 24, points: "33,192 33,181 13,181        13,192", textPos: { x: 22.3, y: 189.2 } },
        { id: 16, points: "33,181 33,170 13,170        13,181", textPos: { x: 22.3, y: 177.9 } },
        { id: 33, points: "33,170 33,158 13,158        13,170", textPos: { x: 22.3, y: 166.1 } },
        { id:  1, points: "33,158 33,146 13,146        13,158", textPos: { x: 22.3, y: 154.3 } },
        { id: 20, points: "33,146 33,134 13,134        13,146", textPos: { x: 22.3, y: 143   } },
        { id: 14, points: "33,134 33,124 13,124        13,134", textPos: { x: 22.3, y: 131.2 } },
        { id: 31, points: "33,124 33,112 13,112        13,124", textPos: { x: 22.3, y: 119.3 } },
        { id:  9, points: "33,112 33,100 13,100        13,112", textPos: { x: 22.3, y: 107.5 } },
        { id: 22, points: "33,100 33, 88 13, 88        13,100", textPos: { x: 22.3, y:  96.2 } },
        { id: 18, points: "33, 88 33, 76 13, 76        13, 88", textPos: { x: 22.3, y:  84.4 } },
        { id: 29, points: "33, 76 33, 65 13, 65        13, 76", textPos: { x: 22.3, y:  73.1 } },
        { id:  7, points: "33, 65 33, 53 13, 53        13, 65", textPos: { x: 22.3, y:  61.3 } },
        { id: 28, points: "33, 53 33, 42 13, 42        13, 53", textPos: { x: 22.3, y:  50   } },
        { id: 12, points: "33, 42 33, 30 13, 30        13, 42", textPos: { x: 22.3, y:  38.2 } },
        { id: 35, points: "33, 30 36, 24 20, 12 14, 20 13, 30", textPos: { x: 23.4, y:  25.8 } },
        { id:  3, points: "36, 24 44, 18 38,  1 28,  5 20, 12", textPos: { x: 33.6, y:  14.5 } },
        { id: 26, points: "44, 18 55, 18 59,  1 48,  0 38,  1", textPos: { x: 49.2, y:  11.3 } },
    ];

    roundBetSeries = [
        { points: "33, 30 36, 24 44, 18 55, 18 64, 23        67, 30 67, 42 33, 42", textPos: { x: 50, y:  33.3 } },
        { points: "33, 42 67, 42                                    67,100 33,100", textPos: { x: 50, y:  69.3 } },
        { points: "33,100 67,100                                    67,158 33,158", textPos: { x: 50, y: 131.7 } },
        { points: "33,158 67,158 67,194 64,201 57,204 50,205 41,204 36,200 33,192", textPos: { x: 50, y: 180.6 } },
    ];

// #[Computed] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("$parent.isRoundTable") onRoundTableChanged(val: boolean) {
        this.canLoad = false;
        setTimeout(() => this.canLoad = true, 200);
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            Utils.addStyles(".roulette-table.portrait", { height: `${ appHeight - 169 }px`, transition: "none" });
            Utils.addStyles(".roulette-table.portrait.normal-video", { top: `${ appHeight * 0.3 + 24 }px`, height: `${ appHeight * 0.7 - 114 }px` });
            Utils.addStyles(".roulette-table.portrait .round-switch", { bottom: `${ (window.innerHeight - appHeight) + 165 }px` });
            Utils.addStyles(".roulette-table.portrait .bet-num", { bottom: `${ (window.innerHeight - appHeight) + 127.5 }px` });

            this.$nextTick(() => Utils.addStyles(".roulette-table.portrait", { transition: "" }));
        }
        else {
            Utils.addStyles(".roulette-table.portrait", { top: "", height: "", transition: "none" });
            Utils.addStyles(".roulette-table.portrait .round-switch", { bottom: "" });
            Utils.addStyles(".roulette-table.portrait .bet-num", { bottom: "" });

            this.$nextTick(() => Utils.addStyles(".roulette-table.portrait", { transition: "" }));
        }
    }

// #[Methods] ---------- + ---------- + ----------
    getAreaData(id: number) {
        return this.betSingleDatas.find(data => data.id === id);
    }

    getDozenName(id: number) {
        const name = this.$t(`tableAreas.roulette.dozen[${ id }]`).toString();
        return (this.$i18n.locale === "cn") ? name.split("").join("<br>") : name.replace("{n}Dozen", "");
    }

    getRowName(id: number) {
        const name = this.$t(`tableAreas.roulette.rows[${ id }]`).toString();
        return name.replace("{n}", "<br>");
    }

// #[Props] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
$s-border: 0.25%;
$s-zero: #{ 100% - $s-border * 2 } / #{ 14 } * 0.9;
$s-side: #{ 100% - $s-border * 2 } / #{ 5 } * 0.825;
$s-width: #{ "(" 100% - $s-border * 2 } - #{ $s-side } * #{ 2 ")" } / 3;
$s-height: #{ "(" 100% - $s-border * 2 } - #{ $s-zero ")" } / 13;

@keyframes bet-active {
      0% { opacity: 0.35; }
    100% { opacity: 1.00; }
}

.roulette-table.portrait {
    position: fixed;
    left: 5px;
    top: calc(60px + 18px);
    height: calc(100% - 24px - 105px);

    // transition: all 1s;
    overflow: visible;

    &.normal-video {
        top: calc(30% + 24px);
        height: calc(70% - 24px - 50px);
    }

    > .v-image__image {
        background-size: 100% 100%;
    }

    .bet-area {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        width: calc(#{ $s-width } * 0.5);
        height: calc(#{ $s-height } * 0.5);

        .bet-active {
            position: absolute;
            pointer-events: none;

            border-radius: 5px;
            background: rgba(#ffffff, 0.3);
            animation: bet-active 1.5s alternate infinite;

            &.is-result {
                transform: scale(1) !important;
                border: 2px solid $c-main;
                background-color: rgba($c-main, 0.4);
                animation: none;
            }
        }
        .bet-area-text {
            font-weight: bold;
            font-size: 16px;
            font-size: 4vw;
            line-height: 18px;

            span {
                display: block;
            }
        }
        .user-bet-chip {
            position: absolute;
            z-index: 1;
            top: calc(50% - 12px);

            height: 24px;
            width: 100%;

            pointer-events: none;
            overflow: visible;

            &.hidden-chip { display: none; }

            .v-responsive__content span {
                display: inline-block;
                margin-top: 3px;
                padding: 0 2px;

                color: #000000;
                font-size: 12px;
                font-weight: bold;
                font-family: Arial, Helvetica, sans-serif;
                white-space: nowrap;
                letter-spacing: -2px;
            }
        }
    }

    // Single
    .s {
        .bet-active {
            width: calc(200%);
            height: calc(200%);
        }
    }

    .s0 {
        padding-top: calc(#{ $s-height } * 0.25);
        top: $s-border;
        right: calc(#{ $s-border });
        width: calc(#{ $s-width } * 3);
        height: calc(#{ $s-zero } * 0.75);

        .bet-active {
            width: calc(100%);
            height: calc(150%);

            background: url("~@/assets/images/games/tables/img_rouletteTable-zero.png") no-repeat;
            background-size: 100% 90%;
            background-position: center bottom;
        }
        .user-bet-chip {
            top: calc(50% * 2 / 3 - 10px);
        }
    }

    @for $i from 1 through 36 {
        .s#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ ceil($i / 3) - 0.5 });
            right: calc(#{ $s-border } + #{ $s-width } * #{ (3 - $i) % 3 + 0.25 });

            @if ($i >= 34) {
                padding-bottom: calc(#{ $s-height } * 0.25);
                height: calc(#{ $s-height } * 0.75);

                .bet-active {
                    height: calc(150%);
                }
                .user-bet-chip {
                    top: calc(50% * 2 / 3 - 10px);
                }
            }
            @if ($i % 3 == 0) {
                right: $s-border;
                padding-right: calc(#{ $s-width } * 0.75 * 0.25);
                width: calc(#{ $s-width } * 0.75);

                .bet-active {
                    width: calc(100% * 4 / 3);
                }
                .user-bet-chip {
                    width: calc(100% * 2 / 3);
                }
            }
            @if ($i % 3 == 1) {
                .bet-active {
                    transform: translateX(-5%);
                }
            }
        }
    }

    // Street
    .street {
        right: calc(#{ $s-border } + #{ $s-side } + #{ $s-width } * 2);
    }

    @for $i from 1 through 12 {
        .street#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ $i - 0.5 });

            @if ($i == 12) {
                height: calc(#{ $s-height } * 0.75);

                .user-bet-chip {
                    top: calc(50% * 2 / 3 - 10px);
                }
            }
        }
    }

    // Line
    .line {
        right: calc(#{ $s-border } + #{ $s-side } + #{ $s-width } * 2);
    }

    @for $i from 0 through 11 {
        .line#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ $i });
        }
    }

    // Near
    @for $i from 1 through 24 {
        .near#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ ceil($i / 2) - 0.5 });
            right: calc(#{ $s-border } + #{ $s-side } + #{ $s-width } * (#{ $i % 2 }));

            @if ($i >= 23) {
                padding-bottom: calc(#{ $s-height } * 0.25);
                height: calc(#{ $s-height } * 0.75);

                .user-bet-chip {
                    top: calc(50% * 2 / 3 - 10px);
                }
            }
        }
    }

    // Zero
    .zero {
        top: calc(#{ $s-border } + #{ $s-zero } * 0.75);
    }

    @for $i from 1 through 3 {
        .zero#{ $i } {
            right: calc(#{ $s-border } + #{ $s-width } * #{ (3 - $i) % 3 + 0.25 });

            @if ($i == 3) {
                right: $s-border;
                padding-right: calc(#{ $s-width } * 0.25 * 0.75);
                width: calc(#{ $s-width } * 0.75);

                .user-bet-chip {
                    width: 100% * 2 / 3;
                }
            }
        }
    }

    // Split
    @for $i from 1 through 33 {
        .split#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ ceil($i / 3) });
            right: calc(#{ $s-border } + #{ $s-width } * #{ (3 - $i) % 3 + 0.25 });

            @if ($i % 3 == 0) {
                right: #{ $s-border };
                padding-right: calc(#{ $s-width } * 0.25 * 0.75);
                width: calc(#{ $s-width } * 0.75);

                .user-bet-chip {
                    width: 100% * 2 / 3;
                }
            }
        }
    }

    // Triangle
    .tri {
        top: calc(#{ $s-border } + #{ $s-zero } * 0.75);
    }

    @for $i from 1 through 2 {
        .tri#{ $i } {
            right: calc(#{ $s-border } + #{ $s-side } + #{ $s-width } * (#{ 2 - $i }));
        }
    }

    // Square
    @for $i from 1 through 22 {
        .square#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-height } * #{ ceil($i / 2) });
            right: calc(#{ $s-border } + #{ $s-side } + #{ $s-width } * (#{ (2 - $i) % 2 }));
        }
    }

    // Row
    .row {
        bottom: $s-border;
        width: calc(#{ $s-width });
        height: calc(#{ $s-height });

        .bet-active {
            width: 100%;
            height: 100%;
        }
    }

    @for $i from 1 through 3 {
        .row#{ $i } {
            right: calc(#{ $s-border } + #{ $s-width } * #{ 3 - $i });
        }
    }

    // Dozen
    .dozen {
        left: calc(#{ $s-border } + #{ $s-side } * 0.95);
        width: calc(#{ $s-side } * 0.95);
        height: calc(#{ $s-height } * 4);

        white-space: pre-line;

        .bet-active {
            width: 100%;
            height: 100%;
        }
        .bet-area-text {
            letter-spacing: -2px;
        }
    }

    @for $i from 1 through 3 {
        .dozen#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } + #{ $s-height } * (4 * #{ $i - 1 }));
        }
    }

    // Other
    .other {
        left: $s-border;
        width: calc(#{ $s-side } * 0.95);
        height: calc(#{ $s-height } * 2);

        .bet-active {
            width: 100%;
            height: 100%;
        }
        .bet-area-text {
            letter-spacing: -2px;
        }
    }
    .other3, .other4 {
        background-size: 70%;
        background-position: center;

        .bet-area-text {
            display: none;
        }
    }

    @for $i from 1 through 6 {
        .other#{ $i } {
            top: calc(#{ $s-border } + #{ $s-zero } + #{ $s-height } * (2 * #{ $i - 1 }));
        }
    }

    .round-switch {
        position: fixed;
        right: 60px;
        bottom: 60px;

        .v-input--switch__track {
            top: calc(50% - 11px);
            height: 22px;

            color: rgba(#808080, 0.8) !important;
            border: 1px solid #ffffff;
            border-radius: 10px;

            &.accent--text {
                color: rgba($c-main-light, 0.8) !important;
                caret-color: rgba($c-main-light, 0.8) !important;
            }
        }
        .v-input--switch__thumb {
            &.accent--text {
                color: $c-main !important;
                caret-color: $c-main !important;
            }
        }
        .v-label {
            position: absolute !important;
            top: -35px;
            left: -7.5px !important;
            width: 50px;
            height: 35px;
            justify-content: center;

            color: $c-main-light;
            font-weight: bold;
            font-size: 14px;
            line-height: 16px;
        }
    }
}
.roulette-table.portrait.round-table {
    .round-area {
        position: absolute;
        width: 100%;
        height: 100%;

        pointer-events: none;
        svg {
            width: 100%;
            height: 100%;
        }
        polygon {
            pointer-events: fill;
        }

        .user-bet-chip {
            position: absolute;
            z-index: 1;

            height: 24px;
            width: 36px;

            pointer-events: none;

            &.hidden-chip { display: none; }

            .v-responsive__content span {
                display: inline-block;
                margin-top: 3px;
                padding: 0 2px;

                color: #000000;
                font-size: 12px;
                font-weight: bold;
                font-family: Arial, Helvetica, sans-serif;
                white-space: nowrap;
                letter-spacing: -2px;
            }
        }
    }

    .round-s {
        polygon {
            fill: rgba(#ffffff, 0.3);

            &.bet-active {
                animation: bet-active 1.5s alternate infinite;

                &.is-result {
                    transform: scale(1) !important;
                    stroke: $c-main;
                    stroke-width: 1px;
                    fill: rgba($c-main, 0.4);
                    animation: none;
                }
            }
        }
    }

    $chip-pos: (65.9%  5.4%), (22.9% 68.5%), (77.2% 37.0%), (32.6%  5.4%), (77.2% 26.6%), (23.4% 89.2%), (77.2% 66.7%), (22.9% 26.6%), (57.3% 96.2%), (22.9% 47.3%),
               (29.3% 94.0%), (76.1% 89.2%), (22.9% 16.1%), (77.2% 79.0%), (22.9% 58.1%), (77.2% 16.1%), (22.9% 79.0%), (77.2% 49.5%), (22.9% 37.0%), (77.2% 21.4%),
               (22.9% 63.4%), (77.2% 31.7%), (22.9% 41.9%), (43.3% 96.2%), (22.9% 84.2%), (77.2% 42.4%), (49.2%  3.8%), (77.2% 73.7%), (22.9% 21.4%), (22.9% 31.7%),
               (69.5% 94.0%), (22.9% 52.7%), (76.6% 10.8%), (22.9% 73.7%), (77.2% 58.1%), (22.9% 10.8%), (77.2% 84.2%);

    @for $i from 1 through length($chip-pos) {
        .chip-s#{ $i - 1 } {
            $pos: nth($chip-pos, $i);

            left: calc(#{ nth($pos, 1) } - 18px);
            top: calc(#{ nth($pos, 2) } - 12px);
        }
    }

    .bet-num {
        position: fixed;
        right: 8px;
        bottom: 127.5px;
        width: 35px;
        height: 30px;

        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        line-height: 30px;

        border-radius: 5px;
        background-color: rgba(#808080, 0.4);
    }
}
</style>
