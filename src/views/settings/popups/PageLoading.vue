<template>
    <div v-show="visible" id="page-loading" :style="{ opacity: opacity }">
        <div class="container">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
        </div>
        <v-img class="img-logo" :src="require(`@/assets/images/img_logoPlus.png`)" width="100%" height="60px" contain />
        <div>{{ msg }}</div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    visible = false;
    msg = "";
    opacity = 1;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_OPEN_LOADING, this.onLoading);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_OPEN_LOADING, this.onLoading);
    }

// #[Events] ---------- + ---------- + ----------
    onLoading(visible: boolean, msg: string = "", opacity: number = 1) {
        this.visible = visible;
        this.opacity = opacity;
        this.msg = msg;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
// Shape translate amount
$amount: 18px;

#page-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(#000000, 0.5);

    .container {
        position: absolute;
        top: calc(50% - 60px);
        left: calc(50% - 60px);
        width: 120px;
        height: 120px;

        animation: rotation 3s infinite alternate;

        // Custom translation for each shape in an animation
        @mixin customTranslate($shape, $tx, $ty) {
                 @if $shape == 1 { transform: translate( $tx,  $ty); }
            @else if $shape == 2 { transform: translate(-$ty,  $tx); }
            @else if $shape == 3 { transform: translate( $ty, -$tx); }
            @else if $shape == 4 { transform: translate(-$tx, -$ty); }
        }

        .shape {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 2px;

            &.shape-1 {
                left: 0;
                top: 0;
                background-color: rgba($c-main, 0.8);
            }
            &.shape-2 {
                right: 0;
                top: 0;
                background-color: $c-main;
            }
            &.shape-3 {
                left: 0;
                bottom: 0;
                background-color: rgba($c-main, 0.6);
            }
            &.shape-4 {
                bottom: 0;
                right: 0;
                background-color: $c-bead-red;
            }
        }
        @keyframes rotation {
              0% { transform: rotate(  0deg); }
            100% { transform: rotate(360deg); }
        }

        @for $i from 1 through 4 {
            .shape-#{ $i } {
                animation: shape#{ $i } 2s linear infinite;
            }
            @keyframes shape#{ $i } {
                 0% { @include customTranslate($i, 0, 0); }
                25% { @include customTranslate($i, 0, $amount); }
                50% { @include customTranslate($i, $amount, $amount); }
                75% { @include customTranslate($i, $amount, 0); }
            }
        }
    }
    .img-logo {
        position: absolute;
        top: calc(50% - 30px);

        animation: scalation 1s infinite alternate;

        @keyframes scalation {
              0% { transform: scale(1); }
            100% { transform: scale(1.2); }
        }
    }
}
</style>
