<template>
    <div id="niuniu-result">
        <div class="result-board result-cards">
            <v-img v-show="isVisibleCards" class="result-board result-blue"
                   :src="require(`@/assets/images/games/result/img_resultBoard-blue.png`)" width="64%" height="240px">
                <div v-for="i in 3" :key="i" :class="`result-section result-section-blue${ i }`">
                    <div class="board-title">
                        {{ `${ $t("tableAreas.niuniu.player") } ${ i }` }}<span class="board-result">{{ cardResults[i] ? getCardResultName(cardResults[i]) : "" }}</span>
                    </div>
                    <v-img v-for="j in 5" :key="`div-${ i * 5 + j }`" :class="['table-card', `card-blue${ i }-${ j - 1 }`]"
                           :src="cardImages[`blue${ i }`][j - 1]" width="32px" height="45px" contain />
                </div>
            </v-img>
            <v-img v-show="isVisibleCards" class="result-board result-red"
                   :src="require(`@/assets/images/games/result/img_resultBoard-red.png`)" width="40%" height="240px">
                <!-- <div v-if="platform.orientation.isPortrait" :class="`result-section result-section-first`">
                    <div class="board-title">{{ $t("firstCard") }}</div>
                    <v-img :class="['table-card', `card-first-0`]" :src="cardImages.first[0]" width="32px" height="45px" contain />
                </div> -->
                <div :class="`result-section result-section-red`">
                    <div class="board-title">
                        {{ $t("tableAreas.niuniu.banker") }}<span class="board-result">{{ cardResults[0] ? getCardResultName(cardResults[0]) : "" }}</span>
                    </div>
                    <template v-for="i in 5">
                        <br v-if="i === 4 && platform.orientation.isPortrait" :key="`br-${ i }`" />
                        <v-img :key="i" :class="['table-card', `card-red-${ i - 1 }`]" :src="cardImages.red[i - 1]" width="32px" height="45px" contain />
                    </template>
                </div>
            </v-img>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events, { NiuniuItems } from "@/models/helper/types";
import ResultMixin from "@/views/games/common/mixins/resultMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class NiuniuResult extends Mixins(ResultMixin)
{
    isFlips = {
        first: [false],
        blue1: [false, false, false, false, false],
        blue2: [false, false, false, false, false],
        blue3: [false, false, false, false, false],
        red: [false, false, false, false, false],
    };

    cardImages = {
        first: [
            require(`@/assets/images/games/cards/img_back-red.png`),
        ],
        blue1: [
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
        ],
        blue2: [
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
        ],
        blue3: [
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
        ],
        red: [
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
        ],
    };

    cardResults = ["", "", "", ""];

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    
    
// #[Life Cycle] ---------- + ---------- + ----------
    

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        const niuniuResult = document.getElementById("niuniu-result") as HTMLDivElement;
        if (isFocus) {
            if (isPortrait)
                 Utils.addStyles("#baccarat-result", { top: `${ appHeight * 0.35 + 13 }px`, height: `${ appHeight * 0.45 - 60 }px` });
            else Utils.addStyles("#baccarat-result", { bottom: `${ (window.innerHeight - appHeight) + 10 }px`, height: `${ appHeight * 0.45 - 60 }px` });
        }
        else {
            Utils.addStyles("#baccarat-result", { bottom: "", height: "", top: "" });
        }
    }

