<template>
    <v-container id="history-result" :class="historyData.gameCode" pa-2 @click="onClose && onClose()">
        <div><span class="item-title">{{ this.$t("subSetting.history.betCode") }}: </span>{{ historyData.betCode }}</div>
        <div><span class="item-title">{{ this.$t("subSetting.history.betArea") }}: </span>{{ betArea }}</div>
        <template v-if="visibleResult.baccarat || visibleResult.dragontiger">
            <div class="result-blue-history">
                <div class="board-title">
                    {{ label[0] }}{{  cardResults[0] === -1 || (cardResults[0] != 0 && !cardResults[0]) ? '' : ': ' }}<span>{{ cardResults[0] === -1 ? '' : cardResults[0] }}</span>
                </div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card-history', `card-blue-${ 3 - i }`, cardImages.blue[3 - i] || 'card-hidden']"
                    :src="cardImages.blue[3 - i] || ''" :width="(i === 1) ? '62px' : '42px'" height="60px" contain />
            </div>
            <div class="result-red-history">
                <div class="board-title">
                    {{ label[1] }}{{ cardResults[1] === -1 || (cardResults[1] != 0 && !cardResults[1]) ? '' : ': ' }}<span>{{ cardResults[1] === -1 ? '' : cardResults[1] }}</span>
                </div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card-history', `card-red-${ i - 1 }`, cardImages.red[i - 1] || 'card-hidden']"
                    :src="cardImages.red[i - 1] || ''" :width="(i === 3) ? '62px' : '42px'" height="60px" contain />
            </div>
        </template>
        <template v-if="visibleResult.threecards">
            <div class="result-blue-history">
                <div class="board-title">
                    {{ label[0] }}{{ cardResults[0] === -1 || !cardResults[0] ? '' : ': ' }}<span>{{ cardResults[0] === -1 ? '' : cardResults[0] }}</span>
                </div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card-history', `card-blue-${ i - 1 }`, cardImages.blue[i - 1]]"
                    :src="cardImages.blue[i - 1]" width="42px" height="60px" contain />
            </div>
            <div class="result-red-history">
                <div class="board-title">
                    {{ label[1] }}{{ cardResults[1] === -1 || !cardResults[1] ? '' : ': ' }}<span>{{ cardResults[1] === -1 ? '' : cardResults[1] }}</span>
                </div>
                <v-img v-for="i in 3" :key="i"
                    :class="['table-card-history', `card-red-${ i - 1 }`, cardImages.red[i - 1]]"
                    :src="cardImages.red[i - 1]" width="42px" height="60px" contain />
            </div>
        </template>
        <template v-if="visibleResult.niuniu">
            <div class="result-blue-history">
                <div class="board-title">
                    {{ label[0] }}{{ !cardResults[0] ? '' : ': ' }}<span>{{ cardResults[0] === -1 ? '' : cardResults[0] }}</span>
                </div>
                <template v-for="i in 5">
                    <v-img :key="i" :class="['table-card-history', `card-blue-${ i - 1 }`, cardImages.red[i - 1] || 'card-hidden']"
                        :src="cardImages.blue[i - 1] || ''" width="34px" height="48px" contain />
                    <br v-if="i === 3" :key="`br-${ i }`">
                </template>
            </div>
            <div class="result-red-history">
                <div class="board-title">
                    {{ label[1] }}{{ !cardResults[1] ? '' : ': ' }}<span>{{ cardResults[1] === -1 ? '' : cardResults[1] }}</span>
                </div>
                <template v-for="i in 5">
                    <v-img :key="i" :class="['table-card-history', `card-red-${ i - 1 }`, cardImages.red[i - 1] || 'card-hidden']"
                        :src="cardImages.red[i - 1] || ''" width="34px" height="48px" contain />
                    <br v-if="i === 3" :key="`br-${ i }`">
                </template>
            </div>
        </template>
        <template v-if="visibleResult.moneywheel">
            <div v-if="spinResult.bonus > 1" class="img-coins-wrap">
                <v-img class="img-coins" :src="require(`@/assets/images/games/result/img_coins.png`)" width="100%" height="72px" contain />
                <div class="text-bonus">{{ `×${ spinResult.bonus }` }}</div>
            </div>
            <v-img v-if="!!spinResult.spin" :class="['img-spin-result', (spinResult.bonus > 1) && 'has-bonus']" :src="require(`@/assets/images/games/result/img_spin-result.png`)" width="40%" height="72px" contain>
                <div class="text-spin">{{ spinResult.spin === 40 ? "财" : spinResult.spin }}</div>
            </v-img>
        </template>
        <template v-if="visibleResult.roulette && rouletteResult >= 0">
            <v-img :class="['img-bean', (rouletteResult > 0) ? 'result-bean' : 'center-bean']" :src="require(`@/assets/images/games/road/roulette/img_s${ rouletteResult }.png`)" width="40%" height="72px" contain />
            <div v-if="rouletteResult > 0" class="result-text">
                <div>{{ $t(`tableAreas.roulette.${ (rouletteResult % 2 === 0) ? "even" : "odd" }`) }}</div>
                <div>{{ $t(`tableAreas.roulette.${ (rouletteResult > 18) ? "big" : "small" }`) }}</div>
                <br/>
                <div>{{ $t(`tableAreas.roulette.rows[${ (rouletteResult - 1) % 3 }]`).replace("{n}", " ") }}</div>
                <div>{{ $t(`tableAreas.roulette.dozen[${ rouletteResult / 12 >> 0 }]`).replace("{n}", " ") }}</div>
            </div>
        </template>
        <v-img class="close-result-card" :src="require(`@/assets/images/settings/img_close-black.svg`)" aspect-ratio="1" width="18px" height="18px" contain />
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TranslateResult } from "vue-i18n";

