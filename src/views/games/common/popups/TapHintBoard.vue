<template>
    <v-container id="tap-hint-board" fluid fill-height justify-center ma-0 pa-0 @click="onClick()">
        <div class="text-holder"> {{ $t("messages.welcome") }}</div>
        <div class="animated-circle"></div>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------
    onClick() {
        this.siteState.toggleTapHint(false);

        if (this.mediaCtrl.isVideoVisible) {
            this.mediaCtrl.toggleVideo();
            this.mediaCtrl.toggleVideoSnd(true);
            setTimeout(() => this.mediaCtrl.toggleVideo(), 200);
        }
        // this.mediaCtrl.randomBgm();
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#tap-hint-board {
    position: fixed;
    z-index: 3;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(#000000, 0.5);

    .animated-circle {
        position: absolute;
        top: calc(50% - 50px);
        left: calc(50% - 50px);
        width: 100px;
        height: 100px;

        color: $c-main;
        font-weight: bold;
        font-size: 20px;
        line-height: 100px;

        border: $c-main 1px solid;
        border-radius: 50%;
        background: rgba($c-main-light, 0.2);

        pointer-events: none;
        
        &::before { 
            content: "";
            
            position: absolute;
            top: calc(50% - 50px);
            left: calc(50% - 50px);
            width: 100px;
            height: 100px;

            padding-top: 100%;
            border: $c-main 3px solid;
            border-radius: 50%;

            transform: scale(1.5);
            animation: circle-scale 1s infinite;
        }
    }

    .text-holder {
        color: $c-main;
        width: 80px;
    }
    @keyframes circle-scale {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            translate: scale(1.2);
            opacity: 0;
        }
    }
    @media (min-width: 410px) {
   
    }
}
</style>
