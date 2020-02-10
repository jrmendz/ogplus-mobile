<template>
    <v-flex class="mini-table-card" xs12>
        <v-card fluid flat>
            <v-layout class="card-header" row wrap justify-space-between caption>
                <v-flex class="table-id" xs3 text-xs-left pl-3><span>{{ tableNumber }}</span></v-flex>
                <v-flex class="point" xs6><span>{{ tableName }}</span></v-flex>
                <v-flex xs3 />
                <v-progress-circular class="table-time" :value="`${ (countdown / maxTime * 100) }`" size="20" width="2" :color="timerColor">
                    <span ref="timer">{{timer ? timer.toFixed(0) : 0}}</span>
                </v-progress-circular>
            </v-layout>
            <v-layout class="dealer-road" row wrap>
                <v-flex v-if="currBetState === BetStates.Roadmap" class="dealer-road-map" xs12>
                    <RoadMapMini ref="roadmap" :gameType="tableData.code" :tableNumber="tableNumber" />
                </v-flex>
                <v-flex v-else-if="currBetState === BetStates.Betting" class="dealer-bet" xs12>
                    <MoneywheelTableMini v-if="isMoneywheel" :tableNumber="tableNumber" :game="'moneywheel'" />
                    <DragonTigerTableMini v-else-if="isDragonTiger" :tableNumber="tableNumber" :game="'dragontiger'"/>
                    <ThreeCardsTableMini v-else-if="isThreeCards" :tableNumber="tableNumber" :game="'threecards'"/>
                    <BaccaratTableMini v-else :currStatus="tableData.status" :tableNumber="tableNumber" :game="'baccarat'"/>
                </v-flex>
                <v-flex v-else-if="currBetState === BetStates.Shuffling" class="dealer-dealing" xs12>
                    <v-img class="dealing-icon" :src="require(`@/assets/images/games/bet/img_dealing.svg`)" height="52px" contain />
                    <div class="dealing-text">{{ $t("waiting.shuffling") + "..." }}</div>
                </v-flex>
                <v-flex v-else-if="currBetState === BetStates.Dealing || currBetState === BetStates.Squeeze" class="dealer-dealing" xs12>
                    <template v-if="isMoneywheel">
                        <v-img class="spinning-icon" :src="require(`@/assets/images/games/bet/img_spinning.svg`)" height="52px" contain />
                        <div class="dealing-text">{{ $t("waiting.spinning") + "..." }}</div>
                    </template>
                    <template v-else-if="isRoulette">
                        <v-img class="spinning-icon" :src="require(`@/assets/images/games/bet/img_spinning.svg`)" height="52px" contain />
                        <div class="dealing-text">{{ $t("waiting.dealing") + "..." }}</div>
                    </template>
                    <template v-else>
                        <v-img class="dealing-icon" :src="require(`@/assets/images/games/bet/img_dealing.svg`)" height="52px" contain />
                        <div class="dealing-text">{{ $t("waiting.dealing") + "..." }}</div>
                    </template>
                </v-flex>
                <template v-else>
                    <template v-if="isMoneywheel">
                        <div class="result-moneywheel">
                            <v-img v-show="moneywheel.bonus > 1" class="img-coins" :src="require(`@/assets/images/games/result/img_coins.png`)" width="80px" height="80px" contain>
                                <div class="text-bonus">x{{ moneywheel.bonus }}</div>
                            </v-img>
                            <v-img v-show="moneywheel.spin > 0" :class="`img-spin-result ${ (moneywheel.bonus > 1) && 'has-bonus' }`" :src="require(`@/assets/images/games/result/img_spin-result.png`)" width="80px" height="80px" position="center bottom" contain>
                                <div class="text-spin">{{ moneywheel.spin === 40 ? "财" : moneywheel.spin }}</div>
                            </v-img>
                        </div>
                    </template>
                    <template v-else-if="isRoulette">
                        <div class="result-moneywheel">
                            <v-img :class="`img-spin-result`" :src="require(`@/assets/images/games/road/roulette/img_s${ roulette.value }.png`)" width="80px" height="80px" contain></v-img>
                        </div>
                    </template>
                    <template v-else-if="isNiuniu">
                        <div class="result-niuniu">
                            <div v-for="i in 4" :key="i" class="result-title">
                                <template v-if="i === 1">
                                    <div>{{ $t("tableAreas.banker").charAt(0) }}</div>
                                    <v-img v-for="j in 5" :key="j" :class="['mini-card', `card-niuBanker-${ j - 1 }`, tableNumber]"
                                           :src="cardImages.red[j - 1]" width="26px" height="30px" contain />
                                </template>
                                <template v-else>
                                    <div>{{ `${ $t("tableAreas.player").charAt(0) } ${ i - 1 }` }}</div>
                                    <v-img v-for="j in 5" :key="j" :class="['mini-card', `card-niuPlayer${ i - 1 }-${ j - 1 }`, tableNumber]"
                                           :src="cardImages[`blue${ i - 1 }`][j - 1]" width="26px" height="30px" contain />
                                </template>
                                <div class="result-text">{{ niuResults[i - 1] ? getNiuniuCardResult(niuResults[i - 1]) : '' }}</div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <template v-if="isBaccarat">
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.player") }}{{ cardResults[0] === -1 ? '' : ': ' + cardResults[0]}}</div>
                                <v-img v-for="i in 3" :key="i" :class="['mini-card', `card-blue-${ i - 1 }`, (i === 3 && hidden3rd.player) ? 'card-hidden3rd' : '', tableNumber]"
                                       :src="cardImages.blue1[i - 1]" width="52px" height="52px" contain />
                            </v-flex>
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.banker") }}{{ cardResults[1] === -1 ? '' : ': ' + cardResults[1]}}</div>
                                <v-img v-for="i in 3" :key="i" :class="['mini-card', `card-red-${ i - 1 }`, (i === 3 && hidden3rd.banker) ? 'card-hidden3rd' : '', tableNumber]"
                                       :src="cardImages.red[i - 1]" width="52px" height="52px" contain />
                            </v-flex>
                        </template>
                        <template v-else-if="isThreeCards">
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.dragon").charAt(0) }}{{ (cardResults[0] ? ': ' : '') + getThreeCardsResult(cardResults[0]) }}</div>
                                <v-img v-for="i in 3" :key="i" :class="['mini-card', `card-dragon-${ i - 1 }`, tableNumber]"
                                       :src="cardImages.blue1[i - 1]" width="46px" height="46px" contain />
                            </v-flex>
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.phoenix").charAt(0) }}{{ (cardResults[1] ? ': ' : '') + getThreeCardsResult(cardResults[1]) }}</div>
                                <v-img v-for="i in 3" :key="i" :class="['mini-card', `card-phoenix-${ i - 1 }`, tableNumber]"
                                       :src="cardImages.red[i - 1]" width="46px" height="46px" contain />
                            </v-flex>
                        </template>
                        <template v-else>
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.dragon") }}{{ cardResults[0] === -1 ? '' : ': ' + cardResults[0]}}</div>
                                <v-img :class="['mini-card', `card-dragon`, tableNumber]"
                                       :src="cardImages.blue1[0]" width="68px" height="68px" contain />
                            </v-flex>
                            <v-flex class="result-title" xs6>
                                <div>{{ $t("tableAreas.tiger") }}{{ cardResults[1] === -1 ? '' : ': ' + cardResults[1]}}</div>
                                <v-img :class="['mini-card', `card-tiger`, tableNumber]"
                                       :src="cardImages.red[0]" width="68px" height="68px" contain />
                            </v-flex>
                        </template>
                        <div class="winner-mask winner-blue" v-if="winner === 'player' || winner === 'dragon'">{{ $t("winner.win") }}</div>
                        <div class="winner-mask winner-red"  v-if="winner === 'banker' || winner === 'tiger' || winner === 'phoenix'">{{ $t("winner.win") }}</div>
                        <div class="winner-mask winner-tie"  v-if="winner === 'tie'">{{ $t("winner.tie") }}</div>
                    </template>
                </template>
            </v-layout>
            <v-layout class="card-bottom" row wrap align-content-center>
                <v-flex v-if="currBetState === BetStates.Roadmap" offset-xs1-16 xs14-16>
                    <v-btn class="button" :class="{ inactive: tableState.hasConfirmBets(userInfo.tableSelection.tableNumber) }" color="#975e0e" @click="onEnter()">{{ $t("sidebar.enter") }}</v-btn>
                    <v-btn v-if="!isRoulette && !isNiuniu" class="button" color="#975e0e" @click="onChangeBetMode(true)">{{ $t("sidebar.bet") }}</v-btn>
                </v-flex>
                <template v-else-if="currBetState === BetStates.Betting">
                    <v-flex v-for="(key, i) in betActions" :key="key" :class="['bet-action', `offset-item${ i }`]" xs5>
                        <v-img :src="require(`@/assets/images/games/bet/img_bet${ key }.svg`)" height="16px" contain @click="onBetAction(key)" />
                    </v-flex>
                </template>
            </v-layout>
            <div :class="`sidebar-msg ${ betMsg.tableNum === tableNumber || 'hidden' }`">{{ betMsg.content }}</div>
        </v-card>
    </v-flex>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TranslateResult } from "vue-i18n";