import { HistoryData, GameTypes } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    visibleResult: { [key: string]: boolean } = { baccarat: false, dragontiger: false, moneywheel: false, roulette: false, threecards: false, niuniu: false };

    // For Baccarat, DT, Threecards
    cardImages: { [key: string]: any[] } = {
        blue: [
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
    cardResults: (number | string | TranslateResult)[] = [-1, -1];
    label: (string | TranslateResult)[] = ["", ""];    // can contain `TranslateResult` type

    // For Moneywheel
    spinResult = { bonus: 1, spin: 0 };

    // For Roulette
    rouletteResult = -1;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly historyData!: HistoryData;
    @Prop() readonly onClose!: () => void;

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    beforeMount() {
        this.updateResult();
    }

// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    updateResult() {
        this.visibleResult[this.historyData.gameCode] = true;
        this.serializeGameValues(this.historyData.gameCode);
    }

    serializeGameValues(game: string) {
        const gameValues = this.historyData.gameValues;

        switch (game) {
            case GameTypes.Baccarat:
                this.label = [this.$t("tableAreas.player"), this.$t("tableAreas.banker")];

                if (!gameValues || Object.keys(gameValues).length === 0) return;

                for (const [key, value] of Object.entries(gameValues)) {
                    let count = 0;
                    const color = (key === "playerCards" ? "blue" : "red");
                    for (const card of (value as string).split(",")) {
                        if (!!card) this.getCardImage(card, count++, color);
                        else this.cardImages[color][count] = null;
                    }
                }
                this.cardResults = this.cardResults.map(a => (+a + 1) % 10);
                break;

            case GameTypes.DragonTiger:
                this.label = [this.$t("tableAreas.dragon"), this.$t("tableAreas.tiger")];
                this.cardImages.blue.length = 1;
                this.cardImages.red.length = 1;

                if (!gameValues || Object.keys(gameValues).length === 0) return;

                for (const [key, value] of Object.entries(gameValues)) {
                    const color = (key === "dragonCards" ? "blue" : "red");
                    this.getCardImage(value as string, 0, color);
                }
                this.cardResults = this.cardResults.map(a => (+a + 1));
                break;

            case GameTypes.Moneywheel:
                if (gameValues && gameValues.values) {
                    const mwResult = gameValues.values.split(",");
                    this.spinResult = {
                        bonus: mwResult.length > 1 ? Math.pow(3, mwResult.length - 1) : 0,
                        spin: mwResult[mwResult.length - 1] === "og" ? 40 : mwResult[mwResult.length - 1],
                    };
                }
                break;

            case GameTypes.Roulette:
                if (!gameValues) return;
                this.rouletteResult = +gameValues.value;
                break;

            case GameTypes.ThreeCards:
                this.label = [this.$t("tableAreas.dragon").toString().charAt(0), this.$t("tableAreas.phoenix").toString().charAt(0)];

                if (!gameValues) return;

                for (const [key, value] of Object.entries(gameValues)) {
                    if (!key.includes("Cards")) continue;

                    let count = 0;
                    const color = key === "dragonCards" ? "blue" : "red";
                    for (const card of (value as string).split(",")) {
                        if (!!card) this.getCardImage(card, count++, color);
                        else this.cardImages[color][count] = null;
                    }
                }
                this.cardResults = [this.getThreecardsResult(0), this.getThreecardsResult(1)];
                break;

            case GameTypes.Niuniu:
                const betAreaId = this.historyData.betArea.match(/\d+/)![0];
                this.label = [`${ this.$t("tableAreas.player").toString().charAt(0) } ${ betAreaId }`, this.$t("tableAreas.banker").toString().charAt(0)];

                if (!gameValues) return;

                for (const [key, value] of Object.entries(gameValues)) {
                    if (key !== "banker" && key !== `player${ betAreaId }`) continue;

                    let count = 0;
                    const color = key === "banker" ? "red" : "blue";
                    for (const card of (value as string).split(",")) {
                        if (!!card) this.getCardImage(card, count++, color);
                        else this.cardImages[color][count] = null;
                    }
                }
                this.cardResults = [this.getNiuniuCardResult(gameValues[`player${ betAreaId }Result`]), this.getNiuniuCardResult(gameValues[`bankerResult`])];
                break;
        }
    }

    /** Compute to know which card image to show depending on the card string from backend */
    getCardImage(card: string, count: number, color: string) {
        const suitCase: { [key: string]: string } = { c: "club", d: "diamond", h: "heart", s: "spade" };
        const valueEquivalent: { [key: string]: number } = { A: 1, J: 11, Q: 12, K: 13 };

        const suit = card.slice(-1).toLowerCase();
        let value: number | string = card.substring(0, card.length - 1);
            value = isNaN(+value) ? valueEquivalent[value] : value;

        this.getCardValues(+value, color);
        this.cardImages[color][count] = require(`@/assets/images/games/cards/sidebar/${ suitCase[suit] }/${ suit }${ value }.png`);
    }
    
    getCardValues(cardValue: number, color: string) {
        const index = (color === "blue" ? 0 : 1);

        if (cardValue > 9 && this.historyData.gameCode === GameTypes.Baccarat) cardValue = 0;

        (this.cardResults[index] as number) += cardValue;
    }

    getThreecardsResult(index: number) {
        const result = this.historyData.gameValues[`${ index === 0 ? "dragon" : "phoenix" }Result`];
        if (result && typeof result === "string") {
            const [type, rank] = result.split("-");
            return this.$t(`threecardsTypes.${ type.toLowerCase() }`, [rank]);
        }
        return "";
    }

    getNiuniuCardResult(result: string) {
        if (result && typeof result === "string") {
            switch (result) {
                case "NB": return this.$t("niuniuTypes.noBull");
                case "BB": return this.$t("niuniuTypes.bullBull");
                case "5P": return this.$t("niuniuTypes.fivePeople");
                default  : return this.$t("niuniuTypes.bull", [this.$t(`number.${ result[1] }`).toString()]);
            }
        }
        return "";
    }

// #[Computed] ---------- + ---------- + ----------
    get betArea() {
        const betArea = this.historyData.betArea;
        if (!betArea) return "";

        // For ThreeCards, Niuniu
        if (betArea.includes("3c-")) {
            /** format the betArea, ex. `3c-phoenix` to `phoenix` and `PHOENIX` */
            const ba = betArea.substr("3c-".length);
            const t = this.$t(`tableAreas.${ ba }`);
            return t === ba.toUpperCase() ? (ba.charAt(0).toUpperCase() + ba.substr(1)) : t;
        }
        else if (betArea.includes("niu-")) {
            /** format the betArea, ex. `niu-p1-double` to `p`, `1` and `double` */
            const ba = betArea.substr("niu-".length);
            return this.$t(`tableAreas.niuniu.${ ba.charAt(0) === "p" ? "player" : "banker" }`) + ba.charAt(1) + " " + this.$t(`tableAreas.niuniu.${ ba.substr(3) }`);
        }

        // For Roulette
        const rouBa = betArea.match(/([a-z]+)(\d+)/);
        if (rouBa) {
            switch (rouBa[1]) {
                case "dozen":
                    return this.$t(`tableAreas.roulette.dozen.${ +rouBa[2] - 1 }`).toString().replace("{n}", " ");
                case "near": 
                    const num = +rouBa[2] + Math.ceil(+rouBa[2] / 2) - 1;
                    return this.$t("tableAreas.roulette.split") + ` (${ num }, ${ num + 1 })`;
                case "split":
                    return this.$t("tableAreas.roulette.split") + ` (${ rouBa[2] }, ${ +rouBa[2] + 3 })`;
                case "zero":
                    return this.$t("tableAreas.roulette.split") + ` (0, ${ rouBa[2] })`;
                case "s":
                    return this.$t("tableAreas.roulette.single") + ` ${ rouBa[2] }`;
                default:
                    return this.$t(`tableAreas.roulette.${ rouBa[1] }`) + ` ${ rouBa[2] }`;
            }
        }

        switch (betArea) {
            // For Baccarat
            case "player_pair":
                return this.$t("tableAreas.ppair") === "P PAIR" ? "Player Pair" : this.$t("tableAreas.ppair");
            case "banker_pair":
                return this.$t("tableAreas.bpair") === "B PAIR" ? "Banker Pair" : this.$t("tableAreas.bpair");
            case "super_six":
                return this.$t("tableAreas.super6") === "SUPER 6" ? "Super 6" : this.$t("tableAreas.super6");

            // For Moneywheel
            case "og":
                return "财";

            // For Roulette
            case "small":
            case "big":
            case "even":
            case "odd":
            case "red":
            case "black":
                return this.$t(`tableAreas.roulette.${ betArea }`);

            // For other games
            default:
                if (isNaN(+betArea))
                    return (this.$i18n.locale !== "cn") ? Utils.fixCase(betArea, "pascal") : this.$t(`tableAreas.${ betArea }`);
                
                return betArea;
        }
    }
}
</script>

