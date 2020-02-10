<template>
    <v-container id="game" fluid fill-height align-start ma-0 pa-0>
        <router-view />
        <SqueezeBoard v-if="tableState.isSqueezeVisible" />
        <BetMsgToast />
        <Sidebar />
        <ChipAmounts />
        <TapHintBoard v-if="platform.device.isIOS && siteState.isTapHintVisible" />
        <LandDisabled v-if="platform.orientation.isLandscape && tableState.isEmcee" />
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import Events from "@/models/helper/types";

import { Route } from "vue-router";
import { Howl, Howler } from "howler";
import { TableData, TableStatus } from "@/models/helper/types";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    BetMsgToast:     () => import("@/views/games/common/popups/BetMsgToast.vue"),
    ChipAmounts:     () => import("@/views/games/common/popups/ChipAmounts.vue"),
    LandDisabled:    () => import("@/views/games/common/popups/LandDisabled.vue"),
    ScrollHintBoard: () => import("@/views/games/common/popups/ScrollHintBoard.vue"),
    Sidebar:         () => import("@/views/games/common/popups/Sidebar.vue"),
    TapHintBoard:    () => import("@/views/games/common/popups/TapHintBoard.vue"),
    SqueezeBoard:    () => import("@/views/games/common/popups/SqueezeBoard.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    numMissedBet: number = 0;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { immediate: true }) onStatusChange(status: TableStatus) {
        switch (status) {
            case TableStatus.Dealing:
                // Handle the missed bet
                if (this.tableState.hasConfirmBets(this.currentTableData.tableNumber)) this.numMissedBet = 0;
                else {
                    this.numMissedBet++;

                    // Notify the player
                    if (this.numMissedBet === 3)
                        setTimeout(() => { this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.noBet3Rnds"), undefined, 4000); }, 3000);
                    
                    // Redirect to Lobby
                    else if (this.numMissedBet === 5)
                        this.tableState.exitTable({ tableNumber: this.currentTableData.tableNumber, gameType: this.$route.params.id });
                }
                break;

            case TableStatus.Betting:
                this.eventBus.$emit(Events.ON_OPEN_LOADING, false);
                break;
        } 
    }

    @Watch("currentTableData.tableNumber") onTableNumberChanged() {
        this.numMissedBet = 0;
    }

// #[Life Cycle] ---------- + ---------- + ---------- 
    created() {
        this.mediaCtrl.gameBgms.forEach(bgm => bgm.stop());
        // this.siteState.toggleTapHint(true);
    }

    mounted() {
        this.gameInfo.updateEmceeDatas();
        this.$nextTick(() => this.siteState.startLoadingAssets("roadmap"));
        
        if (this.currentTableData.subcode === "bidding")
            this.$nextTick(() => this.siteState.startLoadingAssets("cards"));

        if (this.platform.device.isIOS && this.platform.browser.isChorme)
            window.addEventListener("orientationchange", this.onResize);
    }

    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
    }

// #[Events] ---------- + ---------- + ---------- 
    onResize() {
        this.siteState.upPlatformScreen();
    }

// [Computed] ---------- + ---------- + ----------

}
</script>

<style lang="scss">
#game {
    background-color: $c-black;
    background-image: linear-gradient(147deg, #233d60, #09101b);

    align-items: flex-start;
    color: #ffffff;
}
</style>
