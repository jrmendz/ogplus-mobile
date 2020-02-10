<template>
    <v-layout id="dragontiger" ma-0 pa-0>
        <DragonTigerTablePortrait :tableNumber="tableNumber" v-if="platform.orientation.isPortrait" />
        <DragonTigerTableLandscape :tableNumber="tableNumber" v-else />
        <DragonTigerResult v-show="isResultVisible" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import { DragonTigerItems } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    DragonTigerTablePortrait: () => import("@/views/games/dragontiger/components/DragonTigerTablePortrait.vue"),
    DragonTigerTableLandscape: () => import("@/views/games/dragontiger/components/DragonTigerTableLandscape.vue"),
    DragonTigerResult: () => import("@/views/games/dragontiger/components/DragonTigerResult.vue"),
} })
export default class DragonTiger extends Mixins(GameMixin)
{
    gameItems = DragonTigerItems;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    beforeDestroy() {
        TweenLite.killTweensOf(".dragontiger-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string) {
        this.onBetItemSub(key);

        this.mediaCtrl.spotFxSound.play("click");
        TweenLite.fromTo(`.dragontiger-table .chip-temp.chip-${ key }`, 0.2, { y: -10, scale: 1.35 }, { y: 0, scale: 1 });
    }

// #[Methods] ---------- + ---------- + ----------
    showTable(visible: boolean, hasAnim = true) {
        this.isResultVisible = !visible;
        TweenLite.killTweensOf(".dragontiger-table.landscape");
        Utils.addStyles("#bet-chips", { pointerEvents: visible ? "auto" : "none" });

        if (this.platform.orientation.isPortrait)
            Utils.addStyles(".dragontiger-table.portrait", { pointerEvents: visible ? "auto" : "none" });
    }


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#dragontiger {

}
</style>
