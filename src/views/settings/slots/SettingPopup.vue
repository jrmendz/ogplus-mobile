<template>
    <v-dialog v-if="isOpening" v-model="isOpening" @input="onOpen(false)" transition="fade-transition" content-class="setting-dialog elevation-0" scrollable dark>
        <v-container :id="id" class="setting-slot" fluid fill-height>
            <v-layout align-center justify-center row wrap>
                <v-flex v-if="hasTitle !== undefined" class="setting-title" xs12><slot name="title" /></v-flex>
                <slot />
                <div class="close-wrap" @click="onOpen(false)">
                    <v-img class="close" :src="require('@/assets/images/settings/img_close.svg')" aspect-ratio="1" contain />
                </div>
            </v-layout>
        </v-container>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    isOpening: boolean = false;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly id!: string;
    @Prop() readonly event!: string;
    @Prop() readonly noScroll!: boolean;
    @Prop() readonly hasTitle!: boolean;

    @Prop() readonly onBeforeOpen!: () => void;
    @Prop() readonly onBeforeClose!: () => void;

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        this.eventBus.$on(this.event, this.onOpen);
    }

    beforeDestroy() {
        this.eventBus.$off(this.event, this.onOpen);
    }

// #[Events] ---------- + ---------- + ----------
    onOpen(isOpening: boolean) {
        this.$parent.$data.shoeNo = "";
        const noScroll = (this.noScroll !== undefined);

        if (isOpening) {
            if (this.onBeforeOpen) this.onBeforeOpen();
            if (noScroll) Utils.addClass("body", "overflow-hidden");

            this.siteState.addExistPopup(this.event);
        }
        else {
            if (this.onBeforeClose) this.onBeforeClose();
            Utils.removeClass("body", "overflow-hidden");
    
            this.mediaCtrl.spotFxSound.play("click");
            this.siteState.removeExistPouup(this.event);
        }

        this.isOpening = isOpening;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.v-dialog.setting-dialog {
    margin: 12px;
    border-radius: 5px;

    @include land-only {
        @include ios-left("margin", "12px");
        @include ios-right("margin", "12px");
    }
}
.setting-slot {
    position: relative;
    padding: 42.5px 10px 10px 10px !important;

    border-radius: 5px;
    background-color: rgba(#000000, 0.8);

    color: #ffffff;
    font-size: 16px;

    .setting-title {
        position: absolute;
        top: 0;
        width: 100%;
        height: 42.5px;

        color: $c-main-light;
        text-shadow: 1px 1px #000000;
        font-size: 22px;
        line-height: 42.5px;
        font-weight: bold;
        letter-spacing: 1px;
        margin-bottom: 10px;
        
        background-image: linear-gradient(to bottom, #b88b1a 0%,#292102 100%);
        transform: translateY(-5px);
    }
    .close-wrap {
        position: absolute;
        top: 5px;
        right: 10px;

        .close {
            margin: 0 auto;
            height: 26px;
            width: 26px;
        }
    }
}
</style>
