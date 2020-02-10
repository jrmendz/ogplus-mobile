<template>
    <div id="threecards-result">
        <div :class="['result-board result-cards', (ThreeCardsItems[winner] === ThreeCardsItems.Tie) && 'result-tie']">
            <v-img v-show="isVisibleCards" :class="['result-board result-blue', (ThreeCardsItems[winner] === ThreeCardsItems.Dragon) && 'result-win', (winner === ThreeCardsItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-blue.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.dragon") }}</div>
                <div class="board-result">{{ getCardResult(0) }}</div>
                <v-img v-if="currentTableData.game.result === 'dragon,lucky'" class="board-lucky" :src="require(`@/assets/images/games/areas/img_lucky.png`)" width="25px" contain />
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card', `card-blue-${ i - 1 }`]"
                    :src="cardImages.blue[i - 1]" width="48px" height="68px" contain />
            </v-img>
            <v-img v-show="isVisibleCards" :class="['result-board result-red', (ThreeCardsItems[winner] === ThreeCardsItems.Phoenix) && 'result-win', (winner === ThreeCardsItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-red.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.phoenix") }}</div>
                <div class="board-result">{{ getCardResult(1) }}</div>
                <v-img v-if="currentTableData.game.result === 'pheonix,lucky'" class="board-lucky" :src="require(`@/assets/images/games/areas/img_lucky.png`)" width="25px" contain />
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card', `card-red-${ i - 1 }`]"
                    :src="cardImages.red[i - 1]" width="48px" height="68px" contain />
            </v-img>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Howl, Howler } from "howler";

