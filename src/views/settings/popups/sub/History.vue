<template>
    <SettingPopup id="history" :event="event" no-scroll hasTitle>
        <template v-slot:title>{{ $t("subSetting.history.title") }}</template>
        <v-form v-model="formValid">
            <v-layout row wrap>
                <v-flex xs12>
                    <v-layout row wrap>
                        <v-flex xs6>
                            <v-select class="selector" :label="$t('subSetting.history.betDate')" :items="daysList" item-text="text" item-value="value" v-model="daysSelect" outline light @change="onGetBetHistory()" />
                        </v-flex>
                        <v-flex xs6>
                            <v-select class="selector" :label="$t('subSetting.history.game')" :items="gamesList" item-text="text" item-value="value" v-model="gameSelect" outline light @change="onGetBetHistory()" />
                        </v-flex>
                    </v-layout>
                </v-flex>
                <!-- <v-flex d-flex fill-height align-content-start xs3 sm2>
                    <v-btn :disabled="!formValid" class="search" color="#ffffff" @click="onGetBetHistory()">{{ $t("subSetting.history.search") }}</v-btn>
                </v-flex> -->
            </v-layout>
        </v-form>
        <v-flex xs12 mt-2 @click="onCancelSelect()">
            <v-data-table ref="dataTable" class="data-table" :headers="historyHeaders" :items="historyList" :pagination.sync="historyPagination" hide-actions>
                <template v-slot:items="props">
                    <tr @click.stop="onSelectItem(props)">
                        <td class="small-text" v-html="props.item.betDate.substr(2).replace(' ', '<br>')"></td>
                        <td class="small-text">{{ props.item.table }}<span v-if="props.item.isEmcee" class="emcee-text">(MC)</span><br>{{ props.item.shoeNo }}</td>
                        <td class="bet-code">{{ $t("subSetting.history.more") }}</td>
                        <td>{{ formatAmount(props.item.amount) }}</td>
                        <td :style="getWinLossStyle(props.item.winLoss)">{{ formatAmount(props.item.winLoss) }}</td>
                    </tr>
                </template>
                <template v-slot:no-data>
                    <v-icon id="none-icon" class="pr-2">warning</v-icon><span>{{ $t("noHistory") }}</span>
                </template>
            </v-data-table>
        </v-flex>
        <div class="summary">
            <div v-for="(item, index) in summaryResult" :key="index">
                <span class="label">{{ item.text }}: </span><span class="value">{{ item.value }}</span>
            </div>
        </div>
        <HistoryResult v-if="!!selectedHistoryData" :historyData="selectedHistoryData" :onClose="onCancelSelect" />
    </SettingPopup>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import moment from "moment";

import Events, { HistoryData, TableData, GameTypes } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
    HistoryResult: () => import("@/views/settings/components/HistoryResult.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    readonly event = Events.ON_HISTORY;

    daysSelect = 7;
    gameSelect = "all";

    formValid = false;
    historyList: HistoryData[] = [];
    historyPagination = {
        descending: true, page: 1, rowsPerPage: -1, sortBy: "betDate", totalItems: 0,
    };
    summary = { transNo: "", validBet: "", winLoss: "" };

    selectedHistoryData: HistoryData | null = null;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(this.event, this.onGetBetHistory);
    }

    beforeDestroy() {
        this.eventBus.$off(this.event, this.onGetBetHistory);
    }

// #[Events] ---------- + ---------- + ----------
    onSelectItem({ index, item }: { index: number, item: HistoryData, selected: boolean }) {
        this.selectedHistoryData = null;
        setTimeout(() => this.selectedHistoryData = item, 200);
    }
    
    onCancelSelect() {
        this.selectedHistoryData = null;
    }

    async onGetBetHistory(date: any) {
        this.onCancelSelect();
        this.summary = { transNo: "", validBet: "", winLoss: "" };
        
        let tableId: string | number | number[] = "";
        if (this.gameSelect) {
            if (this.gameSelect !== "all") {
                tableId = Object.keys(this.gameInfo.tableDatas).filter(tableNumber => {
                    const isTarget = this.gameInfo.tableDatas[tableNumber].code === this.gameSelect;
                    const isSpecTables = tableNumber.includes("MX");

                    return isTarget && !isSpecTables;
                })
                .map(tableNumber => this.gameInfo.tableDatas[tableNumber].id);
            }
        }
        else this.gameSelect = "all";

        this.historyList = await this.historyInfo.getBetHistory({
            fromDate: moment().add(1 - this.daysSelect, "day").format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),
            tableId,
        });

        if (this.historyList.length) {
            const totalSummary = this.historyList.reduce((a, b) => ({ amount: a.amount + b.amount, winLoss: a.winLoss + b.winLoss } as any));
            this.summary.transNo = this.formatAmount(this.historyList.length);
            this.summary.validBet = this.formatAmount(totalSummary.amount);
            this.summary.winLoss = this.formatAmount(totalSummary.winLoss);
        }
    }

