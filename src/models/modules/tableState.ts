import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import Cookies from "vue-cookies";

import { app } from "@/main";
import Axios from "@/models/helper/axiosConfig";
import Events, { TableData } from "@/models/helper/types";
import store, { IStore } from "@/models/store";
import Serializer from "@/models/helper/serializer";
import Socket from "@/models/helper/socket";
import Router from "@/models/router";
import moment, { Moment } from "moment";

@Module({ namespaced: true, dynamic: true, store, name: "tableState" })
export default class TableState extends VuexModule
{
    isWhiteRoadmap = false;

    isSuper6 = false;
    isEmcee = false;

    chipSelection = 0;
    chipAmounts = [10, 50, 100, 500, 1000];

    goodTipsTables: string[] = [];
    onGoingBet: boolean = false;

    hasConfirmed = false;
    overRepeat = false;

    serverTime: Moment = moment();

    emceeRestTime = {
        start: { h: 2, m: 0, s: 0 },
        end: { h: 10, m: 0, s: 0 },
    };

    tableBets: { [tableNumber: string]: { [item: string]: number }} = {};
    tableConfirmBets: { [tableNumber: string]: { [item: string]: number }} = {};
    
    tableHistoryBets: { tableNumber: string, items: { [item: string]: number }} = { tableNumber: "", items: {}};

    isSqueezeVisible = false;
    isSqueezeFlips: { [key: string]: boolean[] } | undefined = {};
    isHighestBidder: { blue: boolean, red: boolean } | undefined = { blue: false, red: false };
    squeezeStatus: string | undefined = "";

// #[Getters] ---------- + ---------- + ----------
    /** Check if there are *any* bets in the specific table */
    get hasTableBets() {
        return (tableNumber: string) => {
            for (const item in this.tableBets[tableNumber]) {
                if (this.tableBets[tableNumber][item] > 0) return true;
            }
            for (const item in this.tableConfirmBets[tableNumber]) {
                if (this.tableConfirmBets[tableNumber][item] > 0) return true;
            }
            return false;
        };
    }
    
    /** Check if there are *confirmed* bets in the specific table */
    get hasConfirmBets() {
        return (tableNumber: string) => {
            for (const item in this.tableConfirmBets[tableNumber]) {
                if (this.tableConfirmBets[tableNumber][item] > 0) return true;
            }
            return false;
        };
    }

    /** Get the total of bets in the specific table */
    get tableTotalBets() {
        return (tableNumber: string) => {
            let total: number = 0;
            for (const item in this.tableBets[tableNumber]) {
                if (!!item) total += this.tableBets[tableNumber][item];
            }
            return total;
        };
    }

    /** Check if Emcee rest time */
    get isEmceeRestTime() {
        const start = this.serverTime.clone().set(this.emceeRestTime.start).add(-1, "m");
        const end = this.serverTime.clone().set(this.emceeRestTime.end).add(1, "m");

        return this.serverTime.isBetween(start, end);
    }


// #[Mutations] ---------- + ---------- + ----------
    @Mutation changeRoadmapTheme() {
        this.isWhiteRoadmap = !this.isWhiteRoadmap;
    }

    /** Set the value of the chips from backend */
    @Mutation setUserChips(value: number[]) {
        this.chipAmounts = value;
    }

    @Mutation selectChip(choice: number) {
        this.chipSelection = choice;
    }

    /** Updated the amount of target chip */
    @Mutation upChipAmount({ choice, amount }: { choice: number, amount: number }) {
        this.chipAmounts[choice] = amount;
    }

    /** Initialize all bets on all or specified table */
    @Mutation initBets({ tableNumber, hasHistory }: { tableNumber?: string, hasHistory?: boolean }) {
        if (tableNumber === undefined) {
            this.tableBets = {};
            this.tableConfirmBets = {};
        }
        else {
            if (hasHistory) {
                if (this.tableConfirmBets[tableNumber] && Object.keys(this.tableConfirmBets[tableNumber]).length > 0) {
                    this.tableHistoryBets.tableNumber = tableNumber;
                    this.tableHistoryBets.items = this.tableConfirmBets[tableNumber] || {};
                }
            }

            this.tableBets = { ...this.tableBets, [tableNumber]: {} };
            this.tableConfirmBets = { ...this.tableConfirmBets, [tableNumber]: {} };
        }

        this.hasConfirmed = false;
        this.overRepeat = false;
    }

