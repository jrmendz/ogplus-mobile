<template>
    <v-layout id="moneywheel" ma-0 pa-0>
        <MoneywheelTablePortrait v-if="platform.orientation.isPortrait" :tableNumber="tableNumber" />
        <MoneywheelTableLandscape v-else :tableNumber="tableNumber" />
        <MoneywheelResult v-show="isResultVisible" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import { MoneywheelItems, TableData, TableStatus } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    MoneywheelResult: () => import("@/views/games/moneywheel/components/MoneywheelResult.vue"),
    MoneywheelTableLandscape: () => import("@/views/games/moneywheel/components/MoneywheelTableLandscape.vue"),
    MoneywheelTablePortrait : () => import("@/views/games/moneywheel/components/MoneywheelTablePortrait.vue"),
} })
export default class Moneywheel extends Mixins(GameMixin)
{
    gameItems = MoneywheelItems;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { immediate: true }) onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                setTimeout(() => this.showTable(true), 500);
                break;

            case TableStatus.Dealing:
                this.showTable(false);
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.showTable(this.currentTableData.status === TableStatus.Betting, false);
    }

    beforeDestroy() {
        TweenLite.killTweensOf(".moneywheel-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        this.onBetItemSub(key);

        this.mediaCtrl.spotFxSound.play("click");
        TweenLite.fromTo(`.moneywheel-table .chip-temp.chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
    }

// #[Methods] ---------- + ---------- + ----------
    showTable(visible: boolean, hasAnim = true) {
        this.isResultVisible = !visible;
        TweenLite.killTweensOf(".moneywheel-table.landscape");
        // Utils.addStyles("#bet-chips", { pointerEvents: visible ? "auto" : "none" });

        if (this.platform.orientation.isPortrait)
            Utils.addStyles(".moneywheel-table.portrait", { pointerEvents: visible ? "auto" : "none" });
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#moneywheel {

}
</style>
