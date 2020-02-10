<template>
    <v-flex :id="platform.orientation.isPortrait ? 'road-map-wrap' : 'road-map-land'" :class="[isRoadMapVisible ? '' : 'road-map-hidden', gameType, inRow && 'in-row']">
        <template v-if="platform.orientation.isPortrait">
            <v-layout class="road-map-info" row wrap @click="onClickInfo()">
                <template v-if="isBaccarat || isDragonTiger">
                    <v-flex v-for="(color, i) in gameInfo.beadColors" :key="color" class="bead-result" xs2>
                        <!-- <v-icon :color="color">lens</v-icon> -->
                        <span class="title-text" :style="`color: ${ color }`">{{ $t(`tableAreas.${ beadNames[i] }`).substr(0, 1) }}</span>
                        <span class="result-text">{{ gameResult[i] }}</span>
                    </v-flex>
                    <v-flex class="bead-result bead-predict line-blue" xs3>
                        <v-container grid-list-xs fluid fill-height pa-0 ma-0><v-layout row wrap @click="onPredict('blue')">
                            <v-flex class="color-blue" xs3>{{ iconHints[0] }}</v-flex>
                            <v-flex v-for="(icon, i) in predictIcons" :key="icon" xs3>
                                <v-icon v-if="predictionResults[0][i] !== -1" :color="gameInfo.beadColors[predictionResults[0][i] * 2]">{{ icon }}</v-icon>
                            </v-flex>
                        </v-layout></v-container>
                    </v-flex>
                    <v-flex class="bead-result bead-predict line-red" xs3>
                        <v-container grid-list-xs fluid fill-height pa-0 ma-0><v-layout row wrap @click="onPredict('red')">
                            <v-flex class="color-red" xs3>{{ iconHints[1] }}</v-flex>
                            <v-flex v-for="(icon, i) in predictIcons" :key="icon" xs3>
                                <v-icon v-if="predictionResults[1][i] !== -1" :color="gameInfo.beadColors[predictionResults[1][i] * 2]">{{ icon }}</v-icon>
                            </v-flex>
                        </v-layout></v-container>
                    </v-flex>
                </template>
                <template v-else-if="isRoulette && !inRow">
                    <v-icon class="expand-icon" color="#ffffff">expand_more</v-icon>
                </template>
                <template v-else-if="isThreeCards">
                    <v-flex v-for="id in ['dragon', 'tie', 'phoenix', 'star']" :key="`bean-${ id }`" class="bead-result" xs2>
                        <v-img v-if="id === 'star'" class="bean" :src="require(`@/assets/images/games/road/other/img_star.png`)" width="16px" height="16px" contain  />
                        <v-img v-else class="bean" :src="require(`@/assets/images/games/road/bean${ $i18n.locale === 'cn' ? '-cn' : '' }/img_${ id }.png`)" width="16px" height="16px" contain />
                        <span class="result-text">{{ threeCardsResult[id] }}</span>
                    </v-flex>
                </template>
            </v-layout>
            <RoadMap ref="gameRoadmap" :gameType="gameType" :tableNumber="userInfo.tableSelection.tableNumber" :inRow="isRoulette && inRow" inGame />
        </template>
        <template v-else>
            <v-layout class="road-map-info" fill-height row wrap>
                <v-flex class="bead-result-wrap" xs2-16 @click="onRoadMapSwitch()">
                    <template v-if="isBaccarat || isDragonTiger">
                        <v-container fluid fill-height pa-0 ma-0><v-layout class="bead-result" column wrap>
                            <template v-for="(color, i) in gameInfo.beadColors">
                                <!-- <v-flex :key="`icon-${ color }`" xs2><v-icon :color="color">lens</v-icon></v-flex> -->
                                <v-flex :key="`title-${ color }`" class="title-text" :style="`color: ${ color }`" xs1>{{ $t(`tableAreas.${ beadNames[i] }`).substr(0, 1) }}</v-flex>
                                <v-flex :key="`data-${ color }`" class="result-text" xs1>{{ gameResult[i] }}</v-flex>
                            </template>
                        </v-layout></v-container>
                    </template>
                    <template v-else-if="isThreeCards">
                        <v-container fluid fill-height pa-1 ma-0><v-layout class="bead-result" column wrap>
                            <template v-for="id in ['dragon', 'tie', 'phoenix', 'star']">
                                <v-flex :key="`icon-${ id }`" class="tcards" xs1>
                                    <v-img v-if="id === 'star'" :src="require(`@/assets/images/games/road/other/img_star.png`)" height="16px" contain  />
                                    <v-img v-else :src="require(`@/assets/images/games/road/bean${ $i18n.locale === 'cn' ? '-cn' : '' }/img_${ id }.png`)" height="16px" contain />
                                </v-flex>
                                <v-flex :key="`data-${ id }`" class="result-text tcards" xs1>{{ threeCardsResult[id] }}</v-flex>
                            </template>
                        </v-layout></v-container>
                    </template>
                    <template v-else-if="isNiuniu && !isRoadMapVisible">
                        <v-img class="switch-arrow" :src="require(`@/assets/images/settings/img_pagePrev.svg`)" height="50%" width="70%" position="bottom" contain />
                        <v-img class="switch-arrow" :src="require(`@/assets/images/settings/img_pagePrev.svg`)" height="50%" width="70%" position="top" contain />
                    </template>
                    <template v-else-if="isRoadMapVisible">
                        <v-img class="switch-arrow" :src="require(`@/assets/images/settings/img_pageNext.svg`)" height="50%" width="70%" position="bottom" contain />
                        <v-img class="switch-arrow" :src="require(`@/assets/images/settings/img_pageNext.svg`)" height="50%" width="70%" position="top" contain />
                    </template>
                </v-flex>
                <v-flex xs13-16>
                    <RoadMap ref="gameRoadmap" :gameType="gameType" :tableNumber="userInfo.tableSelection.tableNumber" :inRow="(isRoulette || isMoneywheel) && !isRoadMapVisible" inGameLand />
                </v-flex>
                <v-flex xs1-16>
                    <template v-if="isBaccarat || isDragonTiger">
                        <v-container fluid fill-height pa-0 ma-0><v-layout column wrap>
                            <v-flex class="line-blue" xs5 @click="onPredict('blue')">
                                <div class="color-blue">{{ iconHints[0] }}</div>
                                <template v-for="(icon, i) in predictIcons">
                                    <v-icon v-if="predictionResults[0][i] !== -1" :key="icon" :color="gameInfo.beadColors[predictionResults[0][i] * 2]">{{ icon }}</v-icon>
                                </template>
                            </v-flex>
                            <v-flex class="line-red" xs5 @click="onPredict('red')">
                                <div class="color-red">{{ iconHints[1] }}</div>
                                <template v-for="(icon, i) in predictIcons">
                                    <v-icon v-if="predictionResults[1][i] !== -1" :key="icon" :color="gameInfo.beadColors[predictionResults[1][i] * 2]">{{ icon }}</v-icon>
                                </template>
                            </v-flex>
                        </v-layout></v-container>
                    </template>
                </v-flex>
            </v-layout>
        </template>
    </v-flex>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events, { GameTypes, RoadmapData, BaccaratData, DragonTigerData, ThreeCardsData, NiuniuData, TableData, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    RoadMap: () => import("@/views/games/common/components/RoadMap.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    isRoadMapVisible = false;
    inRow = true;

    predictIcons = ["panorama_fish_eye", "lens", "maximize"];

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly gameType!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("userInfo.tableSelection.tableNumber") onTableNumberChanged(val: string) {
        (this.$refs.gameRoadmap as any).onRedraw();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        if (this.currentTableData.code === GameTypes.Niuniu) this.isRoadMapVisible = false;
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onPredict(type: string) {
        if (this.currentTableData.status !== TableStatus.Betting) return;

        this.mediaCtrl.spotFxSound.play("click");
        (this.$refs.gameRoadmap as any).onPredict(type);
    }

    onRoadMapSwitch() {
        this.mediaCtrl.spotFxSound.play("click");
        this.isRoadMapVisible = !this.isRoadMapVisible;
    }

    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                Utils.addStyles("#road-map-wrap", {
                    bottom: `${ (window.innerHeight - appHeight) + 18 }px`,
                    height: `${ appHeight * 0.2 - 18 }px`
                });
                Utils.addStyles("#road-map-wrap.roulette.in-row", { bottom: `${ (window.innerHeight - appHeight) + (appHeight * 0.2 - 18) * -0.76 }px` });
            }
        }
        else Utils.addStyles("#road-map-wrap", { bottom: "", height: "" });
    }

    onClickInfo() {
        this.inRow = !this.inRow;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get isBaccarat()    { return this.gameType === GameTypes.Baccarat; }
    get isDragonTiger() { return this.gameType === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.gameType === GameTypes.Moneywheel; }
    get isRoulette()    { return this.gameType === GameTypes.Roulette; }
    get isThreeCards()  { return this.gameType === GameTypes.ThreeCards; }
    get isNiuniu()      { return this.gameType === GameTypes.Niuniu; }

    get iconHints() {
        if (this.gameType === GameTypes.Baccarat) return [this.$t("tableInfos.player"), this.$t("tableInfos.banker")];
        else if (this.gameType === GameTypes.DragonTiger) return [this.$t("tableInfos.dragon"), this.$t("tableInfos.tiger")];
        else return ["", ""];
    }

    get gameResult() {
        const result = this.currentTableData.totalResult;
        const shoeGame = this.currentTableData.shoeGame;
        if (this.currentTableData.status === TableStatus.Shuffling || shoeGame.slice(shoeGame.indexOf("-") + 1) === "1") return [0, 0, 0];
        else return [result.player | result.dragon, result.tie, result.banker | result.tiger];
    }

    get threeCardsResult() {
        const { dragon, tie, phoenix, ...stars } = (this.gameInfo.roadmapList[this.userInfo.tableSelection.tableNumber] as ThreeCardsData).roadMap.count;
        return { dragon, tie, phoenix, star: stars.dragonStar + stars.phoenixStar };
    }

    get predictionResults() {
        const data = this.gameInfo.roadmapList[this.userInfo.tableSelection.tableNumber] as BaccaratData | DragonTigerData;
        const results = [[-1, -1, -1], [-1, -1, -1]];

        if (!data) return results;

        const bead = [(data as BaccaratData).prediction.player || (data as DragonTigerData).prediction.dragon,
                      (data as BaccaratData).prediction.banker || (data as DragonTigerData).prediction.tiger ];

        for (let i = bead.length - 1; i >= 0; --i) {
            if (!bead[i]) return results;

            results[i][0] = (bead[i].bigEyeRoad && bead[i].bigEyeRoad.result !== undefined) ? bead[i].bigEyeRoad.result : -1;
            results[i][1] = (bead[i].smallRoad  && bead[i].smallRoad.result  !== undefined) ? bead[i].smallRoad.result  : -1;
            results[i][2] = (bead[i].roachRoad  && bead[i].roachRoad.result  !== undefined) ? bead[i].roachRoad.result  : -1;
        }
        return results;
    }

    get beadNames() {
        if (this.isBaccarat) return ["player", "tie", "banker"];
        else if (this.isDragonTiger) return ["dragon", "tie", "tiger"];
        
        return [];
    }
}
</script>