<style lang="scss">
#history-result {
    position: absolute;
    z-index: 1;

    bottom: 10px;
    width: 95%;
    height: 150px;

    border-radius: 5px;
    background: radial-gradient(ellipse at center, rgba(#dbdce2, 0.95) 21%, rgba(#b8bac6, 0.95) 92%);

    color: #555555;
    font-weight: bold;
    line-height: 20px;

    @include land-only {
        width: 60%;
    }

    .item-title {
        color: #000000;
    }

    .result-blue-history, .result-red-history {
        position: absolute;
        width: 50%;

        .v-image {
            margin: 0;
        }
        .board-title {
            font-size: 16px;
            font-weight: bold;
            line-height: 30px;

            color: #000000;

            span {
                color: #000;
            }
        }

        &.result-win {
            z-index: 1;
        }
    }
    .result-blue-history {
        left: 0;
        border-right: 0.5px solid rgba(#000000, 0.9);
    }
    .result-red-history {
        right: 0;
    }

    .table-card-history {
        display: inline-block;
        margin-top: 12.5px;

        &.card-blue-2 { z-index: 1; transform: rotate(-90deg); }
        &.card-red-2  { z-index: 1; transform: rotate( 90deg); }

        &.card-hidden {
            width: 0 !important;
        }
    }

    .close-result-card {
        position: absolute;
        right: 6.5px;
        top: 6.5px;
    }

    .img-coins-wrap {
        position: absolute;
        width: 40%;
        height: 72px;
        left: 10%;
        top: 60px;

        .text-bonus {
            position: absolute;
            left: 42.5px;
            top: 17.5px;
            width: 50px;
            height: 26px;

            text-shadow: 0 1px 0.05px #333333;

            color: $c-main;
            font-weight: bold;
            font-size: 24px;
            line-height: 28px;
        }
    }
    .img-spin-result {
        position: absolute;
        right: 30%;
        top: 60px;

        &.has-bonus {
            right: 10%;
        }

        .text-spin {
            position: absolute;
            top: 30px;
            right: 2.5px;
            width: 110px;
            height: 26px;

            text-shadow: 0 1px 0.05px #333333;

            color: $c-main;
            font-weight: bold;
            font-size: 28px;
            line-height: 32px;
        }
    }

    .img-bean {
        position: absolute;
        right: 10%;
        top: 60px;

        &.center-bean {
            right: calc(50% - 72px);
        }
        &.result-bean {
            right: unset;
            left: 0%;
        }
    }
    .result-text {
        position: absolute;
        right: 10%;
        top: 55px;

        div {
            display: inline-block;
            width: 85px;
            height: 35px;
            margin: 2.5px;
            line-height: 35px;

            color: #ffffff;
            background: rgba(#000000, 0.75);
            border-radius: 5px;
        }
    }
}
#history-result.niuniu {
    height: 190px;

    .table-card-history {
        &.card-blue-2 { transform: unset; }
        &.card-red-2  { transform: unset; }
    }
}

#history-result.threecards {
    .table-card-history {
        &.card-blue-2 { transform: none; width: 42px !important; }
        &.card-red-2  { transform: none; width: 42px !important; }
    }
}
</style>
