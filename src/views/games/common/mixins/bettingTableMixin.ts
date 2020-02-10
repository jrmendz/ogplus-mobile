import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import { GameTypes, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Socket from "@/models/helper/socket";
import Utils from "@/models/helper/utils";

@Component({})
export default class extends Mixins(ModulesMixin)
{
    canBet: boolean = false;
    
    percentages: { [key: string]: any } = {
        tie: 0, player: 0, banker: 0, dragon: 0, tiger: 0, tcdragon: 0, tcphoenix: 0, tclucky: 0
    };
    players: { [key: string]: number } = {
        tie: 0, player: 0, banker: 0, dragon: 0, tiger: 0, mw1: 0, mw2: 0, mw5: 0, mw10: 0, mw20: 0, mwOG: 0, tcdragon: 0, tcphoenix: 0, tclucky: 0
    };
    bettings: { [key: string]: number } = {
        tie: 0, player: 0, banker: 0, dragon: 0, tiger: 0, mw1: 0, mw2: 0, mw5: 0, mw10: 0, mw20: 0, mwOG: 0, tcdragon: 0, tcphoenix: 0, tclucky: 0
    };

// #[Props] ---------- + ---------- + ----------
    @Prop() tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("gameInfo.tableBetResults", { deep: true, immediate: true }) onDataChanged(val: any) {
        if (val.hasOwnProperty(this.tableNumber)) {
            const data = val[this.tableNumber];
            if (!data) return;

            // Assign Percantages
            if (Object.keys(data.bet_percentages).length > 0)
                Object.entries(data.bet_percentages).forEach(([key, value]) => this.percentages[key.replace("3c-", "tc")] = value);

            // Assign Player count and Betting total count
            Object.entries(data.totalUsersAndBettings).forEach(([key, value]: any) => {
                if (this.currentTableData.code === GameTypes.Moneywheel)
                    key = "mw" + key.toUpperCase();

                this.players[key.replace("3c-", "tc")] = value[0].total_users;
                this.bettings[key.replace("3c-", "tc")] = value[0].total_bets;
            });
        }
    }

    @Watch("currentTableData.status") onStatusChanged(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.canBet = true;
                Object.keys(this.bettings   ).forEach(key => this.bettings[key]    = 0);
                Object.keys(this.players    ).forEach(key => this.players[key]     = 0);
                Object.keys(this.percentages).forEach(key => this.percentages[key] = 0);
                break;
            
            case TableStatus.Shuffling:
                Object.keys(this.bettings   ).forEach(key => this.bettings[key]    = 0);
                Object.keys(this.players    ).forEach(key => this.players[key]     = 0);
                Object.keys(this.percentages).forEach(key => this.percentages[key] = 0);
                break;

            default:
                this.canBet = false;
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        (this.$parent as any).onBetItem(key);
        this.$forceUpdate();
    }

    onToggleSuper6() {
        if (!this.hasConfirmedBets) {
            this.mediaCtrl.spotFxSound.play("click");
            this.tableState.toggleSuper6();
        }
    }

// #[Methods] ---------- + ---------- + ----------
    formatAmount(amount: number) {
        return Utils.currency((amount * 100 >> 0) / 100, 3);
    }

// #[Computed] ---------- + ---------- + ----------
    get hasConfirmedBets() {
        return this.tableState.tableConfirmBets.hasOwnProperty(this.tableNumber) && Object.keys(this.tableState.tableConfirmBets[this.tableNumber]).length > 0;
    }

    get betItems(): { [item: string]: string } {
        return (this.$parent as any).betItems;
    }

    get isSuper6() {
        return this.tableState.isSuper6;
    }

    get isEmcee() {
        return this.tableState.isEmcee;
    }

    get PLAYERS_MULTIPLE() {
        return Socket.PLAYERS_MULTIPLE;
    }
}