<style lang="scss">
#road-map-wrap {
    position: fixed;
    z-index: 1;
    width: 100%;
    bottom: 18px;
    height: calc(20% - 18px);

    transition: all 0.5s;
    
    &.roulette.in-row {
        bottom: calc((20% - 18px) * -0.76);
        
        .road-map-info {
            height: 20%;
            line-height: calc((20% - 18px) * 0.24);
        }

        #road-map-content {
            top: -20%;
        }
    }

    .expand-icon {
        margin-left: calc(50% - 13px);

        font-size: 24px;
        line-height: 18px;
    }

    .road-map-info {
        background-color: #363636;
        height: 18px;
        line-height: 18px;
        
        transition: all 0.5s;

        .bead-result {
            height: 100%;

            .v-icon {
                transform: translateY(1px) scale(0.5);
                line-height: 18px;
            }

            &.bead-predict {
                margin-left: 3%;
                flex-basis: 20%;
                max-width: 20%;

                .color-blue {
                    height: 16px;
                    background-color: $c-bead-blue;
                    border-radius: 5px 0 0 5px;
                }
                .color-red {
                    height: 16px;
                    background-color: $c-bead-red;
                    border-radius: 5px 0 0 5px;
                }

                .v-icon {
                    transform: translate(-1px, -1px) scale(0.5);
                    line-height: 18px;
                }
                .flex {
                    padding: 0;

                    &:last-of-type {
                        transform: translate(4px, 27.5%) scale(1.3) rotate(-45deg);
                    }
                }
            }
        }
    }

    #road-map-content {
        top: 0;
        transition: all 0.5s;
    }

    .v-image.bean {
        display: inline-block;
        vertical-align: middle;
        margin-right: 7.5px;
    }
}

