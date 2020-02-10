<template>
    <SettingPopup id="lang-setting" :event="event" hasTitle>
        <template v-slot:title>{{ $t("subSetting.lang.select") }}</template>
        <v-flex v-for="lang in langs" :key="lang" :class="['setting-lang-img', (lang === $i18n.locale ? 'select' : null)]" xs6 sm2>
            <v-img :src="require(`@/assets/images/langs/img_flag-${ lang }.png`)" max-width="80px" @click="siteState.setLang({ lang, init: false })" />
        </v-flex>
    </SettingPopup>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    readonly event = Events.ON_LANG_SETTING;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
        

// #[Life Cycle] ---------- + ---------- + ---------- 


// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get langs() {
        return Object.keys(this.$i18n.messages);
    }
}
</script>

<style lang="scss">
#lang-setting {
    @include xxs-land-only {
        .flex:not(.setting-title):not(.close-wrap) {
            flex-basis: 1 / 6 * 100% !important;
            flex-grow: 0 !important;
            max-width: 1 / 6 * 100% !important;
        }
    }
    
    .setting-lang-img {
        &.select {
            background-color: rgba(#ffffff, 0.5);
            border-radius: 5px;
        }

        .v-image {
            margin: auto;

            .v-image__image {
                top: 10%;
                left: 10%;
                width: 80%;
                height: 80%;
                border-radius: 5px;
            }
        }
    }
}
</style>
