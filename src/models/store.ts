import Cookies from "vue-cookies";
import Vue from "vue";
import Vuex from "vuex";

import Events, { TableData, TableStatus } from "./helper/types";
import Socket from "./helper/socket";

Vue.use(Vuex);

export interface IStore {
    gameInfo   : import("./modules/gameInfo"   ).default;
    historyInfo: import("./modules/historyInfo").default;
    mediaCtrl  : import("./modules/mediaCtrl"  ).default;
    siteState  : import("./modules/siteState"  ).default;
    socialInfo : import("./modules/socialInfo" ).default;
    tableState : import("./modules/tableState" ).default;
    userInfo   : import("./modules/userInfo"   ).default;
}

export default new Vuex.Store<IStore>(
{
    actions: {
        /** Configure Socket connection to Athens-API */
        setSocket({ commit, dispatch, state }) {
            return new Promise(async (resolve, reject) => {
                Socket.initConn({ commit, state, dispatch });
                Socket.get("/socket/join-room", { token: Cookies.get("panda_token") }, true)
                      .then(res => console.log(res));
                Socket.get("/config", null, true)
                      .then(res => commit("gameInfo/setConfig", res.data));

                dispatch("setGameSocket");

                // Loop until roadmaps are available then resolve and clear interval
                let roadmaps = 0;
                const roadChecker = setInterval(() => {
                    roadmaps = Object.keys(state.gameInfo.roadmapList).length;
                    if (roadmaps > 0) {
                        clearInterval(roadChecker);
                        resolve();
                    }
                }, 1);
            });
        },

        /** Configure Socket connection to Game server for tables/road update */
        setGameSocket({ commit, state, dispatch }) {
            const x = new WebSocket(`${ process.env.VUE_APP_WS }/${ Cookies.get("panda_token") }`);
                  x.onmessage = res => {
                    const data: { tables?: { [tableNumber: string]: TableData } } = JSON.parse(res.data);
                    if (!data.tables) return;
                    
                    /** The table number of the table which player selected currently */
                    const tableNumber = state.userInfo.tableSelection.tableNumber;
                    const tableDatas = state.gameInfo.tableDatas;

                    const tableNamesList = Object.keys(data.tables);

                    // Update the cards immediately when player is in the non-bidding table
                    if (tableNumber && data.tables[tableNumber] && tableDatas[tableNumber].subcode !== "bidding") {
                        if (data.tables[tableNumber].game && data.tables[tableNumber].game.cards)
                            state.siteState.eventBus.$emit(Events.ON_DRAW_CARDS, data.tables[tableNumber].game.cards);
                    }

                    // Checks if the blast of data is sent and should initial all data inside `tableDatas`
                    if (tableNamesList.length > 3 && !state.siteState.isInitialized) {
                        commit("gameInfo/setTables", { tableNamesList, tableDatas: data.tables });
                        for (const tableNum of tableNamesList) {
                            const table = data.tables[tableNum];
                            if (table.status === TableStatus.Disconnected) continue;

                            dispatch("gameInfo/getRoadmap", { tableNumber: tableNum, gameType: table.code });
                            dispatch("tableState/getTableBets", { tableNumber: tableNum, tableId: table.id, gameSet: table.gameSet });
                        }
                    }

                    // Update the single data for each table
                    else if  (tableNamesList.length !== 0) {
                        const tableNum = tableNamesList[0];
                        const table = data.tables[tableNum];

                        // Update table data for each message received
                        commit("gameInfo/updateTable", { tableNumber: tableNum, data: table });

                        // Update Roadmap and Make sure to clear table bets Every game result
                        if (table.status && table.status === TableStatus.Default) {
                            dispatch("gameInfo/getRoadmap", { tableNumber: tableNum, gameType: tableDatas[tableNum].code || "" });
                            commit("gameInfo/clearTableBets", tableNum);
                        }
                    }
                  };
        },
    },
});
