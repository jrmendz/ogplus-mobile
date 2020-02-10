<template>
    <v-layout id="niuniu" ma-0 pa-0>
        <NiuniuTablePortrait :tableNumber="tableNumber" v-if="platform.orientation.isPortrait" />
        <NiuniuTableLandscape :tableNumber="tableNumber" v-else />
        <NiuniuResult v-show="isResultVisible" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events, { NiuniuItems } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    NiuniuResult: () => import("@/views/games/niuniu/components/NiuniuResult.vue"),
    NiuniuTablePortrait : () => import("@/views/games/niuniu/components/NiuniuTablePortrait.vue"),
    NiuniuTableLandscape: () => import("@/views/games/niuniu/components/NiuniuTableLandscape.vue"),
} })
export default class Niuniu extends Mixins(GameMixin)
{
    gameItems = NiuniuItems;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    beforeDestroy() {
        TweenLite.killTweensOf(".niuniu-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        const betMutiple = key.includes("Many") ? 11 : (key.includes("Double") ? 5 : 1);

        const tableBets = this.tableState.tableBets[this.tableNumber];
        const tableConfirmBets = this.tableState.tableConfirmBets[this.tableNumber];

        let tempBalance = 0;
        for (const item of Object.keys(tableBets)) {
            const mutiple = item.includes("Many") ? 11 : (item.includes("Double") ? 5 : 1);
            tempBalance += tableBets[item] * mutiple;
        }
        for (const item of Object.keys(tableConfirmBets)) {
            const mutiple = item.includes("Many") ? 11 : (item.includes("Double") ? 5 : 1);
            tempBalance += tableConfirmBets[item] * mutiple;
        }

        let amount = this.tableState.chipAmounts[this.tableState.chipSelection];
        if (this.tableState.chipAmounts[this.tableState.chipSelection] * betMutiple > this.userInfo.balance - tempBalance) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.noFund"));
            amount = (this.userInfo.balance - tempBalance) / betMutiple;
        }
        
        if (amount > 0.01) this.onBetItemSub(key, amount);

        this.mediaCtrl.spotFxSound.play("click");
        TweenLite.fromTo(`.niuniu-table .chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
    }

// #[Methods] ---------- + ---------- + ----------
    showTable(visible: boolean, hasAnim = true) {
        this.isResultVisible = !visible;
        TweenLite.killTweensOf(".niuniu-table.landscape");
        Utils.addStyles("#bet-chips", { pointerEvents: visible ? "auto" : "none" });

        if (this.platform.orientation.isPortrait)
            Utils.addStyles(".niuniu-table.portrait", { pointerEvents: visible ? "auto" : "none" });
    }
}

// #[Computed] ---------- + ---------- + ----------


</script>

<style lang="scss">
#niuniu {

}
</style>
