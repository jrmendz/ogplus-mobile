<template>
    <v-snackbar id="msg-snackbar" v-model="visible" :timeout="duration" :color="color" top>{{ msg }}</v-snackbar>
</template>

<script lang="ts">
/* eslint-disable */
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { Route } from "vue-router";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    visible = false;

    duration = 0;
    color: string = "rgba(226, 71, 53, 0.95)";
    msg = "";

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_MSG_SNACKBAR, this.onMsgSnackbar);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_MSG_SNACKBAR, this.onMsgSnackbar);
    }

// #[Events] ---------- + ---------- + ----------
    onMsgSnackbar(visible: boolean, msg: string = "", duration: number = 6000, color: string = "rgba(226, 71, 53, 0.95)") {
        this.visible = visible;

        if (visible) {
            this.msg = msg;
            this.color = color;
            this.duration = duration;
        }
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#msg-snackbar {
    width: 90%;
    left: 5%;

    .v-snack__wrapper {
        border-radius: 0 0 5px 5px;

        .v-snack__content {
            justify-content: center;
            text-shadow: 1px 1px #000000;
            font-size: 16px;
            font-weight: bold;

            box-shadow: 0 3px 1px -2px rgba(#000000, 0.2), 0 2px 2px 0 rgba(#000000, 0.15), 0 1px 5px 0 rgba(#000000, 0.12);
        }
    }
}
</style>
