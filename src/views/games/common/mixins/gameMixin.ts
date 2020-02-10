import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events, { BaccaratItems, GameTypes, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({})
export default class extends Mixins(ModulesMixin)
{
    gameItems!: any;

    isResultVisible = false;
    isBetCancelled = false;

    lastChipSets: { [item: string]: number } = {};
    lastChipSetsTemp: { [item: string]: number } = {};
    lastChipsConfHistory: { [item: string]: number } = {};

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("$route") onRouteChanged() {
        this.showTable(this.currentTableData.status === TableStatus.Betting, false);
    }

    @Watch("platform.orientation.isPortrait") onPortraitChanged() {
        this.$nextTick(() => {
            this.showTable(this.currentTableData.status === TableStatus.Betting, false);
        });
    }

    @Watch("currentTableData.status") onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.isBetCancelled = false;
                setTimeout(() => {
                    this.showTable(true);
                    this.lastChipSets = {};
                    this.lastChipSetsTemp = {};
                }, 500);
                break;

            case TableStatus.Dealing:
                this.showTable(false);
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.showTable(this.currentTableData.status === TableStatus.Betting, false);

        this.eventBus.$on(Events.ON_BET_ITEM_SUB, this.onBetItemSub);
        this.eventBus.$on(Events.ON_BET_CONFIRMED, this.onBetConfirmed);
        this.eventBus.$on(Events.ON_CANCEL_BET, this.onCancelBet);
        this.eventBus.$on(Events.ON_REPEAT_BETS, this.onRepeatBet);
        this.eventBus.$on(Events.ON_TABLE_CHANGED, () => this.isResultVisible = false);
    }

// #[Methods] ---------- + ---------- + ----------
    onBetItemSub(key: string, amount?: number, isRebet = false) {
        const value = (amount === undefined) ? this.tableState.chipAmounts[this.tableState.chipSelection] : amount;
        const canProceed = this.checkBetLimit(key, value, isRebet);

        if (canProceed > 0) {
            this.isBetCancelled = false;
            this.userInfo.tempBalance(this.userInfo.tempInGameBalance + canProceed);
            this.tableState.addBet({ tableNumber: this.tableNumber, item: key, value: canProceed, isRebet });
            
            if (!isRebet) this.lastChipSetsTemp[key] = this.tableState.chipSelection;
        }
    }
    
    onBetConfirmed() {
        for (const item in this.tableState.tableBets[this.tableNumber]) {
            if (this.tableState.tableBets[this.tableNumber][item] > 0)
                this.lastChipSets[item] = this.lastChipSetsTemp[item];
        }
        this.lastChipsConfHistory = this.lastChipSets;
    }

    onCancelBet() {
        this.isBetCancelled = true;
        this.lastChipSetsTemp = { ...this.lastChipSets };
    }

    onRepeatBet() {
        this.lastChipSetsTemp = { ...this.lastChipsConfHistory };
    }

// #[Methods] ---------- + ---------- + ----------
    getLastChipSets(item: string) {
        return this.lastChipSets[item] ? this.lastChipSets[item] : 0;
    }

    getLastChipSetsTemp(item: string) {
        return this.lastChipSetsTemp[item] ? this.lastChipSetsTemp[item] : 0;
    }

    getTotalChipBy(item: string) {
        const tableBet = (this.tableState.tableBets[this.tableNumber] && this.tableState.tableBets[this.tableNumber][item]) || 0;
        const tableConfirmBet = (this.tableState.tableConfirmBets[this.tableNumber] && this.tableState.tableConfirmBets[this.tableNumber][item]) || 0;

        // Roulette and Niuniu don't have the double-chip feature
        return (this.currentTableData.code === GameTypes.Roulette || this.currentTableData.code === GameTypes.Niuniu) ? tableBet + tableConfirmBet : tableConfirmBet;
    }

    getTotalChipTempBy(item: string) {
        const tableBet = (this.tableState.tableBets[this.tableNumber] && this.tableState.tableBets[this.tableNumber][item]) || 0;
        return tableBet;
    }

    checkBetLimit(betPlace: string, incomingValue: number, isRebet = false) {
        let currBets = this.getTotalChipBy(betPlace) + this.getTotalChipTempBy(betPlace);
        const limit = this.determineMinMaxBet(betPlace);

        // Roulette and Niuniu don't have the double-chip feature
        if (this.currentTableData.code === GameTypes.Roulette || this.currentTableData.code === GameTypes.Niuniu) currBets = this.getTotalChipBy(betPlace);

        // Fix the bet's amount based on balance (all-in)
        const usableBalance = this.userInfo.balance - this.userInfo.tempInGameBalance - this.userInfo.tempSideBarBalance;
        incomingValue = (incomingValue <= usableBalance) ? incomingValue : usableBalance;

        if (incomingValue === 0) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.noFund"));
            return -1;
        }
        // Already reachs maximum bet
        else if (currBets === limit.max) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, `${this.$t("betToast.state.maxBet")} ${limit.max}`);
            return -1;
        }
        // Minimum bet is not met
        else if (currBets + this.tableState.chipAmounts[this.tableState.chipSelection] < limit.min) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, `${this.$t("betToast.state.minBet")} ${limit.min}`);
            return -1;
        }
        // Minimum bet is not met (enterTable)
        else if (currBets + this.tableState.chipAmounts[this.tableState.chipSelection] < this.userInfo.balanceRequirement && !isRebet) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, `${this.$t("betToast.state.minBet")}`);
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

    formatChipBy(item: string) {
        return Utils.currency((this.getTotalChipBy(item) * 100 >> 0) / 100, 3);
    }

    formatChipTempBy(item: string) {
        return Utils.currency((this.getTotalChipTempBy(item) * 100 >> 0) / 100, 3);
    }

    showTable(visible: boolean, hasAnim?: boolean){
        return;
    }

// #[Computed] ---------- + ---------- + ----------
    get betItems(): { [item: string]: string } {
        return Object.keys(this.gameItems)
                    .filter(key => typeof (this.gameItems as any)[key] === "number")
                    .reduce<{ [item: string]: string }>((result, value) => { result[value] = value; return result; }, {});
    }
}
