<template>
    <v-flex id="road-map-emcee" :class="[isRoadMapVisible ? '' : 'road-map-hidden', gameType, mediaCtrl.isSmallEmcee && 'small-emcee']">
        <template>
            <v-layout class="road-map-info" fill-height row wrap>
                <v-flex xs14-16>
                    <RoadMap ref="gameRoadmap" :gameType="gameType" :tableNumber="userInfo.tableSelection.tableNumber" :inRow="(isRoulette || isMoneywheel) && !isRoadMapVisible" inGameLand />
                </v-flex>
                <v-flex class="bead-result-wrap" xs3-16 @click="onRoadMapSwitch()">
                    <template v-if="isBaccarat || isDragonTiger">
                        <v-container fluid fill-height pa-0 ma-0><v-layout class="bead-result" column wrap>
                            <template v-for="(color, i) in gameInfo.beadColors">
                                <v-img :key="`icon-${ color }`" class="result-icon" :src="require(`@/assets/images/games/road/bean${ ($i18n.locale === 'cn') ? '-cn' : '' }/img_${ beadNames[i] }.png`)" contain></v-img>
                                <v-flex :key="`data-${ color }`" class="result-text" xs1>{{ gameResult[i] }}</v-flex>
                            </template>
                        </v-layout></v-container>
                    </template>
                </v-flex>
            </v-layout>
        </template>
        <template v-if="isBaccarat || isDragonTiger">
            <div class="btn-predict predict-red" @click="onPredict('red')">{{ $t("predict.banker") }}</div>
            <div class="btn-predict predict-blue" @click="onPredict('blue')">{{ $t("predict.player") }}</div>
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

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get isBaccarat()    { return this.gameType === GameTypes.Baccarat; }
    get isDragonTiger() { return this.gameType === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.gameType === GameTypes.Moneywheel; }
    get isRoulette()    { return this.gameType === GameTypes.Roulette; }
    get isThreeCards()  { return this.gameType === GameTypes.ThreeCards; }
    get isNiuniu()      { return this.gameType === GameTypes.Niuniu; }

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
#road-map-emcee {
    position: fixed;
    z-index: 1;
    top: 85px;
    width: 330px;
    height: 145px;

    background-color: rgba(#000000, 0.65);
    border: 1px solid $c-main-light;
    border-left: none;
    border-radius: 0 5px 5px 0;

    transform: scale(0.9) translate(5%, -5%);
    transition: all 0.35s ease-in-out;

    @include ios-left("", "-30px");
    // @include ios-clip(0% 0%, 0% 100%, 100% 100%, 100% 0%);

    &.road-map-hidden {
        transform: scale(0.9) translate(-5%, -5%);

        @include ios-left("", "-260px");
    }
    &.small-emcee {
        top: calc(30% + 10px);
    }

    .flex {
        height: 145px;
    }

    .bead-result-wrap {
        flex-basis: 38px !important;
        max-width: 38px !important;

        border-left: 1px solid rgba($c-main-light, 0.2);

        .bead-result {
            .v-icon {
                transform: translateY(3px) scale(0.7);
            }
        }
    }

    .result-icon {
        transform: scale(0.75, 0.75);
    }
    .result-text {
        font-weight: bold;
    }

    .btn-predict {
        position: absolute;
        top: 150px;

        width: 60px;
        height: 24px;
        line-height: 24px;
        border-radius: 10px;

        &.predict-red {
            left: 5px;
            background: rgba($c-bead-red, 0.8);
        }
        &.predict-blue {
            left: calc(60px + (5px * 2));
            background: rgba($c-bead-blue, 0.8);
        }
    }
}
</style>
