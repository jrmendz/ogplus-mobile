import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TimelineLite, Bounce } from "gsap";

import Events, { BaccaratItems, DragonTigerItems, ThreeCardsItems, GameTypes, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    isVisiblePlayers = false;
    isVisibleCards = false;

    winner: BaccaratItems | DragonTigerItems | ThreeCardsItems | null = null;
    isSqueeze = false;

    showPlayersTween!: TimelineLite;
    showCardsTween!: TimelineLite;

    isFlips: { [key: string]: boolean[] } = {};
    cardImages: { [key: string]: any[] } = {};
    cardResults: number[] | string[] = [-1, -1];
    redTime = 800;

    topPlayers: [{ name: string, avatar: string }] | any = [{ name: "", avatar: "" }];

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { immediate: true }) onStatusChanged(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.winner = null;
                this.gameInfo.setTableBets({ tableNumber: this.tableNumber, data: undefined });
                this.showCardsResult(false);
                break;

            case TableStatus.Dealing:
                this.resetCards();
                setTimeout(() => {
                    this.showCardsResult(true);
                    this.serializeHighestBidders();

                    setTimeout(() => this.showPlayersResult(false), 2000);
                }, 300);
                break;

            case TableStatus.SqueezeStart:
            case TableStatus.SqueezePlayerStart:
            case TableStatus.SqueezeBankerStart:
                this.isSqueeze = true;

                const data = {
                    visible: this.isSqueeze && (!!this.isBlueHighestBidder || !!this.isRedHighestBidder),
                    isFlips: this.isFlips,
                    status: val,
                    isHighestBidder: { blue: this.isBlueHighestBidder, red: this.isRedHighestBidder },
                };
                this.tableState.setSqueezeVisible(data);
                this.squeezeFunctions(val);
                this.showPlayersResult(false);
                break;

            case TableStatus.SqueezeEnd:
            case TableStatus.SqueezeBankerEnd:
            case TableStatus.SqueezePlayerEnd:
                this.isSqueeze = false;

                this.tableState.setSqueezeVisible({ visible: false });
                this.drawCardsFromData(this.currentTableData.game.cards);
                this.showPlayersResult(false);
                break;
                
            case TableStatus.Default:
                let gameResult = this.currentTableData.game.result;
                    gameResult = gameResult.split(",")[0];

                this.winner = Utils.fixCase(gameResult, "pascal");
                this.drawCardsFromData(this.currentTableData.game.cards);
                this.showPlayersResult(false);

                this.playResultSounds();
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        if (this.currentTableData.status !== TableStatus.Betting) {
            setTimeout(() => {
                this.showCardsResult(true);
                if (this.isBidding) this.serializeHighestBidders();
            }, 300);
        }

        this.eventBus.$on(Events.ON_FLIP_CARD, this.onFlipCard);
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
        this.eventBus.$on(Events.ON_DRAW_CARDS, this.drawCardsFromData);
        this.eventBus.$on(Events.ON_TABLE_CHANGED, this.resetCards);
    }

    beforeDestroy() {
        if (this.showPlayersTween) this.showPlayersTween.kill();
        if (this.showCardsTween) this.showCardsTween.kill();
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        return;
    }

    onShow3rdCard(type: string) {
        return;
    }

    onFlipCard(type: string, id: number, card: any, userInitiated = false) {
        if (userInitiated && type === "red" && this.isBlueHighestBidder && this.isRedHighestBidder) return;
        if (!this.isFlips || this.isFlips[type][id]) return;

        if (this.gameType !== GameTypes.Niuniu) this.mediaCtrl.spotFxSound.play("click");

        const image = `.table-card.card-${ type }-${ id } .v-image__image`;
        const flipTween = new TimelineLite();
              flipTween.fromTo(image, 0.15, { scaleX: 1 }, { scaleX: 0 })
                       .call(() => {
                            const cardImage = this.getCardImage(card);
                            if (cardImage) this.cardImages[type][id] = cardImage;
                            this.$forceUpdate();
                       })
                       .fromTo(image, 0.15, { scaleX: 0 }, { scaleX: 0.925 });

        this.isFlips[type][id] = true;
        this.tableState.setSqueezeVisible({ visible: this.isSqueeze && (!!this.isBlueHighestBidder || !!this.isRedHighestBidder), isFlips: this.isFlips, status: this.currentTableData.status, isHighestBidder: { blue: this.isBlueHighestBidder, red: this.isRedHighestBidder } });
    }