import { TweenLite, TimelineLite, Back, Linear } from "gsap";

import { GameTypes, TableData, TableStatus } from "@/models/helper/types";
import Events from "@/models/helper/types";

import { Howl, Howler } from "howler";

import ModulesMixin from "@/models/mixins/modulesMixin";

const RoadMapMini = () => import("@/views/games/common/components/RoadMapMini.vue");
const BaccaratTableMini = () => import("@/views/games/baccarat/components/BaccaratTableMini.vue");
const DragonTigerTableMini = () => import("@/views/games/dragontiger/components/DragonTigerTableMini.vue");
const MoneywheelTableMini = () => import("@/views/games/moneywheel/components/MoneywheelTableMini.vue");
const ThreeCardsTableMini = () => import("@/views/games/threecards/components/ThreeCardsTableMini.vue");

enum BetActions { Confirm, Cancel }
enum BetStates { Roadmap, Betting, Shuffling, Dealing, ResultCard, ResultText, Squeeze }

type CardTypes = "red" | "blue1" | "blue2" | "blue3";

@Component({ components: { RoadMapMini, BaccaratTableMini, DragonTigerTableMini, MoneywheelTableMini, ThreeCardsTableMini }})
export default class TableCardMini extends Mixins(ModulesMixin)
{
    timerElement!: HTMLDivElement;

