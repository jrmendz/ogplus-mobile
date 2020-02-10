<template>
    <v-container id="land-disabeld" fluid fill-height justify-center ma-0 pa-0>
        <v-img :src="require(`@/assets/images/settings/img_land-disabled.png`)" />
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

@Component({ components: {}})
export default class extends Vue
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#land-disabeld {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(#000000, 1);

    .v-image {
        position: absolute;
        top: calc(50% - 100px);
        left: calc(50% - 100px);
        width: 200px;
        height: 200px;
    }
}
</style>