// #[Methods] ---------- + ---------- + ----------
    getUserAvatar(id: number) {
        return Utils.format(this.userInfo.avatarUrl, id);
    }

    /** Card Games squeezing function, reference Line 80 of BaccaratResult.vue */
    squeezeFunctions(status: TableStatus) {
        return;
    }

    resetCards() {
        // if (!this.currentTableData.game.cards || Object.keys(this.currentTableData.game.cards).length === 0) return;

        Object.entries(this.isFlips).forEach(a => {
            const [key, value]: [string, any] = a;
            value.forEach((n: any, m: number) => this.isFlips[key][m] = false);
        });

        // Reset card total values
        this.cardResults[0] = this.cardResults[1] = -1;
        if (this.currentTableData.code === GameTypes.Niuniu)
             this.cardResults[0] = this.cardResults[1] = this.cardResults[2] = this.cardResults[3] = "";
        else this.cardResults[0] = this.cardResults[1] = -1;

        delete this.currentTableData.game.cards;

        // Reset image
        Object.keys(this.cardImages).forEach(key => {
            let color = key.replace(/\d/g, "");
                color = (color === "first") ? "red" : color;

            for (let i = this.cardImages[key].length - 1; i >= 0; --i)
                this.cardImages[key][i] = require(`@/assets/images/games/cards/img_back-${ color }.png`);
        });
    }

    serializeHighestBidders() {
        const bidders = this.tableBetDatas && this.tableBetDatas.betRankData;
        if (!bidders) return false;

        this.topPlayers = [];

        Object.entries(bidders).forEach(([key, leadingPlayer]: [string, any], index)  => {
            // let [key, leadingPlayer] = item;

            // The loop needs specific index for `topPlayers` since the rendering loop in the template aboce loops `beadColors` instead
            if (leadingPlayer) {
                if (!leadingPlayer.nickname)
                    leadingPlayer = this.findPlayerData(leadingPlayer);

                switch (key) {
                    case "dragon":
                    case "player":
                        this.topPlayers[0] = { name: leadingPlayer.nickname, avatar: leadingPlayer.imgname };
                        break;
                    // case "tie":
                    //     this.topPlayers[1] = { name: leadingPlayer.nickname, avatar: leadingPlayer.imgname };
                    //     break;
                    case "tiger":
                    case "banker":
                        this.topPlayers[2] = { name: leadingPlayer.nickname, avatar: leadingPlayer.imgname };
                        break;
                    default:
                        this.topPlayers.push(null);
                }
            }
        });
        this.showPlayersResult(true);
    }

    /** Find player data if backend miss some on return. Will get the data from table players */
    findPlayerData(playerId: string) {
        return (this.gameInfo.currentTableInfo.players!).find(player => player.id === playerId);
    }

    checkIfHighestBidder(playerId: string) {
        return playerId === this.userInfo.id;
    }

    showPlayersResult(visible: boolean, data: any = null) {
        if (this.isVisiblePlayers === visible) return;
        if (visible) {
            this.isVisiblePlayers = true;

            if (this.showPlayersTween) this.showPlayersTween.kill();
            this.showPlayersTween = new TimelineLite()
                    .fromTo(".result-players", 0.35, { x: -200, opacity: 0, scaleY: 0.9 }, { x: 0, opacity: 1, scaleY: 1 })
                    .fromTo(".result-players .v-image", 0.35, { y: 30, opacity: 0 }, { y: 0, opacity: 1 })
                    .fromTo(".result-players .v-icon", 0.35, { opacity: 0 }, { opacity: 1 }, 0.35);
        }
        else {
            if (this.showPlayersTween) this.showPlayersTween.kill();
            this.showPlayersTween = new TimelineLite({ onComplete: () => this.isVisiblePlayers = false })
                    .to(".result-players .v-image", 0.35, { y: 30, opacity: 0 })
                    .to(".result-players .v-icon", 0.35, { opacity: 0 }, 0)
                    .to(".result-players", 0.35, { x: 200, opacity: 0, scaleY: 0.9 }, 0.35);
        }
    }

    showCardsResult(visible: boolean, data: any = null) {
        const distance = window.innerWidth / 2;
        const isNiuniuLand = this.currentTableData.code === GameTypes.Niuniu && !this.platform.orientation.isPortrait;

        if (visible) {
            this.isVisibleCards = true;

            if (this.showCardsTween) this.showCardsTween.kill();
            this.showCardsTween = new TimelineLite()
                    .fromTo(".result-blue", 0.75, { x: -distance }, { x: 0, ease: Bounce.easeOut })
                    .fromTo(".result-red", 0.75, { x: isNiuniuLand ? -distance : distance }, { x: 0, ease: Bounce.easeOut }, 0);
        }
        else {
            if (this.showCardsTween) this.showCardsTween.kill();
            this.showCardsTween = new TimelineLite({ onComplete: () => this.isVisibleCards = false })
                    .to(".result-blue", 0.35, { x: -distance })
                    .to(".result-red", 0.35, { x: isNiuniuLand ? -distance : distance }, 0);
        }
    }

    drawCardsFromData(cards: { dragon?: any, tiger?: any, player?: any, banker?: any, phoenix?: any }) {
        if (!cards) return;
        this.calculateTotalValue(cards);
        this.drawCards("blue", cards.dragon || cards.player);
        this.drawCards("red" , cards.tiger || cards.banker || cards.phoenix);
    }

    /** Draw (pull) cards from stack data given by backend */
    drawCards(type: string, stack: any) {
        if (stack && stack.card3 && this.currentTableData.code === GameTypes.Baccarat) setTimeout(() => this.onShow3rdCard(type), 400);
        if (this.isBidding && this.currentTableData.status === TableStatus.Dealing || this.isSqueeze) return;

        if (stack && typeof stack !== "string") {
            Object.entries(stack).forEach(([key, keyVal]) => {
                if (key.includes("value") || !keyVal) return false;
                if (key === "result") return false;

                const cardNum = +key.slice(-1) - 1;

                if (cardNum === 2 && this.currentTableData.code === GameTypes.Baccarat) {
                    if (type === "blue") {
                        this.redTime = 1200;
                        setTimeout(() => this.onFlipCard(type, cardNum, keyVal), 800);
                    }
                    else setTimeout(() => this.onFlipCard(type, cardNum, keyVal), this.redTime);
                }
                else {
                    if (type === "red") setTimeout(() => this.onFlipCard(type, cardNum, keyVal), 400);
                    else this.onFlipCard(type, cardNum, keyVal);
                }
            });
        }
        else {
            if (type === "red") setTimeout(() => this.onFlipCard(type, 0, stack), 400);
            else this.onFlipCard(type, 0, stack);
        }
    }

    /** Get Total value of card */
    calculateTotalValue(cards: any) {
        return;
    }

    /** Play the sounds about points and the winner */
    playResultSounds() {
        return;
    }

    /** Compute to know which card image to show depending on the card string from backend */
    getCardImage(card: string) {
        if (card) {
            const suitCase: any = { c: "club", d: "diamond", h: "heart", s: "spade" };
            const valueEquivalent: any = { A: 1, J: 11, Q: 12, K: 13 };

            const suit = card.slice(-1).toLowerCase();
            let value = card.substring(0, card.length - 1);
                value = isNaN(+value) ? valueEquivalent[value] : value;

            return require(`@/assets/images/games/cards/sidebar/${ suitCase[suit] }/${ suit }${ value }.png`);
        }
    }


// #[Computed] ---------- + ---------- + ----------
    get gameType() {
        return this.currentTableData.code;
    }

    get tableNumber() {
        return this.currentTableData.tableNumber;
    }

    get tableBetDatas() {
        return this.gameInfo.tableBetResults[this.tableNumber];
    }

    get isBidding() {
        return this.currentTableData.subcode === "bidding";
    }

    get isBlueHighestBidder() {
        const betResult = this.tableBetDatas;
        if (!betResult || !betResult.highestBidders) return false;
        const categoryHighest = !!betResult && !!this.checkIfHighestBidder(betResult.highestBidders.player || betResult.highestBidders.dragon);
        return betResult && categoryHighest;
    }
    
    get isRedHighestBidder() {
        const betResult = this.tableBetDatas;
        if (!betResult || !betResult.highestBidders) return false;

        const categoryHighest = !!betResult && !!this.checkIfHighestBidder(betResult.highestBidders.banker || betResult.highestBidders.tiger);
        return betResult && categoryHighest;
    }    
}