    /** Current Bet State */
    currBetState = BetStates.Dealing;

    countdown: number = 30;
    timerColor: string = "rgba(0, 255, 0, 0.8)";
    hidden3rd: { [key: string]: boolean } = { player: true, banker: true };

    cardImages = {
        red: [
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
            require(`@/assets/images/games/cards/img_back-red.png`),
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
    };

    winner: string = "";
    cardResults: (number | string | TranslateResult)[] = [-1, -1];
    niuResults: (string | TranslateResult)[] = ["", "", "", ""];

    moneywheel = { bonus: 0, spin: 3 };
    roulette = { result: "big,odd,red", timer: 5, value: "23" };

    betMsg: { tableNum: string, content: string } = { tableNum: "", content: "" };

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;
    @Prop() readonly tableData!: TableData;

// #[Watch] ---------- + ---------- + ----------
    @Watch("tableData.status", { immediate: true }) onStatusChanged(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.currBetState = BetStates.Roadmap;
                this.resetCards(this.tableData.code);
                this.cardResults = [-1, -1];
                this.niuResults = ["", "", "", ""];
                this.winner = "";
                this.startTimer();

                // Check to see if player have already bet
                this.onChangeBetMode(this.tableState.hasTableBets(this.tableNumber));
                break;

            case TableStatus.Dealing:
                this.currBetState = BetStates.Dealing;

                // Reset the temporary bet on sidebar when dealing
                this.userInfo.tempSbBalance(this.userInfo.tempSideBarBalance - this.tableState.tableTotalBets(this.tableNumber));
                this.resetCards(this.tableData.code);
                break;

            case TableStatus.SqueezeStart:
            case TableStatus.SqueezePlayerStart:
            case TableStatus.SqueezeBankerStart:
                this.startTimer();
                this.currBetState = BetStates.Squeeze;
                break;

            case TableStatus.SqueezeEnd:
            case TableStatus.SqueezeBankerEnd:
            case TableStatus.SqueezePlayerEnd:
                this.currBetState = BetStates.Squeeze;
                break;

            case TableStatus.Default:
                const gameResult = this.tableData.game.result.split(",")[0];

                switch (this.tableData.code) {
                    case GameTypes.Moneywheel:
                        this.moneywheel.bonus = Math.pow(this.tableData.game.values.split(",").length - 1, 3);
                        this.moneywheel.spin = (gameResult === "og") ? 40 : +gameResult;
                        break;
                    
                    case GameTypes.Roulette:
                        this.roulette = this.tableData.game as any;
                        break;

                    default:
                        setTimeout(() => this.drawCards(this.tableData.code, this.tableData.game.cards), 750);
                        setTimeout(() => this.winner = gameResult, 2500);
                        break;
                }

                this.currBetState = BetStates.ResultCard;
                this.tableState.initBets({ tableNumber: this.tableNumber });
                break;

            case TableStatus.Shuffling:
                this.currBetState = BetStates.Shuffling;
                break;
        }
    }

