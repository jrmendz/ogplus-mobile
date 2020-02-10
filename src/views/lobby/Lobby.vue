<template>
    <v-container id="lobby" :class="gameInfo.isInIFrameGame && 'in-iframe-game'" fluid fill-height align-start ma-0 pa-0>
        <router-view />
        <UserMenu v-if="!gameInfo.isInIFrameGame" />
        <GameMenu v-if="!gameInfo.isInIFrameGame" />
        <!-- <TapHintBoard v-if="platform.device.isIOS && siteState.isTapHintVisible" /> -->
    </v-container>
</template>
<script lang="ts">

import Cookies from "vue-cookies";

import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";
import { Howl, Howler } from "howler";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    GameMenu    : () => import("@/views/lobby/sections/GameMenu.vue"),
    TapHintBoard: () => import("@/views/games/common/popups/TapHintBoard.vue"),
    UserMenu    : () => import("@/views/lobby/sections/UserMenu.vue"),
} })
export default class extends Mixins(ModulesMixin)
{

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        window.scrollTo(0, 0);
        this.siteState.setLanguage(this.userInfo.getUserLang);
        this.$nextTick(() => this.siteState.startLoadingAssets("roadmap"));
    }

// #[Methods] ---------- + ---------- + ---------- 


// #[Events] ---------- + ---------- + ---------- 


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#lobby {
    background-color: $c-black;
    background-image: linear-gradient(147deg, #233d60, #09101b);

    align-items: flex-start;

    &.in-iframe-game {
        background-image: none;
    }
}
</style>