    @Mutation clearHistory(tableNumber: number) {
        this.tableHistoryBets.tableNumber = "";
        this.tableHistoryBets.items = {};

        this.tableBets = { ...this.tableBets, [tableNumber]: {}};
        this.tableConfirmBets = { ...this.tableConfirmBets, [tableNumber]: {}};
    }
    
    /** Cancel all bets on specified table */
    @Mutation cancelBets(tableNumber: string) {
        if (tableNumber === store.state.gameInfo.currentTableInfo.tableNumber)
            store.state.siteState.eventBus.$emit(Events.ON_CANCEL_BET);

        this.tableBets = { ...this.tableBets, [tableNumber]: {}};
        this.overRepeat = false;
    }

    /** Add temporary bet on specified table and item */
    @Mutation addBet({ tableNumber, item, value, isRebet }: { tableNumber: string, item: string, value: number, isRebet: boolean }) {
        if (!this.tableBets[tableNumber]) this.tableBets[tableNumber] = {};
        
        this.tableBets[tableNumber][item] = isRebet ? value : (this.tableBets[tableNumber][item] || 0) + value;
        this.tableBets = { ...this.tableBets };
    }

    @Mutation toggleSuper6() {
        this.isSuper6 = !this.isSuper6;
    }

    @Mutation setGoodTipsTables({ tableNumber, toAdd }: { tableNumber: string, toAdd: boolean }) {
        if (toAdd) this.goodTipsTables.push(tableNumber);
        else if (this.goodTipsTables.includes(tableNumber))
            this.goodTipsTables.splice(this.goodTipsTables.indexOf(tableNumber), 1);
    }

    @Mutation setSqueezeVisible({ visible, isFlips, status, isHighestBidder }: { visible?: boolean, isFlips?: { [key: string]: boolean[] }, status?: string, isHighestBidder?: { blue: boolean, red: boolean }}) {
        this.squeezeStatus = status;
        this.isSqueezeFlips = isFlips;
        this.isHighestBidder = isHighestBidder;
        
        setTimeout(() => {
            this.isSqueezeVisible = false;

            setTimeout(() => {
                this.isSqueezeVisible = (visible === undefined) ? !this.isSqueezeVisible : visible;
            }, 200);
        }, 500);
    }

// #[Actions] ---------- + ---------- + ----------
    /** Confirm all temporary bets on specified table */
    @Action confirmBets({ tableNumber, tableId, gameSet, shoeGame }: { tableNumber: string, tableId: number, gameSet: number, shoeGame: string }) {
        const state = this.context.state as this;
              state.onGoingBet = true;
        const rootState = this.context.rootState as IStore;
        const rootGetters = this.context.rootGetters;
        const isMainTableBet = (this.context.rootState as IStore).gameInfo.currentTableInfo.tableNumber === tableNumber;

        if (!state.isSuper6) delete state.tableBets[tableNumber]["Super6"];

        const betData = Serializer.fix(state.tableBets[tableNumber], rootState.gameInfo.tableDatas[tableNumber].code);
        
        if (betData && betData.length > 0) rootState.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, true, "", 0);
        else {
            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.none"));
            // rootGetters["mediaCtrl/baccaratSound"].play("noBet");
            return;
        }

