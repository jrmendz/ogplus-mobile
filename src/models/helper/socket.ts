import { Commit, Dispatch } from "vuex";
import Cookies from "vue-cookies";
import socketClient from "socket.io-client";
import sailsClient from "sails.io.js";

import { app } from "@/main";
import { ChatData } from "@/models/helper/types";
import { IStore } from "@/models/store";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

type CallbackData = { body?: { status?: number, [key: string]: any }, status?: number, msg: string, [key: string]: any };

export default class Socket
{
    /** To create a fake number of players  */
    static readonly PLAYERS_MULTIPLE = 1;

    /** The time when the Athens server is connected */
    static socketTime = "";

    /** Initial the socket connection */
    static initConn({ state, commit, dispatch }: { commit: Commit, dispatch: Dispatch, state: IStore }) {
        Socket.socketTime = `${ new Date().getTime() }`;
        Cookies.set("panda_socketTime", Socket.socketTime, "1d");

        const conn = (socketClient.hasOwnProperty("sails") ? socketClient : sailsClient(socketClient)) as sailsClient.Client;
              conn.sails.url = process.env.VUE_APP_ATHENS_WEBSOCKET;
              conn.sails.reconnection = true;

        Socket.listen({ state, commit, dispatch });
    }
    
    /** Initial the Athens socket listeners */
    static listen({ state, commit, dispatch }: { commit: Commit, dispatch: Dispatch, state: IStore }) {
        // Listen single login, auto logout, and changed token
        Socket.io.on("order66", (token: string) => {
            if (state.siteState.playFlag) return;
            
            // Check duplicated login
            if (token !== Cookies.get("panda_token")) {
                dispatch("userInfo/doLogout", true, { root: true });
                state.siteState.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, app.$t("messages.error.duplicate"), 60000);
            }
            // Check duplicated tab
            else if (Socket.socketTime !== Cookies.get("panda_socketTime")) {
                dispatch("userInfo/doLogout", false, { root: true });
                state.siteState.eventBus.$emit(Events.ON_MSG_SNACKBAR, true, app.$t("messages.error.duplicate"), 60000);
            }
        });

        // Get all online players
        Socket.io.on("getOnlinePlayers", (playerCount: number) => {
            commit("siteState/setOnlinePlayers", playerCount * Socket.PLAYERS_MULTIPLE);
        });

        // Initial player count of each table
        Socket.io.on("initial_players", (res: { [tableNumber: string]: number }) => {
            Object.entries(res).forEach(([tableNumber, playerCount]) => {
                commit("gameInfo/updateTable", { tableNumber, data: { playerCount: playerCount * Socket.PLAYERS_MULTIPLE }});
            });
        });

        // Update the good tips
        Socket.io.on("goodTipsUpdate", ({ tableNumber, goodTips }: { tableNumber: string, goodTips: string[] }) => {
            commit("tableState/setGoodTipsTables", { tableNumber, toAdd: (goodTips.length > 0) });
        });

        // Check the players who inside the specific table
        Socket.io.on("table_players", ({ tableNumber, playersList }: { tableNumber: string, playersList: any[] }) => {
            commit("gameInfo/updatePlayerInTable", { tableNumber, data: { players: playersList, playerCount: playersList.length * Socket.PLAYERS_MULTIPLE }});
            setTimeout(() => {
                if (tableNumber === state.userInfo.tableSelection.tableNumber)
                    commit("gameInfo/setCurrentTable", { players: playersList, playerCount: playersList.length * Socket.PLAYERS_MULTIPLE });
            }, 500);
        });

        // Update the information of players who inside the specific table
        Socket.io.on("table_user_update", res => {
            commit("gameInfo/updateTablePlayersInfo", res);
        });

        // Update the user's balance
        Socket.io.on("user_balance", (balance: number) => {
            commit("userInfo/updateBalance", balance);
        });

        // Get the new message from the chat
        Socket.io.on("new_message", (chatData: ChatData) => {
            commit("socialInfo/newChatMessage", chatData);
        });

        // Get the Win/Loss amount per round
        Socket.io.on("winloss", ({ win, loss, winloss, tableNumber }: { win: number, loss: number, winloss: number, tableNumber: string }) => {
            const balance = win + loss;
            const formattedBalance = Utils.currency(Math.abs((balance * 100 >> 0) / 100), 3);

            // For the current table
            if (tableNumber === state.userInfo.tableSelection.tableNumber) {
                commit("gameInfo/setWinLoss", winloss);
                setTimeout(() => {
                    state.mediaCtrl.spotFxSound.play("winchips");
                    state.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.state.balance", [balance >= 0 ? "+" : "‒", formattedBalance]), undefined, 3000);
                }, 1000);
            }
            // For the other tables which are in the side bar
            else {
                setTimeout(() => {
                    state.siteState.eventBus.$emit(Events.ON_BET_MSG_SIDEBAR, app.$t("betToast.state.balance", [balance >= 0 ? "+" : "‒", formattedBalance]), tableNumber);
                }, 2000);
            }
        });

        // Update betting data per betItems
        Socket.io.on("betting_results", (res: { data: { tableNumber: string, balance: number } }) => {
            //NOTE remove current user balance included from backend data
            delete res.data.balance;
            commit("gameInfo/setTableBets", { tableNumber: res.data.tableNumber, data: res.data });
        });

        Socket.io.on("disconnect", () => {
            console.error("DISCONNECTED FROM SOCKET");
            dispatch("setSocket");
        });
    }

    /** Post method with Promise */
    static post(url: string, args?: any, ignoreStatus = false) {
        return new Promise<CallbackData>((resolve, reject) => {
            Socket.io.post(url, args, (data, jwRes) => {
                const status = data.body ? data.body.status : data.status;
                if (!ignoreStatus && (jwRes.statusCode !== 200 || status !== 200)) reject(data.msg || `ERROR: ${ url }`);
                else resolve(data);
            });
        });
    }

    /** Get method with Promise */
    static get(url: string, args?: any, ignoreStatus = false) {
        return new Promise<CallbackData>((resolve, reject) => {
            Socket.io.get(url, args, (data, jwRes) => {
                const status = data.body ? data.body.status : data.status;
                if (!ignoreStatus && (jwRes.statusCode !== 200 || status !== 200)) reject(data.msg || `ERROR: ${ url }`);
                else resolve(data);
            });
        });
    }

    private static get io() {
        return (socketClient as any).socket as {
            on  : (event: string, callback: (res: any) => void) => void,
            post: (url: string, args: any, callback: (data: CallbackData, jwRes: { statusCode: number }) => void) => void,
            get : (url: string, args: any, callback: (data: CallbackData, jwRes: { statusCode: number }) => void) => void,
        };
    }
}