    @Watch("tableData.game.timer", { deep: true }) onTimerChanged(val: string, old: string) {
        if (+val <= 5) TweenLite.fromTo(this.timerElement, 0.5, { scale: 1.5 }, { scale: 1, ease: Back.easeOut });
        this.startTimer();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.timerElement = this.$refs.timer as HTMLDivElement;
        this.timer = (this.tableData.game && this.tableData.game.timer) ? this.tableData.game.timer : 0;

        // Check to see if player have already bet
        if (this.tableData.status === TableStatus.Betting) this.onChangeBetMode(this.tableState.hasTableBets(this.tableNumber));
        else if (this.tableData.status === TableStatus.Shuffling) this.currBetState = BetStates.Shuffling;
        
        this.eventBus.$on(Events.ON_BET_MSG_SIDEBAR, this.onBetMsgSidebar);
    }

    destroyed() {
        TweenLite.killTweensOf(this);
        TweenLite.killTweensOf(this.startTimer);
    }

// #[Events] ---------- + ---------- + ----------
    onEnter() {
        this.mediaCtrl.spotFxSound.play("click");
        this.eventBus.$emit(Events.ON_SIDEBAR, false);

        if (this.userInfo.isBalanceSufficient) {
            this.eventBus.$emit(Events.ON_TABLE_CHANGED);
            this.tableState.enterTable({ tableNumber: this.tableNumber, gameType: this.tableData.code, isBidding: this.tableData.subcode === "bidding", isEmcee: false });
            this.mediaCtrl.toggleVideo();

            setTimeout(() => {
                this.mediaCtrl.toggleVideo();
                this.mediaCtrl.toggleVideoSnd(true);
            }, 500);
        }
        else this.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, this.$t("messages.lobby.minCredit", [10]));
    }

    onChangeBetMode(isBetMode: boolean) {
        if (this.isRoulette) return;

        this.currBetState = isBetMode ? BetStates.Betting : BetStates.Roadmap;
    }

    onBetAction(key: string) {
        switch (key) {
            case BetActions[BetActions.Confirm]:
                const {tableNumber, tableData} = this;
                this.userInfo.tempSbBalance(this.userInfo.tempSideBarBalance - this.tableState.tableTotalBets(this.tableNumber));
                this.tableState.confirmBets({ tableNumber, tableId: tableData.id, gameSet: tableData.gameSet, shoeGame: tableData.shoeGame });
                this.eventBus.$on(Events.ON_BET_MSG_SIDEBAR, this.onBetMsgSidebar);
                break;

            case BetActions[BetActions.Cancel]:
                this.userInfo.tempSbBalance(this.userInfo.tempSideBarBalance - this.tableState.tableTotalBets(this.tableNumber));
                this.tableState.cancelBets(this.tableNumber);
                this.onChangeBetMode(this.tableState.hasTableBets(this.tableNumber));
                break;
        }
        this.$forceUpdate();
    }

    onBetMsgSidebar(msg: string, tableNumber: string) {
        this.eventBus.$off(Events.ON_BET_MSG_TOAST, this.onBetMsgSidebar);

        this.betMsg.tableNum = tableNumber;
        this.betMsg.content = msg;
        setTimeout(() => this.betMsg.tableNum = this.betMsg.content = "", 2000);
    }

