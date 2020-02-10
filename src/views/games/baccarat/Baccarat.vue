<template>
    <v-layout id="baccarat" ma-0 pa-0>
        <BaccaratTablePortrait :tableNumber="tableNumber" v-if="platform.orientation.isPortrait" />
        <BaccaratTableLandscape :tableNumber="tableNumber" v-else />
        <BaccaratResult v-show="isResultVisible" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import { BaccaratItems } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    BaccaratResult: () => import("@/views/games/baccarat/components/BaccaratResult.vue"),
    BaccaratTableLandscape: () => import("@/views/games/baccarat/components/BaccaratTableLandscape.vue"),
    BaccaratTablePortrait : () => import("@/views/games/baccarat/components/BaccaratTablePortrait.vue"),
} })
export default class Baccarat extends Mixins(GameMixin)
{
    gameItems = BaccaratItems;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    beforeDestroy() {
        TweenLite.killTweensOf(".baccarat-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        this.onBetItemSub(key);

        this.mediaCtrl.spotFxSound.play("click");
        TweenLite.fromTo(`.baccarat-table .chip-temp.chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
    }

// #[Methods] ---------- + ---------- + ----------
    showTable(visible: boolean, hasAnim = true) {
        this.isResultVisible = !visible;
        TweenLite.killTweensOf(".baccarat-table.landscape");
        Utils.addStyles("#bet-chips", { pointerEvents: visible ? "auto" : "none" });

        if (this.platform.orientation.isPortrait)
             Utils.addStyles(".baccarat-table.portrait", { pointerEvents: visible ? "auto" : "none" });
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#baccarat {

}
</style>
