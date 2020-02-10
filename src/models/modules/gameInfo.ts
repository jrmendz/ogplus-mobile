import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import Cookies from "vue-cookies";

import { Config, RoadmapData, TableData, GameTypes, ParticipantData, EmceeData } from "@/models/helper/types";
import Axios from "@/models/helper/axiosConfig";
import store, { IStore } from "@/models/store";
import Socket from "@/models/helper/socket";
import Utils from "@/models/helper/utils";

@Module({ namespaced: true, dynamic: true, store, name: "gameInfo" })
export default class GameInfo extends VuexModule
{
    readonly liveGame = ["E", "P", "M", "G", "C"];
    readonly beadColors = ["#1660de", "#39946a", "#e24735"];
    readonly beadDarkColors = ["#125896", "#007800", "#852721"];
    readonly beadIds = {
        pair: ["", "-pp", "-bp", "-bp-pp"],
        baccarat: ["player", "banker", "tie"],
        dragonTiger: ["dragon", "tiger", "tie"],
        threeCards: ["dragon", "phoenix", "tie", "dragon-star", "phoenix-star"],
    };
    readonly wheelIds = ["x1", "x2", "x5", "x10", "x20", "x40"];

    readonly gameList = [
        {
            name: "all",
            enabled: true,
        }, {
            name: "baccarat",
            icon: require("@/assets/images/games/icons/img_baccarat.png"),
            enabled: true,
        }, {
            name: "emcee",
            icon: require("@/assets/images/games/icons/img_emcee.png"),
            enabled: true,
        }, {
            name: "dragontiger",
            icon: require("@/assets/images/games/icons/img_dragonTiger.png"),
            enabled: true,
        }, {
            name: "classic",
            icon: require("@/assets/images/games/icons/img_baccarat-classic.png"),
            enabled: true,
        }, {
            name: "grand",
            icon: require("@/assets/images/games/icons/img_baccarat-grand.png"),
            enabled: true,
        }, {
            name: "moneywheel",
            icon: require("@/assets/images/games/icons/img_moneywheel.png"),
            enabled: true,
        }, {
            name: "roulette",
            icon: require("@/assets/images/games/icons/img_roulette.png"),
            enabled: true,
        }, {
            name: "threecards",
            icon: require("@/assets/images/games/icons/img_threecards.png"),
            enabled: true,
        }, {
            name: "niuniu",
            icon: require("@/assets/images/games/icons/img_niuniu.png"),
            enabled: true,
        },
        // {
        //     name: "live",
        //     icon: require("@/assets/images/games/icons/img_live.svg"),
        //     enabled: true,
        // }, {
        //     name: "emcee",
        //     icon: require("@/assets/images/games/icons/img_emcee2.svg"),
        //     enabled: true,
        // }, {
        //     name: "cards",
        //     icon: require("@/assets/images/games/icons/img_cards.svg"),
        //     enabled: false,
        // }, {
        //     name: "slots",
        //     icon: require("@/assets/images/games/icons/img_slots.svg"),
        //     enabled: false,
        // },
    ];

    config: Config = null;

    gameSelectionId = 0;

    roadmapList: { [tableNumber: string]: RoadmapData } = {};

    tableBetResults: { [tableNumber: string]: any } = {};
    tableDatas: { [tableNumber: string]: TableData } = {};
    currentTableInfo: { tableNumber: string | null, tableData: TableData | null, roadmap: RoadmapData | null, players: ParticipantData[] | null, winloss: number | null } = {
        tableNumber: null, tableData: null, roadmap: null, players: null, winloss: null,
    };
    
    emceeDatas: { [tableNumber: string]: EmceeData } = {};

    /** For History table name list */
    tableNamesList: string[] = [];

    isInIFrameGame = false;

// #[Getters] ---------- + ---------- + ----------
    get tableDetails() {
        return (tableNumber: string) => {
            const data = this.tableDatas[tableNumber];
            return data ? data : null;
        };
    }

    get lastShoeBet() {
        return (tableNumber: string) => {
            const data = this.tableDatas[tableNumber]["lastShoeBet"];
            return data ? data : null;
        };
    }

    get roadmap() {
        return (tableNumber: string) => {
            const data = this.roadmapList[tableNumber];
            return data ? data : null;
        };
    }

    get sortedTableNames() {
        return this.tableNamesList.sort(Utils.sortAlphaNumeric);
    }

    get dealerImageUrl() {
        return (nickname: string) => {
            if (this.config && this.config.dealer) {
                const dealer = this.config.dealer;
                return dealer ? `${ dealer.url }${ dealer.custom || dealer.defaultStudio }/${ nickname }${ dealer.imageFileType }` : "";
            }
            else return "";
        };
    }
    
// #[Mutations] ---------- + ---------- + ----------
    @Mutation setConfig(config: Config) {
        this.config = config;
    }

    /** Sets the percentage, number of players, and total bets on table */
    @Mutation setTableBets({ tableNumber, data }: { tableNumber: string, data: any }) {
        const update = Object.assign(this.tableBetResults, { [tableNumber]: data });
        this.tableBetResults = { ...update };
    }

    /** Clears the percentage, number of players, and total bets on table */
    @Mutation clearTableBets(tableNumber: string) {
        this.tableBetResults[tableNumber] = null;
    }

