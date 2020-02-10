<template>
    <v-layout id="threecards" ma-0 pa-0>
        <ThreeCardsTablePortrait :tableNumber="tableNumber" v-if="platform.orientation.isPortrait" />
        <ThreeCardsTableLandscape :tableNumber="tableNumber" v-else />
        <ThreeCardsResult v-show="isResultVisible" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite, Back, Bounce } from "gsap";

import { ThreeCardsItems, TableData } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    ThreeCardsResult: () => import("@/views/games/threecards/components/ThreeCardsResult.vue"),
    ThreeCardsTableLandscape: () => import("@/views/games/threecards/components/ThreeCardsTableLandscape.vue"),
    ThreeCardsTablePortrait : () => import("@/views/games/threecards/components/ThreeCardsTablePortrait.vue"),
} })
export default class ThreeCards extends Mixins(GameMixin)
{
    gameItems = ThreeCardsItems;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    beforeDestroy() {
        TweenLite.killTweensOf(".threecards-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        this.onBetItemSub(key);

        this.mediaCtrl.spotFxSound.play("click");
        TweenLite.fromTo(`.threecards-table .chip-temp.chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
    }

// #[Methods] ---------- + ---------- + ----------
    showTable(visible: boolean, hasAnim = true) {
        this.isResultVisible = !visible;
        TweenLite.killTweensOf(".threecards-table.landscape");
        Utils.addStyles("#bet-chips", { pointerEvents: visible ? "auto" : "none" });

        if (this.platform.orientation.isPortrait)
            Utils.addStyles(".threecards-table.portrait", { pointerEvents: visible ? "auto" : "none" });
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#threecards {

}
</style>