        Socket.post("/bettings/transaction/confirm", { token: Cookies.get("panda_token"), bettings: betData, tableid: tableId, gameset: gameSet, super_six: isMainTableBet && this.isSuper6, is_emcee: isMainTableBet && this.isEmcee })
              .then(res => {
                if (!state.tableConfirmBets[tableNumber]) state.tableConfirmBets[tableNumber] = {};

                /** Count the number of valid bet */
                let count = 0;
                for (const item in state.tableBets[tableNumber]) {
                    if (state.tableBets[tableNumber][item] > 0) {
                        state.tableConfirmBets[tableNumber][item] = (state.tableConfirmBets[tableNumber][item] || 0) + state.tableBets[tableNumber][item];
                        count++;
                    }
                }

                if (count > 0) {
                    if (isMainTableBet) rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.success"));
                    else rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, app.$t("betToast.state.success"), tableNumber);

                    rootGetters["mediaCtrl/baccaratSound"].play("betSuccess");

                    // Send confirmed chips to backe-end
                    Axios.post("/bettings/lastBet", {
                        token: Cookies.get("panda_token"),
                        method: "SET",
                        tableNumber,
                        gameSet,
                        shoeGame,
                        sections: state.tableConfirmBets[tableNumber],
                    });
                    
                    if (isMainTableBet) rootState.siteState.eventBus.$emit(Events.ON_BET_CONFIRMED);
                    this.context.commit("gameInfo/setLastShoeBet", {tableNumber, shoeGame}, { root: true });
                }
                else {
                    rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.none"));
                    // rootGetters["mediaCtrl/baccaratSound"].play("noBet");
                }

                state.tableConfirmBets = { ...state.tableConfirmBets };
                state.tableBets = { ...state.tableBets, [tableNumber]: {}};

                this.context.commit("userInfo/updateBalance", res.data.balance, { root: true });
                rootState.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                state.onGoingBet = false;

                if (!rootState.userInfo.canChat && isMainTableBet) {
                    const totalBets = Object.values(state.tableBets[tableNumber] as { [item: string]: number }).reduce((sum, value) => sum + value, 0)
                                    + Object.values(state.tableConfirmBets[tableNumber] as { [item: string]: number }).reduce((sum, value) => sum + value, 0);
                    if (totalBets >= 10) this.context.commit("userInfo/enableChat", true, { root: true });
                }

                if (isMainTableBet) {
                    (this.context.state as this).hasConfirmed = true;
                }
              })
              .catch(e => {
                console.error(e);
                rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.noFund"));
                rootState.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                state.onGoingBet = false;
              });
    }

    /** Repeat all bets on specified table */
    @Action repeatBets(tableNumber: string) {
        const state = this.context.state as this;
        const rootState = this.context.rootState as IStore;
        
        if (state.hasConfirmed || state.overRepeat) return;
        if (!Object.keys(state.tableHistoryBets.items).length) {
            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.noRebet"));
            return;
        }

        const balance = rootState.userInfo.balance - rootState.userInfo.tempInGameBalance - rootState.userInfo.tempSideBarBalance;
        const totalBets = Object.values(state.tableBets[tableNumber] as { [item: string]: number }).reduce((sum, value) => sum + value, 0)
                        + Object.values(state.tableConfirmBets[tableNumber] as { [item: string]: number }).reduce((sum, value) => sum + value, 0)
                        + Object.values(state.tableHistoryBets.items as { [item: string]: number }).reduce((sum, value) => sum + value, 0);

        if (totalBets > balance) {
            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.noFundRebet"));
            return;
        }

        if (state.tableHistoryBets.tableNumber === tableNumber) {
            rootState.siteState.eventBus.$emit(Events.ON_REPEAT_BETS);

            state.overRepeat = true;

            for (const item in state.tableHistoryBets.items) {
                if (!!item) this.context.rootState.siteState.eventBus.$emit(Events.ON_BET_ITEM_SUB, item, state.tableHistoryBets.items[item], true);
            }
        }
    }

    /** Retrieve last confirmed bets from backend */
    @Action getTableBets({ tableNumber, tableId, gameSet }: {tableNumber: string, tableId: number, gameSet: number}) {
        Axios.post("/bettings/lastBet", {
                token: Cookies.get("panda_token"),
                method: "GET"
             })
             .then(res => {
                if (!res.data.data) return;

                const tableData = this.context.rootGetters["gameInfo/tableDetails"](tableNumber) as TableData;
                if (res.data.data.shoeGame === tableData.shoeGame) this.tableConfirmBets[res.data.data.tableNumber] = res.data.data.sections;
             })
             .catch(e => console.error(e, "Error @ getTableBets"));
    }

    @Action getTableBetInfos({ tableNumber, gameSet }: {tableNumber: string, gameSet: number}) {
        Axios.post("/bettings/gameSetInformation", { token: Cookies.get("panda_token"), gameSet, tableNumber })
             .then(result => {
                const betTableInfo: any = {
                    bet_percentages: {},
                    totalUsersAndBettings: {}
                };
                Object.entries(result.data.data).forEach(([key, value]: [string, any]) => {
                    betTableInfo["bet_percentages"][key] = value.betPercentage;
                    betTableInfo["totalUsersAndBettings"][key] = [{
                        bet_place: key,
                        total_bets: value.totalBetAmount,
                        total_users: value.totalUserBet
                    }];
                });
                this.context.commit("gameInfo/setTableBets", { tableNumber, data: betTableInfo }, { root: true });
                store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
             })
             .catch(e => {
                store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                console.error(e, "getTableBetInfos");
             });
    }

    /**
     * Sends table entry data to backend
     * Accepts `fromRoute` argument to determine if call comes from the `router`
     * 
     * Reminder: `tableId = 4 | 21 | 3` , `tableNumber = "M1" | "P1" | "C3"`
     */
    @Action async enterTable({ tableNumber, gameType, isBidding, fromRoute, isEmcee }: { tableNumber: string, gameType: string, isBidding: boolean, fromRoute?: boolean, isEmcee?: boolean }) {
        return Socket.post("/tables/enterTable", { token: Cookies.get("panda_token"), tableid: tableNumber })
                     .then(async res => {
                        if (isEmcee === undefined && Cookies.get("panda_emcee") === "true") isEmcee = true;

                        store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, true);
                        this.context.commit("mediaCtrl/toggleSmallEmcee", false, { root: true });
                        this.context.commit("userInfo/enableChat", false, { root: true });
                        this.context.dispatch("mediaCtrl/stopIngameSnd", false, { root: true });
                        
                        // Set user saved chips from backend
                        const userChips = this.context.rootGetters["userInfo/getUserChips"];
                        if (userChips) this.context.commit("setUserChips", userChips);

                        sessionStorage.tbl = tableNumber;
                        this.context.commit("siteState/toggleTapHint", true, { root: true });
                        this.context.commit("siteState/toggleFullscreen", true, { root: true });
                        this.context.commit("userInfo/selectTable", { tableNumber, gameType, isBidding }, { root: true });

                        /** Compile table data */
                        const tableData = this.context.rootGetters["gameInfo/tableDetails"](tableNumber) as TableData;

                        // Get User existing bets if there are any
                        // this.context.dispatch("getTableBets", { tableNumber, tableId: tableData.id, gameSet: tableData.gameSet, currTable: true });
                        this.context.dispatch("getTableBetInfos", { tableNumber, gameSet: tableData.gameSet });

                        let roadmap = this.context.rootGetters["gameInfo/roadmap"](tableNumber);
                        if (!roadmap) roadmap = await this.context.dispatch("gameInfo/getRoadmap", { tableNumber, gameType }, { root: true });

                        this.context.commit("gameInfo/setCurrentTable", { tableNumber, tableData, roadmap }, { root: true });
                        this.context.dispatch("socialInfo/joinChatTable", { tableNumber }, { root: true });

                        if (!fromRoute) Router.push(`/game/${ gameType }`);
                        if (this.isSuper6) this.context.commit("toggleSuper6");

                        (this.context.state as this).isEmcee = !!isEmcee;
                        Cookies.set("panda_emcee", !!isEmcee);
                    
                        const lastShoeBet = this.context.rootGetters["gameInfo/lastShoeBet"](tableNumber) as string;
                        if (tableData.shoeGame !== lastShoeBet && lastShoeBet) this.context.commit("clearHistory", tableNumber);
                     })
                     .catch(e => {
                        store.state.siteState.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                        console.error(e);
                     });
    }

    @Action exitTable({ tableNumber, gameType, fromRoute }: { tableNumber: string, gameType: string, fromRoute?: boolean }) {
        const rootState = this.context.rootState as IStore;

        // Added to prevent player from exiting table when they have active bets.
        if (this.hasConfirmBets(tableNumber)) {
            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.activeBet"));
            return;
        }

        return Socket.post("/tables/exitTable", { token: Cookies.get("panda_token"), tableid: tableNumber })
                     .then(res => {
                        this.context.dispatch("mediaCtrl/stopIngameSnd", false, { root: true });
                        this.context.commit("toggleSuper6");
                        this.context.commit("userInfo/backToLobby", {}, { root: true });
                        this.context.commit("clearHistory", tableNumber);

                        delete sessionStorage.tbl;

                        if (!fromRoute) {
                            // Add on-complete callback on route to avoid rendering the components with `null` data
                            if ((this.context.state as this).isEmcee) gameType = "emcee";
                            Router.push(`/lobby/${ gameType }`, () => {
                                this.context.commit("gameInfo/setCurrentTable", { tableNumber: null, tableData: null, roadmap: null, players: null }, { root: true });
                            });
                        }

                        // reset table bets
                        this.tableBets[tableNumber] = {};
                     })
                     .catch(e => console.error(e));
    }

    @Action updateServerTime() {
        return Axios.get("/system/time", { params: { token: Cookies.get("panda_token") }})
                    .then((res: any) => {
                        const serverTime = res.data.data.current_time_utc + "+0000";
                        (this.context.state as this).serverTime = moment(serverTime).utcOffset("+0800");
                        return 1;
                    })
                    .catch((e: any) => {
                        console.error(e);
                        return 0;
                    });
    }
}