    @Mutation setRoadmap({ tableNumber, data }: { tableNumber: string, data: RoadmapData }) {
        const tableData = this.tableDatas[tableNumber];

        // Combine roadmap data and table data
        if (tableData.code === GameTypes.Moneywheel) {
            const count = {
                x1 : tableData.totalResult["1"]  || 0,
                x2 : tableData.totalResult["2"]  || 0,
                x5 : tableData.totalResult["5"]  || 0,
                x10: tableData.totalResult["10"] || 0,
                x20: tableData.totalResult["20"] || 0,
                x40: tableData.totalResult["og"] || 0,
            };
            data.roadMap.count = count;
        }

        this.roadmapList = { ...this.roadmapList, [tableNumber]: data };
    }

    @Mutation setGameSelectionId(value: number) {
        this.gameSelectionId = value;
    }

    @Mutation setCurrentTable({ tableNumber, tableData, roadmap, players }: { tableNumber: string, tableData: TableData, roadmap: RoadmapData, players: any }) {
        this.currentTableInfo.tableData = tableData || this.currentTableInfo.tableData;
        this.currentTableInfo.roadmap = roadmap || this.currentTableInfo.roadmap;
        this.currentTableInfo.tableNumber = tableNumber || this.currentTableInfo.tableNumber;
        this.currentTableInfo.players = players || this.currentTableInfo.players;
    }

    /** Update players info in table */
    @Mutation updateTablePlayersInfo({ id, nickname, balance, imgname, imgname_mobile, tableNumber }: { id: string, nickname: string, balance: number, imgname: string, imgname_mobile: string, tableNumber: string }) {
        if (this.currentTableInfo && this.currentTableInfo.players) {
            this.currentTableInfo.players.forEach((player: any) => {
                if (player.id === id) {
                    player.balance = balance;
                    player.imgname = imgname;
                    player.imgname_mobile = imgname_mobile;
                    player.nickname = nickname;
                }
            });
        }
    }

    /** Set all table names for history module */
    @Mutation setTables({ tableNamesList, tableDatas }: { tableNamesList: string[], tableDatas: { [tableNumber: string]: TableData }}) {
        this.tableNamesList = tableNamesList.filter(tableNumber => !tableNumber.includes("MX"));
        
        for (const [key, value] of Object.entries(tableDatas)) {
            if (value.game)
                tableDatas[key].game.timer = value.game.timer || 0;
            tableDatas[key].playerCount = 0;
        }
        this.tableDatas = tableDatas;

        Socket.post("/tables/players", { token: Cookies.get("panda_token") }, true)
              .then(res => {
                if (res && res.players) {
                    const players = res.players as { [key: string]: { players: number[] } };
                    for (const tableNumber in players) {
                        if (this.tableDatas[tableNumber]) this.tableDatas[tableNumber].playerCount = players[tableNumber].players.length;
                    }
                }
              })
              .catch(err => console.log(err));
    }

    @Mutation setWinLoss(value: number) {
        this.currentTableInfo.winloss = value;
    }

    /** Updates individual table's data */
    @Mutation updateTable({ tableNumber, data }: { tableNumber: string, data: any }) {
        if (!data) return false;

        this.tableDatas[tableNumber] = Utils.merge(this.tableDatas[tableNumber], data);
        if (this.currentTableInfo.tableNumber === tableNumber)
            this.currentTableInfo.tableData = this.tableDatas[tableNumber];
    }

    @Mutation setIsInIframeGame(value: boolean) {
        this.isInIFrameGame = value;
    }

    @Mutation updatePlayerInTable({ tableNumber, data }: { tableNumber: string, data: any }) {
        if (data && this.tableDatas[tableNumber])
            Object.assign(this.tableDatas[tableNumber], data);
    }
    
    @Mutation setLastShoeBet({tableNumber, shoeGame}: {tableNumber: string, shoeGame: string}) {
        this.tableDatas[tableNumber]["lastShoeBet"] = shoeGame;
    }
    
// #[Actions] ---------- + ---------- + ----------
    @Action getRoadmap({ tableNumber, gameType }: { tableNumber: string, gameType: string }) {
        return Axios.get("/roadmaps/road/canvas", { params: { token: Cookies.get("panda_token"), tableNumber, gameType } })
                    .then(res => {
                        if (typeof res.data !== "object") return false;

                        this.context.commit("setRoadmap", { tableNumber, data: res.data });
                        if (this.currentTableInfo.tableNumber)
                            this.currentTableInfo.roadmap = res.data;

                        return res.data;
                    })
                    .catch(e => console.log(e, "Error: /roadmaps/road/canvas"));
    }

    @Action updateEmceeDatas() {
        type EmceeDataBackend = {
            tableNumber: string,
            streamerNickname: string,
            streamerImage: string,
            streamerFollowers: number,
            streamURL: string,
            status: "OFFLINE" | "LIVE",
            [key: string]: any,
        };

        Axios.get("/streamer/tables", { params: { token: Cookies.get("panda_token"), showAll: true }})
             .then((res: { data: { data: EmceeDataBackend[] } }) => {
                const emceeDatas: { [tableNumber: string]: EmceeData } = {};

                for (const data of res.data.data) {
                    const tableData = (this.context.rootState as IStore).gameInfo.tableDatas[data.tableNumber];

                    emceeDatas[data.tableNumber] = {
                        nickname: data.streamerNickname,
                        image: data.streamerImage,
                        followers: data.streamerFollowers,
                        url: JSON.parse(data.streamURL),
                        status: (tableData && ["E3", "E5"].includes(tableData.tableNumber)) ? data.status : "OFFLINE",
                    };
                }

                (this.context.state as this).emceeDatas = emceeDatas;
             });
    }
}
