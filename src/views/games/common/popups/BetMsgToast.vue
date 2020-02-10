<template>
    <transition name="toast-fade">
        <v-container v-if="isOpening" id="bet-msg-toast" fluid fill-height align-start ma-0 pa-0>
            <div :style="background">{{ msg }}</div>
        </v-container>
    </transition>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    isOpening = false;

    msg = "Message Test";
    color = "#000000";

    toastTimeout = -1;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        this.eventBus.$on(Events.ON_BET_MSG_TOAST, this.onBetMsgToast);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_BET_MSG_TOAST, this.onBetMsgToast);
    }

// #[Events] ---------- + ---------- + ----------
    onBetMsgToast(msg: string, color: string = "#000000", duration: number = 2000) {
        if (this.toastTimeout !== -1) window.clearTimeout(this.toastTimeout);

        this.isOpening = true;
        this.msg = msg;
        this.color = color;

        this.toastTimeout = window.setTimeout(() => {
            this.isOpening = false;
            this.toastTimeout = -1;
        }, duration);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get background() {
        const color = Utils.hexToRgb(this.color, 0.9);
        return `background-image: linear-gradient(90deg, rgba(0, 0, 0, 0) 0, ${ color } 35%, ${ color } 65%, rgba(0, 0, 0, 0))`;
    }
}
</script>

<style lang="scss">
#bet-msg-toast {
    position: fixed;
    top: 0;
    left: 0;
    
    z-index: 2;
    pointer-events: none;
    
    > div {
        position: absolute;
        padding: 8px 0;
        width: 300px;
        min-height: 40px;

        left: calc(50% - 150px);
        top: 20%;

        font-size: 16px;
        font-weight: bold;
        text-shadow: 1px 1px #000000;
        line-height: 24px;

        @include land-only {
            top: 25%;
        }

        &::before, &::after {
            content: "";
            position: absolute;
            top: -1px;
            left: 0;

            width: 100%;
            height: 2px;

            background-image: linear-gradient(90deg, rgba(#ffffff, 0) 0, $c-main 50%, rgba(#ffffff, 0));
        }
        &::before {
            top: unset;
            bottom: -1px;
        }
    }
}

.toast-fade-enter-active {
    animation: toast-fade 0.5s;
}
.toast-fade-leave-active {
    animation: toast-fade 0.5s reverse;
}
@keyframes toast-fade {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
        opacity: 1;
    }
    100% {
        transform: scale(1);
    }
}
</style>
