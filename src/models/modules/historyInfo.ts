import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import Cookies from "vue-cookies";
import moment from "moment";

import { HistoryData } from "@/models/helper/types";
import Axios from "@/models/helper/axiosConfig";
import store from "@/models/store";

@Module({ namespaced: true, dynamic: true, store, name: "historyInfo" })
export default class HistoryInfo extends VuexModule
{


// #[Getters] ---------- + ---------- + ----------


// #[Mutations] ---------- + ---------- + ----------


// #[Actions] ---------- + ---------- + ----------
    @Action async getBetHistory({ fromDate, toDate, shoeHandId, tableId, page }: { fromDate: string, toDate: string, shoeHandId?: string, tableId?: string | number[], page?: number }) {
        const params = {
            token: Cookies.get("panda_token"),
            fromDate: moment(fromDate + " 00:00:00").utc().format("YYYY-MM-DD HH:mm:ss"),
            toDate: moment(toDate + " 23:59:59").utc().format("YYYY-MM-DD HH:mm:ss"),
            shoehand_id: shoeHandId || "",
            table_id: (tableId && JSON.stringify(tableId)) || "",
            page: page || 1,
            perPage: 9999,    // Need to fix backend for this one
        };

        return Axios.get("/transaction/multiple_records", { params })
                    .then(res => {
                        if (res.data.data.betting_history.length > 0) {
                            /** Remap data to match local data mappings for history component */
                            const retData = res.data.data.betting_history.map((x: any) => {
                                return {
                                    amount: x.bet_amount,
                                    betCode: x.bet_code,
                                    table: x.tablenumber,
                                    shoeNo: x.shoehandnumber,
                                    winLoss: x.win_loss,
                                    gameValues: x.gameValues,
                                    gameCode: x.gamecode,
                                    betArea: x.bet_place,
                                    betDate: moment.utc(x.bet_date).local().format("YYYY-MM-DD HH:mm:ss"),
                                    isEmcee: x.isEmcee >= 1,
                                } as HistoryData;
                            });
                            return retData as HistoryData[];
                        }
                        else return [];
                    })
                    .catch(e => {
                        console.log(e, "Error: /transaction/multiple_records");
                        return [];
                    });
    }
}
