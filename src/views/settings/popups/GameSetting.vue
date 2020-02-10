<template>
    <v-container v-show="isOpening" ref="settingPopup" id="game-setting" grid-list-xs fluid>
        <div class="board" @click="openSubSetting()"></div>
        <v-layout row wrap justify-space-around pa-1>
            <div class="dev-version" @click="onOpenDebug()">{{ siteState.version }}</div>
            <template v-for="setting in settingList">
                <v-flex v-if="isVisible(setting)" :key="setting.text" :class="siteState.platform.orientation.isLandscape ? 'xs1 mt-1 mb-3' : !userInfo.tableSelection.tableNumber ? 'xs2 mt-3 mb-4' : 'xs3 mt-1 mb-4'">
                    <v-img class="setting-icon" :src="setting.icon" @click="openSubSetting(setting.enumId)" aspect-ratio="1" contain />
                    <div light class="setting-text">{{ $t(`subSetting.${ setting.enumId }.title`) }}</div>
                </v-flex>
            </template>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Platform from "@/models/helper/platform";

enum SubSetting { Language = "lang", History = "history", Social = "social", Rules = "rules", Sound = "sound", BGM = "bgm", LiveSound = "liveSound", Video = "video", Logout = "logout" }

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    readonly settingList = [
        {
            icon: require("@/assets/images/settings/img_language.svg"),
            enumId: SubSetting.Language,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_history.svg"),
            enumId: SubSetting.History,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_social.svg"),
            enumId: SubSetting.Social,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_rules.svg"),
            enumId: SubSetting.Rules,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_soundFxOn.svg"),
            enumId: SubSetting.Sound,
            enabled: true,
        },
        // {
        //     icon: require("@/assets/images/settings/img_soundFxOn.svg"),
        //     enumId: SubSetting.BGM,
        //     enabled: true,
        // },
        {
            icon: require("@/assets/images/settings/img_soundLiveOn.svg"),
            enumId: SubSetting.LiveSound,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_videoOn.svg"),
            enumId: SubSetting.Video,
            enabled: true,
        },
        {
            icon: require("@/assets/images/settings/img_logout.svg"),
            enumId: SubSetting.Logout,
            enabled: false,
        },
    ];

    settingPopup!: HTMLDivElement | Vue | any;
    isOpening = false;

    debugOpeningCount = 0;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("mediaCtrl.isBgmMute") onBgmMuteChange(val: boolean, old: boolean) {
        this.settingList.find(value => value.enumId === SubSetting.BGM)!.icon = require(`@/assets/images/settings/img_soundFx${val ? "Off" : "On"}.svg`);
    }

    @Watch("mediaCtrl.isSoundMute") onSoundMuteChange(val: boolean, old: boolean) {
        this.settingList.find(value => value.enumId === SubSetting.Sound)!.icon = require(`@/assets/images/settings/img_soundFx${val ? "Off" : "On"}.svg`);
    }

    @Watch("mediaCtrl.isLiveVideoMuted") onLiveVideoMuteChange(val: boolean, old: boolean) {
        this.settingList.find(value => value.enumId === SubSetting.LiveSound)!.icon = require(`@/assets/images/settings/img_soundLive${val ? "Off" : "On"}.svg`);
    }

    @Watch("mediaCtrl.isVideoVisible") onVideoVisibilityChange(val: boolean, old: boolean) {
        this.settingList.find(value => value.enumId === SubSetting.Video)!.icon = require(`@/assets/images/settings/img_video${val ? "On" : "Off"}.svg`);
    }

// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        this.eventBus.$on(Events.ON_GAME_SETTING, this.onOpen);
        this.settingPopup = this.$refs.settingPopup as HTMLDivElement;
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_GAME_SETTING, this.onOpen);
    }

// #[Events] ---------- + ---------- + ----------
    onOpen(isOpening: boolean) {
        if (isOpening) {
            TweenLite.killTweensOf("#game-setting .layout");
            TweenLite.fromTo("#game-setting .layout", 0.25, { y: -100, opacity: 0 }, { y: 0, opacity: 1 });
        }
        else this.debugOpeningCount = 0;

        this.isOpening = isOpening;
    }

    onOpenDebug() {
        if (++this.debugOpeningCount >= 7) Platform.openDebugConsole();
    }

// #[Methods] ---------- + ---------- + ----------
    openSubSetting(enumId?: SubSetting) {
        let subEvent: string = "";
        this.mediaCtrl.spotFxSound.play("click");

        switch (enumId) {
            case SubSetting.Language:
                subEvent = Events.ON_LANG_SETTING;
                break;
            
            case SubSetting.History:
                subEvent = Events.ON_HISTORY;
                break;
            
            case SubSetting.Social:
                subEvent = Events.ON_SOCIAL;
                break;

            case SubSetting.Rules:
                window.open("https://ogplus.oriental-game.com/rules/");
                break;
            
            case SubSetting.BGM:
                this.mediaCtrl.toggleBgm();
                return;
            
            case SubSetting.Sound:
                this.mediaCtrl.toggleSound();
                return;
            
            case SubSetting.LiveSound:
                this.mediaCtrl.toggleVideoSnd();
                return;
            
            case SubSetting.Video:
                this.mediaCtrl.toggleVideo();
                return;

            case SubSetting.Logout:
                this.userInfo.doLogout();
                return;
        }
        
        if (subEvent) this.eventBus.$emit(subEvent, true);
        
        // Leave animation
        if (subEvent || enumId === undefined)
            TweenLite.to("#game-setting .layout", 0.2, { y: -100, opacity: 0, onComplete: () => this.onOpen(false) });
    }

    isVisible({ enumId, enabled }: { icon: any, enumId: SubSetting, enabled: boolean }) {
        if (enabled) {
            if (enumId === SubSetting.Video || enumId === SubSetting.LiveSound) return (this.userInfo.tableSelection.tableNumber !== "");
            else if (enumId === SubSetting.BGM) return (this.userInfo.tableSelection.tableNumber === "");
            return true;
        }
        else return false;
    }

// #[Computed] ---------- + ---------- + ----------
    get SubSetting() {
        return SubSetting;
    }
}
</script>

<style lang="scss">
#game-setting {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10;

    > .layout, > .board {
        position: absolute;
        top: 0;
        left: 1px;
        width: 100%;
    }
    > .board {
        height: 100%;
        background-color: rgba(#ffffff, 0.05);
    }
    > .layout {
        background-color: rgba(#000000, 0.9);
        border-bottom: 1px solid $c-main;
    }

    .setting-icon {
        margin: 0 auto;
        height: 40px;
        width: 40px;

        @include xxs-only {
            height: 36px;
            width: 36px;
        }
    }
    .setting-text {
        margin-top: 4px;
        font-size: 13px;

        @include xxs-only {
            font-size: 11.5px;
        }
    }

    .dev-version {
        position: absolute;
        bottom: 5px;
        left: 5px;

        color: rgba(#ffffff, 0.5);
        font-size: 12px;
    }
}
</style>