#road-map-land {
    position: fixed;
    top: 75px;
    right: 0;
    width: 380px;
    height: 145px;

    background-color: rgba(#000000, 0.65);
    border: 1px solid $c-main-light;
    border-right: none;
    border-radius: 5px 0 0 5px;

    transform: scale(0.9) translate(5%, -5%);
    transition: all 0.35s ease-in-out;

    @include ios-right("", "0px");
    @include ios-clip(0% 0%, 0% 100%, 100% 100%, 100% 0%);

    &.moneywheel, &.roulette, &.threecards, &.niuniu {
        z-index: 1;
        
        @include ios-right("", "-32px");
        @include ios-clip(0% 0%, 0% 100%, calc(100% - 32px) 100%, calc(100% - 32px) 0%); 

        .bead-result-wrap {
            border-right: none;
        }

        .switch-arrow {
            transform: translateX(6.5px);
        }
    }
    &.moneywheel, &.roulette {
        &.road-map-hidden {
            #road-map-content {
                pointer-events: none;
                left: -38px;
            }
        }
    }

    &.road-map-hidden {
        right: -342px;
        background-color: rgba($c-dark-blue, 0.8);

        transform: scale(0.9) translate(-5%, -5%);

        @include ios-right("", "-342px");
        @include ios-clip(0% 0%, 0% 100%, calc(100% - 340px) 100%, calc(100% - 340px) 0%);
    }

    .flex {
        height: 145px;
    }
    .flex.tcards {
        height: 120px;
        font-size: 12px;
    }

    .bead-result-wrap {
        flex-basis: 38px !important;
        max-width: 38px !important;

        border-right: 1px solid rgba($c-main-light, 0.2);

        .bead-result {
            .v-icon {
                transform: translateY(3px) scale(0.7);
            }
        }
    }

    .line-blue, .line-red {
        margin-top: 30%;
        transform: translateX(4px);

        .color-blue {
            height: 16px;
            background-color: $c-bead-blue;
            border-radius: 5px 5px 0 0;
        }
        .color-red {
            height: 16px;
            background-color: $c-bead-red;
            border-radius: 5px 5px 0 0;
        }

        .v-icon {
            position: absolute;
            font-size: 12px;
            right: 5px;

            &:nth-of-type(1) {
                top: 17.5px;
            }
            &:nth-of-type(2) {
                top: 32.5px;
            }
            &:nth-of-type(3) {
                top: 47.5px;
                transform: translate(4px, 2px) scale(1.3) rotate(-45deg);
            }
        }
    }

    #road-map-content {
        top: -1.75px;
        left: 0;
        transition: all 0.35s ease-in-out;
    }

    .roadmap-switch {
        position: absolute;
        top: 0;
        width: 40%;
        height: 100%;
    }
}

#road-map-wrap, #road-map-land {
    .line-blue {
        border-radius: 5px;
        border: 1px solid $c-bead-blue;
    }
    .line-red {
        border-radius: 5px;
        border: 1px solid $c-bead-red;
    }

    .result-text {
        letter-spacing: -1px;
    }
    .title-text {
        font-weight: bold;

        @include port-only {
            margin-right: 5px;
        }
        @include land-only {
            &:first-of-type {
                margin-top: 10px;
            }
        }
    }
}
</style>