// #[Methods] ---------- + ---------- + ----------
    resetCards(game: GameTypes) {
        if (game === GameTypes.Moneywheel) return;

        this.cardResults[0] = this.cardResults[1] = -1;
        this.niuResults[0] = this.niuResults[1] = this.niuResults[2] = this.niuResults[3] = "";
        delete this.tableData.game.cards;

        this.hidden3rd = { player: true, banker: true };

        // Reset image
        Object.keys(this.cardImages).forEach(key => {
            const cards = this.cardImages[key as CardTypes];
            const color = (key === "red" ? "red" : "blue");

            for (let i = cards.length - 1; i >= 0; --i)
                cards[i] = require(`@/assets/images/games/cards/img_back-${ color }.png`);
        });
    }

    drawCards(game: GameTypes, stack: any) {
        if (!stack) return;

        switch (game) {
            case GameTypes.Baccarat:
                Object.entries({ red: ["red", stack.banker], blue1: ["blue", stack.player] })
                      .forEach(([key, [className, value]]) => {
                          if (className === "red") setTimeout(() => this.onFlipCard(game, value, key as any, className), 300);
                          else this.onFlipCard(game, value, key as any, className);
                        });
                break;

            case GameTypes.DragonTiger:
                Object.entries({ blue1: ["dragon", stack.dragon], red: ["tiger", stack.tiger] })
                        .forEach(([key, [className, value]]) => {
                          if (className === "tiger") setTimeout(() => this.onFlipCard(game, value, key as any, className), 300);
                          else this.onFlipCard(game, value, key as any, className);
                        });
                break;

            case GameTypes.ThreeCards:
                Object.entries({ blue1: ["dragon", stack.dragon], red: ["phoenix", stack.phoenix] })
                      .forEach(([key, [className, value]]) => {
                          if (className === "phoenix") setTimeout(() => this.onFlipCard(game, value, key as any, className), 300);
                          else this.onFlipCard(game, value, key as any, className);
                      });
                break;
                
            case GameTypes.Niuniu:
                Object.entries({ red: ["niuBanker", stack.banker], blue1: ["niuPlayer1", stack.player1], blue2: ["niuPlayer2", stack.player2], blue3: ["niuPlayer3", stack.player3] })
                      .forEach(([key, [className, value]]) => this.onFlipCard(game, value, key as any, className));
                break;
        }
    }

    onFlipCard(game: GameTypes, cards: string | { [key: string]: any }, type: CardTypes, className: string) {
        //NOTE Add table number as class so other cards wont flip if they are all in the "default" phase
        let image: string;
        switch (game) {
            case GameTypes.Baccarat:
                Object.entries(cards).forEach(([key, value], index) => {
                    if (!value || key.includes("value")) return;
                    image = `.mini-card.card-${ className }-${ index }.${ this.tableNumber } .v-image__image`;
                
                    if (key === "card3") {
                        setTimeout(() => this.onShow3rdCard(type === "red" ? "banker" : "player"), 800);
                        setTimeout(() => this.tweenCard(image, value, type, index), 850);
                    }
                    else this.tweenCard(image, value, type, index);
                });
                break;

            case GameTypes.DragonTiger:
                image = `.mini-card.card-${ className }.${ this.tableNumber } .v-image__image`;
                this.tweenCard(image, cards as string, type);
                break;

            case GameTypes.ThreeCards:
            case GameTypes.Niuniu:
                Object.entries(cards).forEach(([key, value], index) => {
                    if (!value || key.includes("value") || !key.includes("card")) return;
                    
                    image = `.mini-card.card-${ className }-${ index }.${ this.tableNumber } .v-image__image`;
                    if (game === GameTypes.ThreeCards && key === "card3") setTimeout(() => this.tweenCard(image, value, type, index), 850);
                    else this.tweenCard(image, value, type, index);
                });
                break;
        }

        if (this.tableData.game.cards) this.calculateTotalValue(this.tableData.game.cards);
    }

    tweenCard(image: string, value: string, type: CardTypes, index = 0) {
        const flipTween = new TimelineLite();
              flipTween.fromTo(image, 0.15, { scaleX: 1 }, { scaleX: 0 })
                       .call(() => {
                            const cardImage = this.getCardImage(value);

                            this.cardImages[type][index] = cardImage;
                            this.$forceUpdate();
                       })
                       .fromTo(image, 0.15, { scaleX: 0 }, { scaleX: 0.925 });
    }

    calculateTotalValue(cards: { [key: string]: { [card: string]: string | { value: number } | null }}) {
        if (!cards) return;

        // Gather all `card-value` keys
        switch (this.tableData.code) {
            case GameTypes.Baccarat:
                const calcTotal = (cardsItem: { [card: string]: string | { value: number } | null }, index: number) => {
                    if (!cardsItem) return;

                    let total = 0;
                    Object.entries(cardsItem).forEach(([key, data]) => {
                        if (!data || typeof(data) === "string" || !data.value) return;
                        if (key !== "card3value") {
                            total = (total + (data.value || 0)) % 10;
                            this.cardResults[index] = total;
                        }
                        else if (key === "card3value") {
                            setTimeout(() => {
                                total = (total + (data.value || 0)) % 10;
                                this.cardResults[index] = total;
                            }, 850);
                        }
                    });
                };

                calcTotal(cards.player, 0);
                calcTotal(cards.banker, 1);
                break;
        
            case GameTypes.DragonTiger:
                this.cardResults[0] = cards.dragonValue.value as string || "";
                this.cardResults[1] = cards.tigerValue.value  as string || "";
                break;
            
            case GameTypes.ThreeCards:
                setTimeout(() => this.cardResults[0] = cards.dragon.result  as string || "", 850);
                setTimeout(() => this.cardResults[1] = cards.phoenix.result as string || "", 1150);
                break;
            
            case GameTypes.Niuniu:
                this.niuResults[0] = cards.banker.result  as string || "";
                this.niuResults[1] = cards.player1.result as string || "";
                this.niuResults[2] = cards.player2.result as string || "";
                this.niuResults[3] = cards.player3.result as string || "";
                break;
        }
    }

    getCardImage(card: string) {
        const suitCase: any = { c: "club", d: "diamond", h: "heart", s: "spade" };
        const valueEquivalent: any = { A: 1, J: 11, Q: 12, K: 13 };

        const suit = card.slice(-1).toLowerCase();
        let value = card.substring(0, card.length - 1);
            value = isNaN(+value) ? valueEquivalent[value] : value;

        return require(`@/assets/images/games/cards/sidebar/${ suitCase[suit] }/${ suit }${ value }.png`);
    }

    getThreeCardsResult(result: string) {
        if (result && typeof result === "string") {
            const [type, rank] = result.split("-");
            return this.$t(`threecardsTypes.${ type.toLowerCase() }`, [rank]);
        }
        return "";
    }
    getNiuniuCardResult(result: string) {
        if (result && typeof result === "string") {
            if (result === "NB") return this.$t("niuniuTypes.noBull");
            else if (result === "BB") return this.$t("niuniuTypes.bullBull");
            else if (result === "5P") return this.$t("niuniuTypes.fivePeople");
            else return this.$t("niuniuTypes.bull", [this.$t(`number.${ result[1] }`).toString()]);
        }
        return "";
    }

    onShow3rdCard(type: string) {
        this.hidden3rd[type] = false;
    }

    startTimer() {
        TweenLite.killTweensOf(this);
        TweenLite.fromTo(this, this.timer, { timer: this.timer }, { timer: 0, ease: Linear.easeNone });
    }

