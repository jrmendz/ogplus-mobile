<template>
    <div id="dragontiger-result">
        <v-img v-if="isVisiblePlayers && topPlayers.length > 0 && isBidding" class="result-board result-players" :src="require(`@/assets/images/games/result/img_playersBoard.png`)" width="100%" height="95px" contain>
            <div class="board-title">{{ $t("playersBid") }}</div>
            <template v-for="(color, i) in gameInfo.beadColors">
                <template v-if="topPlayers[i] && !!topPlayers[i].name">
                    <v-img class="players-avatar" :key="`avatar-${ color }`"
                           :src="topPlayers[i].avatar" width="48px" position="center top" contain>{{ topPlayers[i].name }}</v-img>
                    <v-icon class="players-bet" :key="`icon-${ color }`" :color="color">lens</v-icon>
                </template>
            </template>
        </v-img>
        <div :class="['result-board result-cards', (DragonTigerItems[winner] === DragonTigerItems.Tie) && 'result-tie']">
            <v-img v-show="isVisibleCards" :class="['result-board result-blue', (DragonTigerItems[winner] === DragonTigerItems.Dragon) && 'result-win', (winner === DragonTigerItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-blue.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.dragon") }}</div>
                <div class="board-result">{{ cardResults[0] === -1 ? '' : cardResults[0] }}</div>
                <v-img :class="['table-card', 'card-blue-0']" :src="cardImages.blue[0]" width="48px" height="68px" contain @click="isSqueeze && isBlueHighestBidder ? onFlipCard('blue', 0, tableData.game.cards.dragon) : null" />
            </v-img>
            <v-img v-show="isVisibleCards" :class="['result-board result-red', (DragonTigerItems[winner] === DragonTigerItems.Tiger) && 'result-win', (winner === DragonTigerItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-red.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.tiger") }}</div>
                <div class="board-result">{{ cardResults[1] === -1 ? '' : cardResults[1] }}</div>
                <v-img :class="['table-card', 'card-red-0']" :src="cardImages.red[0]" width="48px" height="68px" contain @click="isSqueeze && isRedHighestBidder ? onFlipCard('red', 0, tableData.game.cards.tiger) : null" />
            </v-img>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

import { DragonTigerItems, TableData } from "@/models/helper/types";
import { Howl, Howler } from "howler";

import ResultMixin from "@/views/games/common/mixins/resultMixin";

@Component({ components: {}})
export default class DragonTigerResult extends Mixins(ResultMixin)
{
    isFlips = {
        blue: [false],
        red: [false],
    };

    cardImages = {
        blue: [require(`@/assets/images/games/cards/img_back-blue.png`)],
        red: [require(`@/assets/images/games/cards/img_back-red.png`)],
    };

    cardResults = [-1, -1];


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait)
                 Utils.addStyles("#dragontiger-result", { top: `${ appHeight * 0.35 + 13 }px`, height: `${ appHeight * 0.45 - 60 }px` });
            else Utils.addStyles("#dragontiger-result", { bottom: `${ (window.innerHeight - appHeight) + 10 }px`, height: `${ appHeight * 0.45 - 60 }px` });
        }
        else Utils.addStyles("#baccarat-result", { bottom: "", height: "", top: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    calculateTotalValue(cards: { [key: string]: { value: number }}) {
        if (cards) {
            if (cards.dragonValue) {
                this.cardResults[0] = cards.dragonValue.value;
            }
            if (cards.tigerValue) {
                setTimeout(() => this.cardResults[1] = cards.tigerValue.value, 400);
            }
        }
    }

    playResultSounds() {
        this.mediaCtrl.dragonTigerSound.play(`dragon${ this.cardResults[0] }`);

        setTimeout(() => this.mediaCtrl.dragonTigerSound.play(`tiger${ this.cardResults[1] }`), 1500);
        setTimeout(() => {
            const winner: any = this.winner;

                 if (winner === DragonTigerItems[0]) this.mediaCtrl.dragonTigerSound.play("dragonWin");
            else if (winner === DragonTigerItems[1]) this.mediaCtrl.dragonTigerSound.play("tigerWin");
            else if (winner === DragonTigerItems[2]) this.mediaCtrl.dragonTigerSound.play("tie");
        }, 3000);
    }

// #[Computed] ---------- + ---------- + ----------
    get DragonTigerItems() { return DragonTigerItems; }
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

#dragontiger-result {
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

        &.result-players {
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
            .players-avatar {
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
            .players-bet {
                position: relative;
                z-index: -1;

                margin-right: 10px;
                bottom: 55px;
                right: 2.5px;

                font-size: 14px;
            }
        }

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
                    height: 60px;

                    font-size: 24px;
                    font-weight: bold;
                    line-height: 60px;
                    text-shadow: 1px 1px #000000;
                    
                    @include xxs-only {
                        font-size: 18px;
                    }
                    @include land-only {
                        line-height: 45px;
                    }
                }
                .board-result {
                    font-size: 36px;
                    color: $c-main;

                    @include xxs-only {
                        font-size: 32px;
                    }
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

                &.card-blue-2 { z-index: 1; transform: rotate(-90deg); }
                &.card-red-2  { z-index: 1; transform: rotate( 90deg); }

                &.card-hidden {
                    width: 0 !important;
                }

                @include land-only {
                    margin-top: 1px;
                }
                @include xxs-only {
                    margin-top: 20px;

                    width: 40px !important;
                    height: 58px !important;

                    &.card-blue-2 { width: 60px !important; }
                    &.card-red-2  { width: 64px !important; }
                }
            }
        }
    }
}
</style>
