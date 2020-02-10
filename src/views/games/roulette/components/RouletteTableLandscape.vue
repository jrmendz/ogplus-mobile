<template>
    <div class="roulette-table-wrap">
        <v-img :class="`roulette-table landscape ${ mediaCtrl.isVideoNormalSize && 'normal-video' } ${ $parent.isRoundTable && 'round-table' }`" :src="require(`@/assets/images/games/tables/img_rouletteTable${ $parent.isRoundTable ? '-round' : '' }-land.png`)" width="calc(100% - 190px)" height="calc(100% - 24px - 85px)" contain>
            <v-container v-if="canLoad" grid-list-xs fluid fill-height align-content-start justify-start ma-0 pa-0>
                <template v-for="(data, area) in $parent.betAreas">
                    <template v-for="i in data.count">
                        <div v-if="$parent.isRoundTable && area === 's'" :key="`round-${ id = `${ area }${ i - 1 }` }`" :class="`round-area round-${ area } round-${ id }`">
                            <svg viewBox="0 0 222.19 100" preserveAspectRatio="none" @click="$parent.onBetInRound(i - 1)">
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
                            <div v-else-if="area === 'dozen'" class="bet-area-text"><span>{{ getDozenName(i - 1) }}</span><span>12</span></div>
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
                        <svg :key="`round-series${ i }`" class="round-area" viewBox="0 0 222.19 100" preserveAspectRatio="none" @click="$parent.onBetSeries(i)">
                            <polygon :points="series.points" style="fill: transparent" />
                            <text :y="series.textPos.y" fill="#ffffff" font-size="6" font-weight="bold" text-anchor="middle">
                                <tspan v-for="(text, j) in getSeriesName(i)" :key="text" :x="series.textPos.x" :dy="j * 6">{{ text }}</tspan>
                            </text>
                        </svg>
                    </template>
                    <!-- <div class="bet-num" @click="$parent.onChangeBetNum()">{{ `x ${ $parent.numBetsInRound }` }}</div> -->
                </template>
            </v-container>
        </v-img>
        <v-switch :class="`round-switch ${ $parent.isRoundTable && 'round-table' }`" v-model="$parent.isRoundTable" hide-details :disabled="currentTableData.status !== 'betting'">
            <template v-slot:label>{{ $t("raceTracker") }}</template>
        </v-switch>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class RouletteTablePortrait extends Mixins(BettingTableMixin)
{
    canLoad: boolean = true;
    
    betSingleDatas = [
        { id:  0, points: "  1,40  18,44  23,36  12,20   5,27", textPos: { x:  12.4, y: 36.9 } },
        { id: 32, points: " 23,36  30,33  30,12  20,14  12,20", textPos: { x:  23.7, y: 26.1 } },
        { id: 15, points: " 30,33  42,33  42,12         30,12", textPos: { x:  36  , y: 25   } },
        { id: 19, points: " 42,33  54,33  54,12         42,12", textPos: { x:  47.8, y: 25   } },
        { id:  4, points: " 54,33  66,33  66,12         54,12", textPos: { x:  59.7, y: 25   } },
        { id: 21, points: " 66,33  76,33  76,12         66,12", textPos: { x:  70.4, y: 25   } },
        { id:  2, points: " 76,33  88,33  88,12         76,12", textPos: { x:  82.2, y: 25   } },
        { id: 25, points: " 88,33 100,33 100,12         88,12", textPos: { x:  94.1, y: 25   } },
        { id: 17, points: "100,33 119,33 119,12        100,12", textPos: { x: 110.2, y: 25   } },
        { id: 34, points: "119,33 140,33 140,12        119,12", textPos: { x: 129.5, y: 25   } },
        { id:  6, points: "140,33 158,33 158,12        140,12", textPos: { x: 148.9, y: 25   } },
        { id: 27, points: "158,33 170,33 170,12        158,12", textPos: { x: 163.9, y: 25   } },
        { id: 13, points: "170,33 182,33 182,12        170,12", textPos: { x: 175.8, y: 25   } },
        { id: 36, points: "182,33 194,33 194,12        182,12", textPos: { x: 187.6, y: 25   } },
        { id: 11, points: "194,33 201,36 206,16 202,14 194,12", textPos: { x: 198.3, y: 26.1 } },
        { id: 30, points: "201,36 204,42 218,30 213,22 206,16", textPos: { x: 208.6, y: 32.6 } },
        { id:  8, points: "204,42 205,50 223,50 221,40 218,30", textPos: { x: 213.9, y: 44.4 } },
        { id: 23, points: "205,50 204,58 218,69 221,59 223,50", textPos: { x: 213.9, y: 58.9 } },
        { id: 10, points: "204,58 200,64 206,83 215,74 218,69", textPos: { x: 208.6, y: 72.3 } },
        { id:  5, points: "200,64 192,67 192,86        206,83", textPos: { x: 198.3, y: 78.8 } },
        { id: 24, points: "192,67 181,67 181,86        192,86", textPos: { x: 187.1, y: 79.9 } },
        { id: 16, points: "181,67 170,67 170,86        181,86", textPos: { x: 175.8, y: 79.9 } },
        { id: 33, points: "170,67 158,67 158,86        170,86", textPos: { x: 163.9, y: 79.9 } },
        { id:  1, points: "158,67 146,67 146,86        158,86", textPos: { x: 152.1, y: 79.9 } },
        { id: 20, points: "146,67 134,67 134,86        146,86", textPos: { x: 140.8, y: 79.9 } },
        { id: 14, points: "134,67 124,67 124,86        134,86", textPos: { x: 129  , y: 79.9 } },
        { id: 31, points: "124,67 112,67 112,86        124,86", textPos: { x: 117.2, y: 79.9 } },
        { id:  9, points: "112,67 100,67 100,86        112,86", textPos: { x: 105.4, y: 79.9 } },
        { id: 22, points: "100,67  88,67  88,86        100,86", textPos: { x:  94.1, y: 79.9 } },
        { id: 18, points: " 88,67  76,67  76,86         88,86", textPos: { x:  82.2, y: 79.9 } },
        { id: 29, points: " 76,67  65,67  65,86         76,86", textPos: { x:  71  , y: 79.9 } },
        { id:  7, points: " 65,67  53,67  53,86         65,86", textPos: { x:  59.1, y: 79.9 } },
        { id: 28, points: " 53,67  42,67  42,86         53,86", textPos: { x:  47.8, y: 79.9 } },
        { id: 12, points: " 42,67  30,67  30,86         42,86", textPos: { x:  36  , y: 79.9 } },
        { id: 35, points: " 30,67  24,64  12,80  20,85  30,86", textPos: { x:  23.7, y: 78.8 } },
        { id:  3, points: " 24,64  18,55   1,62   5,71  12,80", textPos: { x:  12.4, y: 68.6 } },
        { id: 26, points: " 18,55  18,44   1,40   0,52   1,62", textPos: { x:   9.1, y: 53   } },
    ];

    roundBetSeries = [
        { points: " 30,67  24,64  18,55  18,44  23,36         30,33  42,33  42,67", textPos: { x:  30.6, y: 48.7 } },
        { points: " 42,67  42,33                                    100,33 100,67", textPos: { x:  71  , y: 48.7 } },
        { points: "100,67 100,33                                    158,33 158,67", textPos: { x: 128.5, y: 51.9 } },
        { points: "158,67 158,33 194,33 201,36 204,42 205,50 204,58 200,64 192,67", textPos: { x: 180.6, y: 48.7 } },
    ];

// #[Props] ---------- + ---------- + ----------


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
            Utils.addStyles(".roulette-table.landscape", { height: `${ appHeight - 109 }px`, transition: "none" });

            this.$nextTick(() => Utils.addStyles(".roulette-table.portrait", { transition: "" }));
        }
        else {
            Utils.addStyles(".roulette-table.landscape", { height: "calc(100% - 24px - 85px)", transition: "none" });

            this.$nextTick(() => Utils.addStyles(".roulette-table.portrait", { transition: "" }));
        }
    }