// #[Computed] ---------- + ---------- + ----------
    get BetStates() { return BetStates; }
    get GameTypes() { return GameTypes; }

    get isBaccarat()    { return this.tableData.code === GameTypes.Baccarat;    }
    get isDragonTiger() { return this.tableData.code === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.tableData.code === GameTypes.Moneywheel;  }
    get isRoulette()    { return this.tableData.code === GameTypes.Roulette;    }
    get isThreeCards()  { return this.tableData.code === GameTypes.ThreeCards;  }
    get isNiuniu()      { return this.tableData.code === GameTypes.Niuniu;      }

    get maxTime() {
        return this.tableData.maxtime || this.tableData.maxTime;
    }

    get timer() {
        return !!this.tableData.game ? this.tableData.game.timer : 0;
    }

    set timer(value: number) {
        const ratio = value / this.maxTime;
        const red = (ratio <= 0.5) ? 255 : ((1 - ratio) * 2 * 255);
        const green = (ratio >= 0.5) ? 255 : (ratio * 2 * 255);

        this.countdown = value;
        this.timerColor = `rgba(${ red }, ${ green }, 0, 0.8)`;
    }

    get betActions() {
        return Object.keys(BetActions).filter(key => typeof (BetActions as any)[key] === "number");
    }

    get tableName() {
        let name: string = "";

             if (this.isBaccarat   ) name = "gameNames.baccarat";
        else if (this.isDragonTiger) name = "gameNames.dragonTiger";
        else if (this.isMoneywheel ) name = "gameNames.moneywheel";
        else if (this.isRoulette   ) name = "gameNames.roulette";
        else if (this.isThreeCards ) name = "gameNames.threecards";
        else if (this.isNiuniu     ) name = "gameNames.niuniu";

        name += (this.tableData.subcode === "bidding" ? "Bid" : "");
        name += (this.tableData.name && this.tableData.name.search("SPEED") !== -1 ? "Speed" : "");
        name += (this.tableData.name && this.tableData.name.search("CLASSIC") !== -1 ? "Classic" : "");

        return this.$t(name);
    }
}
</script>