// #[Methods] ---------- + ---------- + ----------
    formatAmount(amount: any) {
        if (amount !== null) return Utils.currency((amount * 100 >> 0) / 100, 3);
        else return "";
    }

    getWinLossStyle(winLoss: number) {
        if (winLoss <= 0) return "color: #808080; font-weight: bold;";
        else if (winLoss > 0) return "color: #4caf50; font-weight: bold;";

        return "";
    }

// #[Computed] ---------- + ---------- + ----------
    get historyHeaders() {
        return [
            { value: "betDate", align: "center", text: this.$t("subSetting.history.betDate") },
            { value: "table"  , align: "center", text: this.$t("subSetting.history.table"  ) },
            { value: "betCode", align: "center", text: this.$t("subSetting.history.betCode") },
            { value: "amount" , align: "center", text: this.$t("subSetting.history.amount" ) },
            { value: "winLoss", align: "center", text: this.$t("subSetting.history.winLoss") },
        ];
    }

    get daysList() {
        return [
            { text: this.$t("subSetting.history.day" , [ 1]), value:  1 },
            { text: this.$t("subSetting.history.days", [ 3]), value:  3 },
            { text: this.$t("subSetting.history.days", [ 7]), value:  7 },
            { text: this.$t("subSetting.history.days", [30]), value: 30 },
        ];
    }

    get gamesList() {
        return [
            { text: this.$t("subSetting.history.all"), value: "all" },
            { text: this.$t("gameNames.baccarat"    ), value: GameTypes.Baccarat },
            { text: this.$t("gameNames.allDT"       ), value: GameTypes.DragonTiger },
            { text: this.$t("gameNames.moneywheel"  ), value: GameTypes.Moneywheel },
            { text: this.$t("gameNames.roulette"    ), value: GameTypes.Roulette },
            { text: this.$t("gameNames.threecards"  ), value: GameTypes.ThreeCards },
            { text: this.$t("gameNames.niuniu"      ), value: GameTypes.Niuniu },
            //TODO { text: $t("gameNames.sicbo"), value: "sicbo" },
        ];
    }
    
    get summaryResult() {
        return [
            { text: this.$t("subSetting.summary.transNo" ) , value: this.summary.transNo  },
            { text: this.$t("subSetting.summary.validBet") , value: this.summary.validBet },
            { text: this.$t("subSetting.summary.winLoss" ) , value: this.summary.winLoss  },
        ];
    }
}
</script>

<style lang="scss">
#history {
    .selector {
        @include text-field-outline(#ffffff, #ffffff, 0.9);

        .v-input__control {
            height: 50px;
            z-index: 999;

            .v-select__slot {
                margin: 0 -5px;
                z-index: 999;
            }
            .v-select__selection {
                color: #ffffff;
                font-size: 18px;
                letter-spacing: -1px;
                transform: translateY(-3px);
            }
            .v-input__append-inner {
                margin-right: -15px;
            }
            .v-input__icon--clear {
                .v-icon {
                    margin-right: 25px;
                }
            }
        }
    }
    .search {
        transform: scaleX(0.9) translateX(-10%) translateY(-2px);
        height: 51.5px;

        border-radius: 5px;
        background: linear-gradient(to bottom, #f5f6f6 0%,#dbdce2 21%,#b8bac6 92%);

        color: #000000;
        font-weight: bold;
        font-size: 14px;

        &.v-btn--disabled {
            color: #555555 !important;
            caret-color: #555555 !important;

            opacity: 0.6;
        }

        @include sm-and-up {
            transform: scaleX(1);
            height: 50px;
            right: 0px;

            font-size: 16px;
        }
    }
    .data-table {
        @include data-table-outline(calc(100vh - 370px), calc(100vh - 230px));
        margin-top: 40px;
        letter-spacing: -1px;
        line-height: 18px;

        table.v-datatable tbody td.small-text {
            font-size: 12px;

            .emcee-text {
                padding-left: 5px;
                color: $c-light-purple;
            }
        }
        table.v-datatable tbody td.bet-code {
            color: #4caf50;
        }

        table.v-datatable thead tr {
            position: absolute;
            display: block;
            top: 105px;
            left: 2.5%;
            width: 95%;
            height: 35px;

            border: none;
            border-bottom: 2px solid #ffffff;

            @include land-only {
                left: 1%;
                width: 98%;
            }
        }
        table.v-datatable thead tr th {
            height: 35px;
            line-height: 35px;

            @include land-only {
                width: calc(5%);
            }
        }
        table.v-datatable {
            thead th, tbody td {
                width: calc(1 / 6 * 100%);
            }
        }
    }
    .history-result-card {
        position: absolute;
        z-index: 1;

        bottom: 15px;
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
                    color: $c-main;
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
    }

    #none-icon {
        transform: translateY(3px);
    }

    .summary {
        position: relative;
        bottom: -5px;
        height: 20px;
        width: 100%;

        font-size: 12px;
        line-height: 20px;

        div {
            display: inline-block;
            width: 32%;

            .label {
                color: $c-main;
            }
        }
    }
}
.v-menu__content {
    .v-select-list {
        background-color: #ffffff;
        border-color: #ffffff;
        color: rgba(#000000, 0.87);

        .v-list {
            background: #ffffff;
            color: rgba(#000000, 0.87);
        }
    }
}
</style>
