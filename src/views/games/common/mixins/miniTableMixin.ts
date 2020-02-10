import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import { BaccaratItems, DragonTigerItems, MoneywheelItems, NiuniuItems, ThreeCardsItems } from "@/models/helper/types";
import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    lastChipSets: { [item: string]: number } = {};

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;
    @Prop() readonly game!: string;
    @Prop() readonly hiddenChips!: boolean;
    @Prop() readonly currStatus!: string;

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        if (this.currStatus && this.currStatus.includes("squeeze")) return;

        const value = this.tableState.chipAmounts[this.tableState.chipSelection];
        const canProceed = this.checkBetLimit(key, value);

        if (canProceed > 0) {
            this.userInfo.tempSbBalance(this.userInfo.tempSideBarBalance + canProceed);
            this.tableState.addBet({ tableNumber: this.tableNumber, item: key, value: canProceed, isRebet: false });

            this.lastChipSets[key] = this.tableState.chipSelection;
        }

        TweenLite.fromTo(`.${ this.game }-table.mini.table-${ this.tableNumber } .chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
        this.$forceUpdate();
    }

// #[Methods] ---------- + ---------- + ----------
    checkBetLimit(betPlace: string, incomingValue: number) {
        const currBets = this.getTotalChipBy(betPlace);
        const limit = this.determineMinMaxBet(betPlace);

        // Fix the bet's amount based on balance (all-in)
        const usableBalance = this.userInfo.balance - this.userInfo.tempInGameBalance - this.userInfo.tempSideBarBalance;
        incomingValue = (incomingValue <= usableBalance) ? incomingValue : usableBalance;

        if (incomingValue === 0) {
            this.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, `${this.$t("betToast.state.noFund")}`, this.tableNumber);
            return -1;
        }
        // Already reachs maximum bet
        else if (currBets === limit.max) {
            this.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, `${this.$t("betToast.state.maxBet")} ${limit.max}`, this.tableNumber);
            return -1;
        }
        // Minimum bet is not met
        else if (currBets + incomingValue < limit.min) {
            this.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, `${this.$t("betToast.state.minBet")} ${limit.min}`, this.tableNumber);
            return -1;
        }
        // Minimum bet is not met
        else if (currBets + incomingValue < this.userInfo.balanceRequirement) {
            this.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, `${this.$t("betToast.state.minBet")}`, this.tableNumber);
            return -1;
        }
        // Current bets are still below max, continue betting
        // Added condition for all in with maxbet limit
        else if (currBets + incomingValue <= limit.max) {
            if (currBets + incomingValue > this.userInfo.userMaxBet) incomingValue = this.userInfo.userMaxBet - currBets; 
            return incomingValue;
        }
        // Added condition for all in with maxbet limit
        else if (currBets + incomingValue > limit.max && currBets <= limit.max) {
            if (currBets + incomingValue > this.userInfo.userMaxBet) incomingValue = this.userInfo.userMaxBet - currBets; 
            return limit.max - currBets;
        }
        else return -1;
    }

    determineMinMaxBet(betPlace: string) {
        betPlace = betPlace.toUpperCase();
        switch (betPlace) {
            case BaccaratItems[BaccaratItems.PPair]:
            case BaccaratItems[BaccaratItems.BPair]:
                return {
                    min: this.userInfo.userMinBet,
                    max: Math.ceil(this.userInfo.userMaxBet / 11)
                };

            case BaccaratItems[BaccaratItems.Tie]:
                return {
                    min: this.userInfo.userMinBet,
                    max: Math.ceil(this.userInfo.userMaxBet / 8)
                };
                
            case BaccaratItems[BaccaratItems.Super6]:
                return {
                    min: this.userInfo.userMinBet,
                    max: Math.ceil(this.userInfo.userMaxBet / 12)
                };

            default:
                return {
                    min: this.userInfo.userMinBet,
                    max: this.userInfo.userMaxBet
                };
        }
    }

    getLastChipSets(item: string) {
        return this.lastChipSets[item] ? this.lastChipSets[item] : 0;
    }

    getTotalChipBy(item: string) {
        const tableBet = (this.tableState.tableBets[this.tableNumber] && this.tableState.tableBets[this.tableNumber][item]) || 0;
        const tableConfirmBet = (this.tableState.tableConfirmBets[this.tableNumber] && this.tableState.tableConfirmBets[this.tableNumber][item]) || 0;
        return tableBet + tableConfirmBet;
    }

    formatChipBy(item: string) {
        return Utils.formatNumber(this.getTotalChipBy(item));
    }

// #[Computed] ---------- + ---------- + ----------
    get betItems(): { [item: string]: string } {
        const items = {};

        Object.keys(BaccaratItems   ).filter(key => typeof (BaccaratItems    as any)[key] === "number").reduce((result, value) => Object.assign(result, { [value]: value }), items);
        Object.keys(DragonTigerItems).filter(key => typeof (DragonTigerItems as any)[key] === "number").reduce((result, value) => Object.assign(result, { [value]: value }), items);
        Object.keys(MoneywheelItems ).filter(key => typeof (MoneywheelItems  as any)[key] === "number").reduce((result, value) => Object.assign(result, { [value]: value }), items);
        Object.keys(ThreeCardsItems ).filter(key => typeof (ThreeCardsItems  as any)[key] === "number").reduce((result, value) => Object.assign(result, { [value]: value }), items);
        Object.keys(NiuniuItems     ).filter(key => typeof (NiuniuItems      as any)[key] === "number").reduce((result, value) => Object.assign(result, { [value]: value }), items);

        return items;
    }
}