<style lang="scss">
.mini-table-card {
    .v-card {
        margin-bottom: 5px;
        padding: 1.5px 0;
        border: 1px solid $c-main;
        border-radius: 7.5px;
        background-color: transparent;

        color: $c-main;

        .table-id {
            font-size: 14px;
        }
        .point {
            color: #ffffff;
            font-size: 14px;
        }
        .table-time {
            position: absolute;
            right: 10px;
            top: 2px;

            .v-progress-circular__underlay {
                stroke: rgba(#ffffff, 0.3);
            }
            .v-progress-circular__overlay {
                transition: none;
            }

            span {
                position: absolute;
                width: 25px;
                top: -9px;
                left: -13px;

                font-weight: bold;
            }
        }

        .dealer-road {
            margin: 0;
            // background-color: #000000;

            > .flex {
                height: 130px;
                padding: 0;
            }

            .dealer-dealing {
                color: #ffffff;
                font-weight: bold;
                font-size: 20px;

                .spinning-icon {
                    margin-top: 25px;
                    animation: spinning 1.5s infinite;
                }
                .dealing-icon {
                    margin-top: 25px;
                    animation: dealing 0.25s infinite alternate;
                }
                .dealing-text {
                    font-size: 18px;
                    padding-top: 5px;
                }

                @keyframes spinning {
                      0% { transform: rotate(-360deg); }
                    100% { transform: rotate(   0deg); }
                }
                @keyframes dealing {
                      0% { transform: rotate(-20deg); }
                    100% { transform: rotate(  0deg); }
                }
            }

            .result-title {
                padding-top: 5px;

                &:first-child {
                    border-right: 1px dotted $c-main;
                }

                color: #ffffff;
                font-size: 14px;
                font-weight: bold;
                line-height: 18px;
            }

            .mini-card {
                position: absolute;

                &.card-blue-0 { left:  5px; top:  55px; }
                &.card-blue-1 { left: 45px; top:  55px; }
                &.card-blue-2 { left: 25px; top: 105px; transform: rotate(-90deg); }

                &.card-red-0 { right:  5px; top:  55px; }
                &.card-red-1 { right: 45px; top:  55px; }
                &.card-red-2 { right: 25px; top: 105px; transform: rotate(90deg); }

                &.card-dragon { left : 17px; top: 68px; }
                &.card-tiger  { right: 17px; top: 68px; }

                &.card-dragon-0 { left: 28px; top:  55px; }
                &.card-dragon-1 { left: 11px; top: 105px; }
                &.card-dragon-2 { left: 45px; top: 105px; }

                &.card-phoenix-0 { right: 28px; top:  55px; }
                &.card-phoenix-1 { right: 11px; top: 105px; }
                &.card-phoenix-2 { right: 45px; top: 105px; }

                &.card-hidden3rd {
                    width: 0 !important;
                }
            }

            .winner-mask {
                position: absolute;
                top: 47.5px;

                color: #ffffff;
                line-height: 110px;
                font-size: 26px;
                font-weight: bold;
                text-shadow: 1px 1px #000000;

                &.winner-blue {
                    width: 50%;
                    height: 110px;
                    background-color: rgba($c-bead-blue, 0.6);
                }
                &.winner-red {
                    right: 0;
                    width: 50%;
                    height: 110px;
                    background-color: rgba($c-bead-red, 0.6);
                }
                &.winner-tie {
                    width: 100%;
                    height: 110px;
                    background-color: rgba($c-bead-green, 0.6);
                }
            }

            .result-moneywheel {
                height: 130px;
                background-color: #000000;

                .img-coins, .img-spin-result {
                    position: absolute;
                    top: 45px;
                }
                .img-coins {
                    left: 10px;

                    .text-bonus {
                        position: relative;
                        left: calc(50% - 22.5px - 1px);
                        top: 20px;
                        width: 45px;

                        text-shadow: 0 1px 0.05px #333333;

                        color: $c-main;
                        font-weight: bold;
                        font-size: 24px;
                        line-height: 28px;
                    }
                }
                .img-spin-result {
                    right: calc(50% - 40px);

                    &.has-bonus {
                        right: 10px;
                    }

                    .text-spin {
                        position: relative;
                        left: 10px;
                        top: 37.5px;

                        text-shadow: 0 1px 0.05px #333333;

                        color: $c-main;
                        font-weight: bold;
                        font-size: 24px;
                        line-height: 28px;
                    }
                }
            }

            .result-niuniu {
                width: 100%;
                height: 130px;

                .result-title {
                    &:first-child {
                        border-right: none;
                    }
                    &:not(:last-child) {
                        border-bottom: 1px dotted $c-main;
                    }

                    position: relative;
                    padding-left: 5px;
                    height: 32.5px;
                    
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: bold;
                    line-height: 24px;
                    text-align: left;

                    .mini-card {
                        position: absolute;
                        top: 2.25px;
                    }
                    .result-text {
                        position: absolute;
                        top: 4.25px;
                        right: 0;
                        width: 47.5px;

                        text-align: left;
                    }

                    $list: card-niuBanker card-niuPlayer1 card-niuPlayer2 card-niuPlayer3;

                    @each $class in $list {
                        @for $i from 0 through length($list) {
                            .#{ $class }-#{ $i } {
                                left: calc(32px + #{ $i } * 24px);
                            }
                        }
                    }
                }
            }
        }
        .button {
            float: left;
            margin: 0 0 2px 0;
            width: 45%;
            height: 20px;

            background-image: linear-gradient(to bottom, #feb645 0%,#d67c22 63%,#a67939 99%);
            border-radius: 5px;

            &:last-child {
                float: right;
            }

            &:only-child {
                float: none;
            }

            div.v-btn__content {
                color: #000000;
                font-weight: bold;
                font-size: 14px;
                text-transform: none;
            }

            &.inactive {
                pointer-events: none;
                color: #555555 !important;
                caret-color: #555555 !important;
                background: linear-gradient(to bottom, #f5f6f6 0%, #dbdce2 21%, #b8bac6 92%) !important;
                opacity: .6;
            }
        }

        .bet-action {
            padding: 2px 0;
            margin-top: 1px;
            margin-bottom: 1.25px;

            border: 1px solid $c-main;
            border-radius: 5px;

            &.offset-item0 {
                margin-left: 7.495%;
            }
            &.offset-item1 {
                margin-left: 1.67%;
            }
        }

        .card-bottom {
            height: 25px;
        }

        .sidebar-msg {
            position: absolute;
            top: calc(50% - 16px);
            left: 5%;
            width: 90%;
            height: 24px;

            background: rgba($c-main-light, 0.9);
            border-radius: 5px !important;

            color: #000000;
            font-size: 16px;
            line-height: 24px;

            opacity: 1;
            pointer-events: none;
            transition: all 0.5s;

            &.hidden {
                opacity: 0;
            }
        }
    }
}
</style>