// #[Methods] ---------- + ---------- + ----------
    getAreaData(id: number) {
        return this.betSingleDatas.find(data => data.id === id);
    }

    getDozenName(id: number) {
        const name = this.$t(`tableAreas.roulette.dozen[${ id }]`).toString();
        return name.replace("{n}Dozen", "");
    }

    getRowName(id: number) {
        const name = this.$t(`tableAreas.roulette.rows[${ id }]`).toString();
        return name.replace("{n}", "<br>");
    }

    getSeriesName(id: number) {
        const name = this.$t(`tableAreas.roulette.series[${ id }]`).toString();

        if (id === 0) {
            if (this.$i18n.locale === "cn") return [name.substr(0, 2), name.substr(2)];
            else return name.replace("0-", "0-{n}").split("{n}");
        }
        else return name.split("{n}");
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
$s-border: 0.25%;
$s-zero: #{ 100% - $s-border * 2 } / #{ 14 } * 0.9;
$s-side: #{ 100% - $s-border * 2 } / #{ 5 } * 0.825;
$s-height: #{ "(" 100% - $s-border * 2 } - #{ $s-side } * #{ 2 ")" } / 3;
$s-width : #{ "(" 100% - $s-border * 2 } - #{ $s-zero ")" } / 13;

@keyframes bet-active {
      0% { opacity: 0.35; }
    100% { opacity: 1.00; }
}

.roulette-table-wrap {
    .round-switch {
        position: fixed;
        top: 17px;

        @include ios-right("", "300px");

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
            top: -3px;
            left: -50px !important;
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
.roulette-table.landscape {
    position: fixed;
    overflow: visible;
    right: 80px;
    top: 75px;

    transform: none !important;
    transform-origin: right top;

    transition: all 1s;

    &.normal-video {
        right: 50px;
        transform: scale(0.5) !important;
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
            font-size: 4vh;
            line-height: 18px;

            span:not(:last-of-type) {
                margin-right: 10px;
            }
        }
        .user-bet-chip {
            position: absolute;
            z-index: 1;
            top: calc(50% - 12px);

            height: 24px;
            width: 24px;

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
        padding-left: calc(#{ $s-width } * 0.25);
        left: $s-border;
        top: calc(#{ $s-border });
        height: calc(#{ $s-height } * 3);
        width: calc(#{ $s-zero } * 0.75);

        .bet-active {
            height: calc(100%);
            width: calc(150%);

            background: url("~@/assets/images/games/tables/img_rouletteTable-zero-land.png") no-repeat;
            background-size: 100% 100%;
            background-position: center center; 
        }
        .user-bet-chip {
            left: calc(50% * 2 / 3 - 10px);
        }
    }
    
    @for $i from 1 through 36 {
        .s#{ $i } {
            top: calc(#{ $s-border } + #{ $s-height } * #{ (3 - $i) % 3 + 0.25 });
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ ceil($i / 3) - 0.5 });

            @if ($i >= 34) {
                padding-right: calc(#{ $s-width } * 0.25);
                width: calc(#{ $s-width } * 0.75);

                .bet-active {
                    width: calc(150%);
                }
                .user-bet-chip {
                    left: calc(50% * 2 / 3 - 10px);
                }
            }
            @if ($i % 3 == 0) {
                top: $s-border;
                padding-top: calc(#{ $s-height } * 0.5 * 0.25);
                height: calc(#{ $s-height } * 0.75);

                .bet-active {
                    height: calc(100% * 4 / 3);
                }
                .user-bet-chip {
                    top: calc(50% * 2 / 3);
                }
            }
            @if ($i % 3 == 1) {
                .bet-active {
                    transform: translateY(5%);
                }
            }
        }
    }

    // Street
    .street {
        top: calc(#{ $s-border } + #{ $s-side } + #{ $s-height } * 2);
    }
    
    @for $i from 1 through 12 {
        .street#{ $i } {
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ $i - 0.5 });
            
            @if ($i == 12) {
                width: calc(#{ $s-width } * 0.75);

                .user-bet-chip {
                    left: calc(50% * 2 / 3 - 10px);
                }
            }
        }
    }

    // Line
    .line {
        top: calc(#{ $s-border } + #{ $s-side } + #{ $s-height } * 2);
    }
    
    @for $i from 0 through 11 {
        .line#{ $i } {
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ $i });
        }
    }

    // Near
    @for $i from 1 through 24 {
        .near#{ $i } {
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ ceil($i / 2) - 0.5 });
            top: calc(#{ $s-border } + #{ $s-side } + #{ $s-height } * (#{ $i % 2 }));
            
            @if ($i >= 23) {
                padding-left: calc(#{ $s-width } * 0.25);
                width: calc(#{ $s-width } * 0.75);

                .user-bet-chip {
                    left: calc(50% * 2 / 3 - 10px);
                }
            }
        }
    }

    // Zero
    .zero {
        left: calc(#{ $s-border } + #{ $s-zero } * 0.75);
    }
    
    @for $i from 1 through 3 {
        .zero#{ $i } {
            top: calc(#{ $s-border } + #{ $s-height } * #{ (3 - $i) % 3 + 0.25 });

            @if ($i == 3) {
                top: $s-border;
                padding-top: calc(#{ $s-height } * 0.25 * 0.75);
                height: calc(#{ $s-height } * 0.75);

                .user-bet-chip {
                    top: calc(50% * 2 / 3);
                }
            }
        }
    }

    // Split
    @for $i from 1 through 33 {
        .split#{ $i } {
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ ceil($i / 3) });
            top: calc(#{ $s-border } + #{ $s-height } * #{ (3 - $i) % 3 + 0.25 });

            @if ($i % 3 == 0) {
                top: #{ $s-border };
                padding-top: calc(#{ $s-height } * 0.25 * 0.75);
                height: calc(#{ $s-height } * 0.75);

                .user-bet-chip {
                    top: calc(50% * 2 / 3);
                }
            }
        }
    }

    // Triangle
    .tri {
        left: calc(#{ $s-border } + #{ $s-zero } * 0.75);
    }
    
    @for $i from 1 through 2 {
        .tri#{ $i } {
            top: calc(#{ $s-border } + #{ $s-side } + #{ $s-height } * (#{ 2 - $i }));
        }
    }

    // Square
    @for $i from 1 through 22 {
        .square#{ $i } {
            left: calc(#{ $s-border } + #{ $s-zero } * 0.75 + #{ $s-width } * #{ ceil($i / 2) });
            top: calc(#{ $s-border } + #{ $s-side } + #{ $s-height } * (#{ (2 - $i) % 2 }));
        }
    }

    // Row
    .row {
        right: $s-border;
        height: calc(#{ $s-height });
        width: calc(#{ $s-width });

        .bet-active {
            width: 100%;
            height: 100%;
        }
    }
    
    @for $i from 1 through 3 {
        .row#{ $i } {
            top: calc(#{ $s-border } + #{ $s-height } * #{ 3 - $i });
        }
    }

    // Dozen
    .dozen {
        bottom: calc(#{ $s-border } + #{ $s-side } * 0.95);
        height: calc(#{ $s-side } * 0.95);
        width: calc(#{ $s-width } * 4);

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
            left: calc(#{ $s-border } + #{ $s-zero } + #{ $s-width } * (4 * #{ $i - 1 }));
        }
    }

    // Other
    .other {
        bottom: $s-border;
        height: calc(#{ $s-side } * 0.95);
        width: calc(#{ $s-width } * 2);

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
            left: calc(#{ $s-border } + #{ $s-zero } + #{ $s-width } * (2 * #{ $i - 1 }));
        }
    }
}
.roulette-table.landscape.round-table {
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
    
    $chip-pos: ( 5.4% 33.6%), (68.5% 76.6%), (37.0% 22.3%), ( 5.4% 67.0%), (26.6% 22.3%), (89.2% 76.1%), (66.7% 22.3%), (26.6% 76.6%), (96.2% 42.2%), (47.3% 76.6%),
               (94.0% 70.2%), (89.2% 23.4%), (16.1% 76.6%), (79.0% 22.3%), (58.1% 76.6%), (16.1% 22.3%), (79.0% 76.6%), (49.5% 22.3%), (37.0% 76.6%), (21.4% 22.3%),
               (63.4% 76.6%), (31.7% 22.3%), (41.9% 76.6%), (96.2% 56.2%), (84.2% 76.6%), (42.4% 22.3%), ( 3.8% 50.3%), (73.7% 22.3%), (21.4% 76.6%), (31.7% 76.6%),
               (94.0% 30.8%), (52.7% 76.6%), (10.8% 22.9%), (73.7% 76.6%), (58.1% 22.3%), (10.8% 76.1%), (84.2% 22.3%);

    @for $i from 1 through length($chip-pos) {
        .chip-s#{ $i - 1 } {
            $pos: nth($chip-pos, $i);

            left: calc(#{ nth($pos, 1) } - 18px);
            top: calc(#{ nth($pos, 2) } - 12px);
        }
    }

    &.normal-video {
        .bet-num {
            display: none;
        }
    }
    &:not(.normal-video) {
        .bet-num {
            position: fixed;
            right: 80px;
            top: 75px;
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
}
</style>