// #[Methods] ---------- + ---------- + ----------
    drawCardsFromData(cards: { first?: any, banker?: any, player1?: any, player2?: any, player3?: any }) {
        if (cards.first && !this.isFlips.first[0]) {
            const value = cards.first.substring(0, cards.first.length - 1);
                 if (["A", "5",  "9", "K"].includes(value)) this.mediaCtrl.niuniuSound.play("banker_First");
            else if (["2", "6", "10"     ].includes(value)) this.mediaCtrl.niuniuSound.play("player1_First");
            else if (["3", "7",  "J"     ].includes(value)) this.mediaCtrl.niuniuSound.play("player2_First");
            else if (["4", "8",  "Q"     ].includes(value)) this.mediaCtrl.niuniuSound.play("player3_First");
        }

        this.calculateTotalValue(cards);
        
        this.drawCards("first", cards.first);
        this.drawCards("blue1", cards.player1);
        this.drawCards("blue2", cards.player2);
        this.drawCards("blue3", cards.player3);
        this.drawCards("red" , cards.banker);
    }

    calculateTotalValue(cards: { [key: string]: { result: string, [card: string]: string | { value: number } | null }}) {
        ["banker", "player1", "player2", "player3"].forEach((key, i) => {
            if (!this.cardResults[i] && cards[key].result) {
                this.cardResults[i] = cards[key].result;
                this.mediaCtrl.niuniuSound.play(`${ key }_${ this.cardResults[i] }`);
            }
        });
    }

    playResultSounds() {
        return;
    }

    getCardResultName(result: string) {
        const prefix = this.platform.orientation.isPortrait ? " – " : "";

        if (result === "NB") return prefix + this.$t("niuniuTypes.noBull");
        else if (result === "BB") return prefix + this.$t("niuniuTypes.bullBull");
        else if (result === "5P") return prefix + this.$t("niuniuTypes.fivePeople");
        else {
            return prefix + this.$t("niuniuTypes.bull", [this.$t(`number.${ result[1] }`).toString()]);
        } 
    }

// #[Computed] ---------- + ---------- + ----------
    get NiuniuItems() { return NiuniuItems; }
}
</script>

<style lang="scss">
@mixin background-image-shine($direction) {
    background-image: linear-gradient(
        $direction,
        rgba(#ffffff, 0.0)  20%,
        rgba(#ffffff, 0.1)  35%,
        rgba(#ffffff, 0.3)  50%,
        rgba(#ffffff, 0.1)  65%,
        rgba(#ffffff, 0.0)  80%
    );
}

#niuniu-result {
    position: fixed;
    z-index: 1;
    left: 0;
    top: calc(18px + 35% - 5px);
    width: 100%;
    height: calc(80% - 35% - 60px);

    @include land-only {
        top: unset;
        bottom: 10px;
        height: calc(80% - 35% - 60px);
    }

    .result-board {
        position: absolute;

        &.result-cards {
            width: 100%;
            height: 240px;
            bottom: 0;

            @include land-only {
                height: 130px;
                bottom: -5px;
            }

            .result-blue, .result-red {
                @include land-only {
                    position: fixed;
                    width: 300px !important;

                    .result-section:first-child {
                        margin-top: 7.5px;
                    }
                }

                > .v-image__image {
                    background-size: 100% 240px;
                }
                .board-title {
                    height: 28px;
                    width: 100%;

                    font-size: 18px;
                    font-weight: bold;
                    line-height: 28px;
                    text-align: center;
                    text-shadow: 1px 1px #000000;

                    .board-result {
                        font-size: 15px;
                        color: $c-main;
                    }

                    @include land-only {
                        position: absolute;
                        margin-top: 7.5px;
                        padding-left: 12.5px;
                        text-align: left;
                        top: 10px;

                        span {
                            position: absolute;
                            display: block;
                            top: 0;
                            left: 220px;
                        }
                    }
                }

                @include land-only {
                    .result-section {
                        padding-right: 10px;
                    }
                }
                
                @include port-only {
                    .result-section.result-section-red {
                        margin-top: 57px;
                    }
                }
            }
            .result-blue {
                @include ios-left("", "-3%");
                padding-left: 3%;

                @include land-only {
                    top: 110px;
                    height: 165px !important;

                    > .v-image__image {
                        background-size: 100% 165px;
                    }

                    .result-section-blue1 .board-title {
                        top: 10px;
                    }
                    .result-section-blue2 .board-title {
                        top: 60px;
                    }
                    .result-section-blue3 .board-title {
                        top: 110px;
                    }
                }
            }
            .result-red {
                @include ios-right("", "-3%");
                padding-right: 3%;

                @include land-only {
                    @include ios-left("", "-3%");
                    right: unset;
                    padding-right: unset;
                    padding-left: 3%;
                    
                    top: 50px;
                    height: 60px !important;

                    > .v-image__image {
                        background-size: 100% 60px;
                        transform: scaleX(-1);
                    }
                }
            }

            .table-card {
                display: inline-block;
                // margin-top: 12.5px;

                transition: all 0.35s ease-in-out;
            }
        }
    }
}
</style>