import Events, { ThreeCardsItems, TableData } from "@/models/helper/types";
import ResultMixin from "@/views/games/common/mixins/resultMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class ThreeCardsResult extends Mixins(ResultMixin)
{
    isFlips = {
        blue: [false, false, false],
        red: [false, false, false],
    };

    cardImages = {
        blue: [
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
            require(`@/assets/images/games/cards/img_back-blue.png`),
        ],
        red: [
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
        ],
    };

    cardResults = ["", ""];

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    
    
// #[Life Cycle] ---------- + ---------- + ----------
    

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        const threecardsResult = document.getElementById("threecards-result") as HTMLDivElement;
        if (isFocus) {
            if (isPortrait)
                 Utils.addStyles("#threecards-result", { top: `${ appHeight * 0.35 + 13 }px`, height: `${ appHeight * 0.45 - 60 }px` });
            else Utils.addStyles("#threecards-result", { bottom: `${ (window.innerHeight - appHeight) + 10 }px`, height: `${ appHeight * 0.45 - 60 }px` });
        }
        else Utils.addStyles("#threecards-result", { bottom: "", height: "", top: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    calculateTotalValue(cards: { [key: string]: { result: string, [card: string]: string | { value: number } | null }}) {
        if (cards.dragon && cards.phoenix) {
            this.cardResults[0] = cards.dragon.result || "";
            setTimeout(() => this.cardResults[1] = cards.phoenix.result || "", 400);
        }
    }

    playResultSounds() {
        setTimeout(() => {
            const winner: any = this.winner;

                 if (winner === ThreeCardsItems[0]) this.mediaCtrl.threecardsSound.play("dragonWin");
            else if (winner === ThreeCardsItems[1]) this.mediaCtrl.threecardsSound.play("phoenixWin");
            else if (winner === ThreeCardsItems[2]) this.mediaCtrl.threecardsSound.play("tie");
        }, 500);
    }

    getCardResult(index: number) {
        const result = this.cardResults[index];
        if (result && typeof result === "string") {
            const [type, rank] = result.split("-");
            return this.$t(`threecardsTypes.${ type.toLowerCase() }`, [rank]);
        }
        return "";
    }

// #[Computed] ---------- + ---------- + ----------
    get ThreeCardsItems() { return ThreeCardsItems; }
    
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

#threecards-result {
    position: fixed;
    z-index: 1;
    left: 0;
    top: calc(18px + 35% - 5px);
    width: 100%;
    height: calc(80% - 35% - 60px);

    @include land-only {
        top: unset;
        bottom: 10px;
    }

    .result-board {
        position: absolute;

        /*&.result-players {
            padding-left: 24px;
            left: 0;
            bottom: calc(180px + 18px);

            @include land-only {
                bottom: 0;
            }

            .board-title {
                margin-left: -24px;
                margin-top: 1px;

                color: $c-main;
                font-size: 16px;
                font-weight: bold;
                text-shadow: 1px 1px #000000;

                @include xxs-only {
                    margin-top: 5px;
                }
            }
            .dragons-avatar {
                display: inline-block;
                overflow: visible;

                .v-responsive__content {
                    margin-left: -20%;
                    width: 140%;

                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    text-shadow: 1px 1px #000000;
                }

                @include xxs-only {
                    width: 40px !important;
                }
            }
            .dragons-bet {
                position: relative;
                z-index: -1;

                margin-right: 10px;
                bottom: 55px;
                right: 2.5px;

                font-size: 14px;
            }
        }*/

        &.result-cards {
            width: 100%;
            height: 145px;
            bottom: 0;

            @include land-only {
                height: 120px;
                bottom: -5px;
            }

            &.result-tie::after, .result-win::before {
                content: "";
                position: absolute;
                left: 0;
                width: 100%;
                height: 100%;

                background-repeat: no-repeat;
                background-size: 250% 250%;
                background-position: 0 0;
            }

            @include port-only {
                &.result-tie {
                    animation: result-tie 0.75s infinite alternate;

                    &::after {
                        animation: result-blue-shine 1.5s infinite alternate;
                        @include background-image-shine(to left);
                    }
                }
            }

            .result-blue, .result-red {
                @include land-only {
                    width: 30% !important;
                    height: 120px !important;
                }

                .v-image {
                    margin-top: 57.5px;

                    @include land-only {
                        margin-top: 42.5px;
                    }
                }

                > .v-image__image {
                    background-size: 100% 145px;

                    @include land-only {
                        background-size: 100% 120px;
                    }
                }
                .board-title, .board-result {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 40px;

                    font-size: 24px;
                    font-weight: bold;
                    line-height: 40px;
                    text-shadow: 1px 1px #000000;
                    
                    @include land-only {
                        line-height: 45px;
                    }
                }
                .board-result {
                    top: 32px;
                    height: 20px;

                    font-size: 18px;
                    line-height: 20px;
                    color: $c-main;
                }
                .board-lucky {
                    position: absolute;
                    margin-top: 0;
                    top: 7.5px;
                }

                &.result-win {
                    z-index: 1;
                }
                &.result-tie {
                    @include land-only {
                        animation: result-tie 0.75s infinite alternate;
                    }
                }
            }
            .result-blue {
                @include ios-left("", "-3%");

                .board-title {
                    left: 25px;
                    text-align: left;

                    @include land-only {
                        left: 35px;
                    }
                }
                .board-result {
                    right: 25px;
                    text-align: right;
                }
                .board-lucky {
                    right: 10px;
                }

                &.result-win {
                    animation: result-blue 0.75s infinite alternate;

                    &::before {
                        animation: result-blue-shine 1.5s infinite;
                        @include background-image-shine(45deg);
                    }
                }
            }
            .result-red {
                @include ios-right("", "-3%");

                .board-title {
                    right: 25px;
                    text-align: right;

                    @include land-only {
                        right: 35px;
                    }
                }
                .board-result {
                    left: 25px;
                    text-align: left;
                }
                .board-lucky {
                    left: 10px;
                }

                &.result-win {
                    animation: result-red 0.75s infinite alternate;

                    &::before {
                        animation: result-red-shine 1.5s infinite;
                        @include background-image-shine(-45deg);
                    }
                }
            }

            @keyframes result-tie {
                0%   { box-shadow: 0 0 10px  5px $c-bead-green; }
                100% { box-shadow: 0 0 30px 15px $c-bead-green; }
            }
            @keyframes result-blue {
                0%   { box-shadow: 0 0 10px  5px #2AF7F8; }
                100% { box-shadow: 0 0 30px 15px #2AF7F8; }
            }
            @keyframes result-red {
                0%   { box-shadow: 0 0 10px  5px #ED3F15; }
                100% { box-shadow: 0 0 30px 15px #ED3F15; }
            }

            @keyframes result-blue-shine {
                0%   { background-position: -125% 50%; }
                100% { background-position:  125% 50%; }
            }
            @keyframes result-red-shine {
                0%   { background-position:  125% 50%; }
                100% { background-position: -125% 50%; }
            }

            .table-card {
                display: inline-block;
                margin-top: 12.5px;

                transition: all 0.35s ease-in-out;

                @include land-only {
                    margin-top: 57.5px !important;

                    width: 42px !important;
                    height: 58px !important;
                }
                @include xxs-only {
                    margin-top: 67.5px !important;

                    width: 42px !important;
                    height: 58px !important;
                }
            }
        }
    }
}
</style>
