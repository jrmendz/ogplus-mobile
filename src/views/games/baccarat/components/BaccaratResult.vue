<template>
    <div id="baccarat-result" :class="[tableState.isEmcee && 'is-emcee']">
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
        <div :class="['result-board result-cards', (BaccaratItems[winner] === BaccaratItems.Tie) && 'result-tie']">
            <v-img v-show="isVisibleCards" :class="['result-board result-blue', (BaccaratItems[winner] === BaccaratItems.Player) && 'result-win', (winner === BaccaratItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-blue.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.player") }}</div>
                <div class="board-result">{{ cardResults[0] === -1 ? '' : cardResults[0] }}</div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card', `card-blue-${ 3 - i }`, (i === 1 && hidden3rd.blue) ? 'card-hidden3rd' : '']"
                    :src="cardImages.blue[3 - i]" :width="(i === 1) ? '74px' : '48px'" height="68px" contain @click="isSqueeze && isBlueHighestBidder ? onFlipCard('blue', 3 - i, currentTableData.game.cards.player[`card${ 4 - i }`], true, true) : null" />
            </v-img>
            <v-img v-show="isVisibleCards" :class="['result-board result-red', (BaccaratItems[winner] === BaccaratItems.Banker) && 'result-win', (winner === BaccaratItems.Tie) && 'result-tie']"
                   :src="require(`@/assets/images/games/result/img_resultBoard-red.png`)" width="52%" height="145px">
                <div class="board-title">{{ $t("tableAreas.banker") }}</div>
                <div class="board-result">{{ cardResults[1] === -1 ? '' : cardResults[1] }}</div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card', `card-red-${ i - 1 }`, (i === 3 && hidden3rd.red) ? 'card-hidden3rd' : '']"
                    :src="cardImages.red[i - 1]" :width="(i === 3) ? '74px' : '48px'" height="68px" contain @click="isSqueeze && isRedHighestBidder ? onFlipCard('red', i - 1, currentTableData.game.cards.banker[`card${ i }`], true, true) : null" />
            </v-img>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import Utils from "@/models/helper/utils";
import Events, { BaccaratItems, TableData, TableStatus } from "@/models/helper/types";

import { Howl, Howler } from "howler";

import ResultMixin from "@/views/games/common/mixins/resultMixin";

@Component({ components: {}})
export default class BaccaratResult extends Mixins(ResultMixin)
{
    /** Hides 3rd card */
    hidden3rd = { blue: true, red: true };

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

    cardResults = [-1, -1];

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { immediate: true }) onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.hidden3rd = { blue: true, red: true };
                break;
        }
    }
    
// #[Life Cycle] ---------- + ---------- + ----------
    

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                if (this.tableState.isEmcee)
                     Utils.addStyles("#baccarat-result", { bottom: `${ (window.innerHeight - appHeight) + 5 }px`, height: `${ appHeight * 0.4 - 120 }px` });
                else Utils.addStyles("#baccarat-result", { top: `${ appHeight * 0.35 + 13 }px`, height: `${ appHeight * 0.45 - 60 }px` });
            }
            else Utils.addStyles("#baccarat-result", { bottom: `${ (window.innerHeight - appHeight) + 10 }px`, height: `${ appHeight * 0.45 - 60 }px` });
        }
        else Utils.addStyles("#baccarat-result", { bottom: "", height: "", top: "" });
    }

    onShow3rdCard(type: "blue" | "red") {
        this.hidden3rd[type] = false;
    }

// #[Methods] ---------- + ---------- + ----------
    squeezeFunctions(status: TableStatus) {
        switch (status) {
            case "squeeze_start":
                let squeezeArea;
                if (this.isBlueHighestBidder && this.isRedHighestBidder) squeezeArea = `${ this.$t("tableAreas.player") }`;
                else if (this.isBlueHighestBidder) squeezeArea = this.$t("tableAreas.player");
                else if (this.isRedHighestBidder) squeezeArea = this.$t("tableAreas.banker");

                this.eventBus.$emit(Events.ON_BET_MSG_TOAST, squeezeArea ? this.$t("betToast.state.squeeze", [squeezeArea]) : this.$t("betToast.state.standby"), undefined, 3000);
                break;

            case "squeezep_start":
                this.hidden3rd.blue = false;
                this.eventBus.$emit(Events.ON_BET_MSG_TOAST,
                                    this.isBlueHighestBidder ? this.$t("betToast.state.squeeze", [this.$t("tableAreas.player")]) : this.$t("betToast.state.standby"),
                                    undefined, 3000);
                break;

            case "squeezeb_start":
                this.hidden3rd.red = false;
                if (this.isBlueHighestBidder && this.isRedHighestBidder) return;

                this.eventBus.$emit(Events.ON_BET_MSG_TOAST,
                                    this.isRedHighestBidder ? this.$t("betToast.state.squeeze", [this.$t("tableAreas.banker")]) : this.$t("betToast.state.standby"),
                                    undefined, 3000);
                break;
        }
    }

    calculateTotalValue(cards: { [key: string]: { [card: string]: string | { value: number } | null }}) {
        let blueTotal = 0;
        let redTotal = 0;

        // Gather all `card-value` keys
        if (cards && cards.player) {
            Object.entries(cards.player as { [card: string]: { value: number }}).forEach(([key, cardValue]) => {
                if (cardValue && typeof cardValue === "object" && "value" in cardValue)
                    blueTotal = (blueTotal + (cardValue.value || 0)) % 10;
            });
            this.cardResults[0] = blueTotal;
        }
        if (cards && cards.banker) {
            Object.entries(cards.banker as { [card: string]: { value: number }}).forEach(([key, cardValue]) => {
                if (cardValue && typeof cardValue === "object" && "value" in cardValue)
                    redTotal = (redTotal + (cardValue.value || 0)) % 10;
            });
            setTimeout(() => this.cardResults[1] = redTotal, 400); 
        }  
    }

    playResultSounds() {
        this.mediaCtrl.baccaratSound.play(`player${ this.cardResults[0] }`);
        
        setTimeout(() => this.mediaCtrl.baccaratSound.play(`banker${ this.cardResults[1] }`), 1500);
        setTimeout(() => {
            const winner: any = this.winner;

                 if (winner === BaccaratItems[0]) this.mediaCtrl.baccaratSound.play("playerWin");
            else if (winner === BaccaratItems[1]) this.mediaCtrl.baccaratSound.play("bankerWin");
            else if (winner === BaccaratItems[2]) this.mediaCtrl.baccaratSound.play("tie");
        }, 3000);
    }

// #[Computed] ---------- + ---------- + ----------
    get BaccaratItems() { return BaccaratItems; }
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

#baccarat-result {
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

                &.card-hidden3rd {
                    width: 0 !important;
                }

                @include land-only {
                    margin-top: 1px;
                }
                @include xxs-only {
                    margin-top: 20px;

                    width: 42px !important;
                    height: 58px !important;

                    &.card-blue-2 { width: 60px !important; }
                    &.card-red-2  { width: 64px !important; }

                    &.card-hidden3rd {
                        width: 0 !important;
                    }
                }
            }
        }
    }
}
#baccarat-result.is-emcee {
    top: unset;
    bottom: 5px;
    height: calc(40% - 120px);
}
</style>
