<template>
    <v-layout id="game-content" ma-0 pa-0>
        <GameVideo />
        <ChatBox :tableNumber="userInfo.tableSelection.tableNumber"/>
        <UserInfo />
        <EmceeInfo v-if="tableState.isEmcee" />
        <BetChips :gameType="gameType" />
        <GameButtons />
        <RoadMapInfo v-if="!tableState.isEmcee" :gameType="gameType" />
        <RoadMapInfoEmcee v-else :gameType="gameType" />

        <Baccarat v-if="isBaccarat" :tableNumber="userInfo.tableSelection.tableNumber" />
        <DragonTiger v-else-if="isDragonTiger" :tableNumber="userInfo.tableSelection.tableNumber" />
        <Moneywheel v-else-if="isMoneywheel" :tableNumber="userInfo.tableSelection.tableNumber" />
        <Roulette v-else-if="isRoulette" :tableNumber="userInfo.tableSelection.tableNumber" />
        <Niuniu v-else-if="isNiuniu" :tableNumber="userInfo.tableSelection.tableNumber" />
        <ThreeCards v-else-if="isThreeCards" :tableNumber="userInfo.tableSelection.tableNumber" />
        
        <Participants v-if="!tableState.isEmcee" />
        <TableState />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { GameTypes } from "@/models/helper/types";
import { Route } from "vue-router";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    GameVideo   : () => import("@/views/games/common/sections/GameVideo.vue"),
    ChatBox     : () => import("@/views/games/common/popups/ChatBox.vue"),
    UserInfo    : () => import("@/views/games/common/sections/UserInfo.vue"),
    EmceeInfo   : () => import("@/views/games/common/sections/EmceeInfo.vue"),
    BetChips    : () => import("@/views/games/common/sections/BetChips.vue"),
    Participants: () => import("@/views/games/common/sections/Participants.vue"),
    GameButtons : () => import("@/views/games/common/sections/GameButtons.vue"),
    TableState  : () => import("@/views/games/common/sections/TableState.vue"),

    RoadMapInfo : () => import("@/views/games/common/sections/RoadMapInfo.vue"),
    RoadMapInfoEmcee: () => import("@/views/games/common/sections/RoadMapInfoEmcee.vue"),

    Baccarat   : () => import("@/views/games/baccarat/Baccarat.vue"),
    DragonTiger: () => import("@/views/games/dragontiger/DragonTiger.vue"),
    Moneywheel : () => import("@/views/games/moneywheel/Moneywheel.vue"),
    Roulette   : () => import("@/views/games/roulette/Roulette.vue"),
    Niuniu     : () => import("@/views/games/niuniu/Niuniu.vue"),
    ThreeCards : () => import("@/views/games/threecards/ThreeCards.vue"),
} })
export default class extends Mixins(ModulesMixin)
{

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    checkRoute(search: string) {
        const routePath = this.$route.path;
        return routePath ? (routePath.indexOf(search) !== -1) : false;
    }

// #[Computed] ---------- + ---------- + ----------
    get isBaccarat   () { return this.checkRoute(GameTypes.Baccarat   ); }
    get isDragonTiger() { return this.checkRoute(GameTypes.DragonTiger); }
    get isMoneywheel () { return this.checkRoute(GameTypes.Moneywheel ); }
    get isRoulette   () { return this.checkRoute(GameTypes.Roulette   ); }
    get isThreeCards () { return this.checkRoute(GameTypes.ThreeCards ); }
    get isNiuniu     () { return this.checkRoute(GameTypes.Niuniu     ); }

    get gameType() {
             if (this.isBaccarat   ) return GameTypes.Baccarat;
        else if (this.isDragonTiger) return GameTypes.DragonTiger;
        else if (this.isMoneywheel ) return GameTypes.Moneywheel;
        else if (this.isRoulette   ) return GameTypes.Roulette;
        else if (this.isThreeCards ) return GameTypes.ThreeCards;
        else if (this.isNiuniu     ) return GameTypes.Niuniu;
    }
}
</script>

<style lang="scss">
#game-content {
    height: 100%;
    min-height: 960px;

    @include land-only {
        min-height: 480px;
    }
}
</style>
