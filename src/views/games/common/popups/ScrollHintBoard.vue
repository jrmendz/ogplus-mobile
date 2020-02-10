<template>
    <v-container id="scroll-hint-board" fluid fill-height justify-center ma-0 pa-0>
        <div>{{ $t("messages.scroll") }}</div>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { cssua } from "cssuseragent";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        window.scrollTo(0, 0);

        if (cssua.ua.crios) {
            this.siteState.upPlatformScreen();

            if (this.mediaCtrl.isVideoVisible) {
                this.mediaCtrl.toggleVideo();
                setTimeout(() => this.mediaCtrl.toggleVideo(), 200);
            }
        }

        window.addEventListener("scroll", this.onScroll);
    }

    beforeDestroy() {
        window.removeEventListener("scroll", this.onScroll);
    }

// #[Events] ---------- + ---------- + ----------
    onScroll() {
        const top = document.documentElement.scrollTop || document.body.scrollTop;

        if (top > 30) this.siteState.toggleScrollHint(false);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#scroll-hint-board {
    position: fixed;
    z-index: 3;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(#000000, 0.5);

    div {
        position: absolute;
        top: calc(50% - 50px);
        left: calc(50% - 50px);
        width: 100px;
        height: 100px;

        color: $c-main;
        font-weight: bold;
        font-size: 16px;
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

            border: $c-main 3px solid;
            border-radius: 50%;

            transform: scale(1.5);
            animation: circle-scale 1s infinite;
        }
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
}
</style>
