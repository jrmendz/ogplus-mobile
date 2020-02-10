<template>
    <v-container id="game-video" :class="`${ isDealing && 'dealing' } ${ currentTableData.code } ${ mediaCtrl.isVideoNormalSize || 'small-video' } ${ 'series-' + tableSeries }`" fluid fluid-ios align-content-center justify-center ma-0 pa-0>
        <v-img v-if="!tableState.isEmcee || mediaCtrl.isSmallEmcee" :class="['video-dealer', tableState.isEmcee && 'is-emcee']" :src="(platform.orientation.isPortrait && hasVideoHtmlStarted) ? 'none' : poster" height="100%">
            <template v-if="mediaCtrl.isVideoVisible">
                <template v-if="!hasVideoHtmlStarted">
                    <v-progress-circular size="60" width="7" color="rgba(255, 255, 255, 0.6)" indeterminate />
                    <div class="loading-text">{{ $t("videoLoading") }}</div>
                </template>

                <video-player v-if="!platform.browser.isUC" :class="[playerReadied && 'player-readied', userInfo.tableSelection.gameType]" ref="videoPlayer" :options="playerOptions" :playsinline="true" @ready="onPlayerReadied()" />
                <video v-else :class="['video-html', gameType]" ref="videoHtml" @click="onClick()" playsinline webkit-playsinline x5-playsinline x5-video-player-type="h5">
                    <source :src="playerOptions.sources[0].src">
                    <source :src="playerOptions.sources[1].src">
                </video>
            </template>
        </v-img>
        <v-img v-if="tableState.isEmcee" :class="`emcee-master ${ mediaCtrl.isSmallEmcee && 'small-emcee' }`" :src="(platform.orientation.isPortrait && hasVideoHtmlStarted) ? 'none': require(`@/assets/images/games/views/img_emcee.jpg`)" height="100%" position="top center">
            <template v-if="mediaCtrl.isVideoVisible">
                <template v-if="!hasVideoHtmlStarted">
                    <v-progress-circular size="60" width="7" color="rgba(255, 255, 255, 0.6)" indeterminate />
                    <div class="loading-text">{{ $t("videoLoading") }}</div>
                </template>

                <video-player v-if="!platform.browser.isUC" :class="[playerReadied && 'player-readied', userInfo.tableSelection.gameType]" ref="emceePlayer" :options="emceeOptions" :playsinline="true" @ready="onPlayerReadied()" />
                <video v-else :class="['video-html', gameType]" ref="emceeHtml" @click="onClick()" playsinline webkit-playsinline x5-playsinline x5-video-player-type="h5">
                    <source :src="emceeOptions.sources[0].src">
                </video>
            </template>
        </v-img>
        <v-img class="btn-scale" :src="require(`@/assets/images/settings/img_video${ scaleState }.png`)" width="35px" height="35px" @click="mediaCtrl.toggleVideoSize()" />
        <div v-if="tableState.isEmcee" class="btn-live" @click="mediaCtrl.toggleSmallEmcee()">
            <v-img :src="require(`@/assets/images/settings/img_live.png`)" width="20px" height="20px" contain>{{ $t("live") }}</v-img>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { videoPlayer } from "vue-video-player";
import Hls from "hls.js";

import Events, { TableData, TableStatus, GameTypes } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: { videoPlayer }})
export default class extends Mixins(ModulesMixin)
{
    isHlsSupported = Hls.isSupported();
    hasVideoHtmlStarted = false;

    isDealing = false;

    playerReadied = false;
    playerOptions = {
        muted: true,
        autoplay: true,
        controls: false,
        language: "en",
        sources: [
            {
                src: "",
                type: "application/x-mpegURL",
                withCredentials: false,
            },
            {
                src: "",
                type: "application/x-mpegURL",
                withCredentials: false,
            },
        ],
        flash: { hls: { withCredentials: false }},
        html5: { hls: { withCredentials: false }},
        sourceOrder: true,
        poster: require("@/assets/images/games/views/img_baccaratView.jpg"),
    };
    emceeOptions = {
        muted: true,
        autoplay: true,
        controls: false,
        language: "en",
        sources: [
            {
                src: "",
                type: "application/x-mpegURL",
                withCredentials: false,
            },
        ],
        flash: { hls: { withCredentials: false }},
        html5: { hls: { withCredentials: false }},
        sourceOrder: true,
        poster: require("@/assets/images/games/views/img_emcee.jpg"),
    };

    focusData!: null | { isFocus: boolean, appHeight: number, isPortrait: boolean };

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("tableSelectionVideoUrl", { deep: true }) onVideoUrlChanged(val: { [region: string]: string[] } | null) {
        if (val) {
            this.playerOptions.sources[0].src = val[this.mediaCtrl.cameraLine][0];
            this.playerOptions.sources[1].src = val[this.mediaCtrl.cameraLine][1];
            this.emceeOptions.sources[0].src = val[this.mediaCtrl.cameraLine][2];
            this.playerReadied = false;
        }
    }
    
    @Watch("mediaCtrl.cameraLine") onCameraLineChanged(val: string) {
        this.onVideoUrlChanged(this.tableSelectionVideoUrl);
    }

    @Watch("currentTableData.status", { immediate: true }) onStatusChanged(val: TableStatus) {
        if (this.focusData) this.onFocusInput(this.focusData.isFocus, this.focusData.appHeight, this.focusData.isPortrait);

        switch (val) {
            case TableStatus.Betting:
                if (!this.platform.orientation.isPortrait) this.mediaCtrl.toggleVideoSize(false);
                this.isDealing = false;
                break;

            case TableStatus.SqueezeStart:
            case TableStatus.SqueezePlayerStart:
            case TableStatus.SqueezeBankerStart:
            case TableStatus.Default:
                if (!this.platform.orientation.isPortrait) this.mediaCtrl.toggleVideoSize(true);
                this.isDealing = false;
                break;

            case TableStatus.SqueezeEnd:
            case TableStatus.SqueezePlayerEnd:
            case TableStatus.SqueezeBankerEnd:
            case TableStatus.Dealing:
                if (!this.platform.orientation.isPortrait) this.mediaCtrl.toggleVideoSize(true);
                this.isDealing = true;
                break;
        }
    }

    @Watch("platform.orientation.isPortrait") onOrientationChanged(val: boolean) {
        if (val) this.mediaCtrl.toggleVideoSize(false);
        else this.onStatusChanged(this.currentTableData.status);
    }

    @Watch("mediaCtrl.isLiveVideoMuted") onLiveAudioChange(val: boolean) {
        if (this.$refs.videoPlayer) (this.$refs.videoPlayer as any).player.muted(val);
        if (this.$refs.emceePlayer) (this.$refs.emceePlayer as any).player.muted(val);
        if (this.$refs.videoHtml  ) (this.$refs.videoHtml   as HTMLVideoElement).muted = val;
        if (this.$refs.emceeHtml  ) (this.$refs.emceeHtml   as HTMLVideoElement).muted = val;
    }

    @Watch("userInfo.tableSelection.tableNumber") onTableNumberChanged(val: string) {
        if (this.platform.device.isIOS) this.mediaCtrl.toggleVideoSnd(false);

        this.playerOptions.muted = this.mediaCtrl.isLiveVideoMuted;
        this.playerOptions.autoplay = true;
    }

    @Watch("mediaCtrl.isVideoVisible") onVideoVisibility(val: boolean) {
        if (this.tableState.isEmcee) {
            setTimeout(() => {
                if (this.$refs.emceePlayer) (this.$refs.emceePlayer as any).player.muted(this.mediaCtrl.isLiveVideoMuted);
                if (this.$refs.emceeHtml  ) (this.$refs.emceeHtml   as HTMLVideoElement).muted = this.mediaCtrl.isLiveVideoMuted;
            }, 200);
        }
        else {
            setTimeout(() => {
                if (this.$refs.videoPlayer) (this.$refs.videoPlayer as any).player.muted(this.mediaCtrl.isLiveVideoMuted);
                if (this.$refs.videoHtml  ) (this.$refs.videoHtml   as HTMLVideoElement).muted = this.mediaCtrl.isLiveVideoMuted;
            }, 200);
        }
    }

// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        if (this.platform.device.isIOS) this.mediaCtrl.toggleVideoSnd(false);

        this.playerOptions.muted = this.mediaCtrl.isLiveVideoMuted;
        this.playerOptions.autoplay = true;
        this.emceeOptions.muted = this.mediaCtrl.isLiveVideoMuted;
        this.emceeOptions.autoplay = true;
        this.onVideoUrlChanged(this.tableSelectionVideoUrl);
        this.onStatusChanged(this.currentTableData.status);
        this.onOrientationChanged(this.platform.orientation.isPortrait);
        this.onLangChanged();
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);

        window.addEventListener("click", this.onClick);
    }

    beforeDestroy() {
        window.removeEventListener("click", this.onClick);
    }

// #[Events] ---------- + ---------- + ---------- 
    /** Change the language of the roadmap to player's choice */
    onLangChanged() {
        this.playerOptions.language = (this.$i18n.locale === "cn") ? "zh-CN" : "en";
        this.emceeOptions.language = (this.$i18n.locale === "cn") ? "zh-CN" : "en";
    }
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            this.focusData = { isFocus, appHeight, isPortrait };

            if (isPortrait) {
                Utils.addStyles("#game-video", { height: `${ appHeight * 0.35 }px`, transition: "none" });
                Utils.addStyles("#game-video.roulette", { height: `${ appHeight * 0.3 - 5 }px` });

                this.$nextTick(() => {
                    Utils.addStyles("#game-video", { top: "", transition: "" });
                    Utils.addStyles("#game-video.roulette.small-video", {
                        top: `${ 76.5 + (appHeight - 167.5) / 14 }px`,
                        height: `${ appHeight * 0.3 - 5 - (52.5 + (appHeight - 167.5) / 14) }px`
                    });
                });
            }
            else Utils.addStyles("#game-video", { height: `${ appHeight }px` });
        }
        else {
            this.focusData = null;

            Utils.addStyles("#game-video", { top: "", height: "", transition: "none" });
            this.$nextTick(() => Utils.addStyles("#game-video", { transition: "" }));
        }
    }

    onPlayerReadied() {
        this.playerReadied = true;
    }

    onClick() {
        if (this.platform.browser.isUC && !this.hasVideoHtmlStarted) {
            (this.$refs.videoHtml as HTMLVideoElement).play();
            this.hasVideoHtmlStarted = true;
        }
    }

// #[Methods] ---------- + ---------- + ---------- 


// #[Computed] ---------- + ---------- + ----------
    get poster() {
        let name: string;
        switch (this.$route.params.id) {
            case GameTypes.Moneywheel:
                name = "moneywheelView";
                break;

            default:
                name = "baccaratView";
                break;
        }
        return this.playerOptions.poster = require(`@/assets/images/games/views/img_${ name }.jpg`);
    }

    get tableSelectionVideoUrl() {
        const tableSelectionData = this.gameInfo.tableDatas[this.userInfo.tableSelection.tableNumber];
        return tableSelectionData ? tableSelectionData.videoUrl : null;
    }

    get scaleState() {
        if (this.platform.orientation.isPortrait) return this.mediaCtrl.isVideoNormalSize ? "Min" : "Max";
        else return this.mediaCtrl.isVideoNormalSize ? "Max" : "Min";
    }

    get tableSeries() {
        return this.currentTableData.tableNumber[0];
    }
}
</script>

<style lang="scss">
#game-video {
    position: fixed;
    top: 0;
    height: calc(35% + 24px);

    .video-dealer, .emcee-master {
        .loading-text {
            position: absolute;
            top: calc(30% - 16px);
            width: 100%;
            
            font-size: 16px;
            text-shadow:
                -1px -1px 0 #000000,  
                 1px -1px 0 #000000,
                -1px  1px 0 #000000,
                 1px  1px 0 #000000;
        }
        .v-progress-circular {
            position: absolute;
            top: calc(30% - 30px);
            left: calc(50% - 30px);
        }

        .video-player {
            margin-left: -35%;
            width: 170%;
            height: 100%;

            transition: transform 1s;

            @include land-only {
                margin-left: 0;
                width: 100%;
            }

            .video-js {
                width: 100%;
                height: 100%;

                .vjs-tech {
                    object-fit: cover;
                    object-position: center top;

                    transition: all 1s;

                    @include land-only {
                        object-position: center 15%;
                    }
                }
                .vjs-poster {
                    display: block;
                    background-size: cover;
                }
                .vjs-error-display .vjs-modal-dialog-content {
                    padding: 55px calc(17.5% + 35px) 20px calc(17.5% + 35px);
                    font-size: 12px;
                    line-height: 16px;
                }
            }
            
            &.player-readied {
                .video-js {
                    .vjs-poster {
                        display: none;
                    }
                }
            }
        }
        .video-html {
            position: relative;
            top: 50px;
            width: 100%;
            height: calc(100% - 60px);

            @include land-only {
                display: none;
            }
        }

        @include port-only {
            &.is-emcee {
                height: 82.5% !important;

                .video-player {
                    .video-js {
                        .vjs-tech {
                            object-position: center 15%;
                        }
                    }
                }
            }
        }
    }
    .emcee-master {
        position: absolute;
        top: 0;
        width: 100%;
        height: 265% !important;

        transition: all 0.5s;

        @include land-only {
            height: 100% !important;
        }

        &.small-emcee {
            top: 80%;
            height: 180% !important;

            @include land-only {
                display: none;
            }
        }

        .video-player {
            .video-js {
                .vjs-tech {
                    object-fit: cover;
                    left: 20.65%;
                    width: 100vw;
                    height: 100%;
                }
            }
        }
    }
    .btn-scale {
        display: none;
    }
    .btn-live {
        position: absolute;
        top: 50px;
        left: 5px;
        width: 80px;
        height: 30px;

        border-radius: 15px;
        background: #FF0038;

        .v-image {
            margin-top: 5px;
            margin-left: 10px;

            overflow: visible;

            .v-responsive__content {
                position: absolute;
                top: -5px;
                left: 25px;
                width: 50px;
                height: 30px;
                line-height: 32.5px;
                text-align: left;
            }
        }

        @include land-only {
            right: 235px;
        }
    }

    &.dealing {
        .video-dealer {
            .video-player {
                // transform: translateY(-15vh) scale(2);
                transform: translateY(-10vh) scale(1.75);

                @include land-only {
                    transform: translateY(-20%) scale(2.25);
                }
            }
        }
    }

    @include land-only {
        height: 100%;

        .v-image {
            .loading-text {
                top: calc(30% - 18px);
                font-size: 18px;
            }
            .v-progress-circular {
                top: calc(30% - 30px);
            }
        }
    }
}
#game-video.series-C {
    .video-player {
        margin-left: -27.5%;
        width: 155%;

        .video-js {
            .vjs-tech {
                object-position: center 21.5%;
            }
        }

        @include land-only {
            margin-left: 0%;
            width: 100%;

            .video-js {
                .vjs-tech {
                    object-position: center 32.5%;
                }
            }
        }
    }

    &.dealing {
        .video-dealer {
            .video-player {
                transform: translateY(-12.5vh) scale(1.75);

                @include land-only {
                    transform: translateY(-40%) scale(2.25);
                }
            }
        }
    }
}

#game-video.moneywheel {
    .v-image {
        @include land-only {
            .loading-text {
                width: 69%;
            }
            .v-progress-circular {
                left: calc(34.5% - 30px);
            }
            .v-image__image {
                background-position: left center !important;
            }
        }

        .video-player {
            margin-left: 0;
            width: 100%;

            transform: none;

            @include land-only {
                margin-left: 0;
                width: 100%;
            }

            .video-js {
                @include land-only {
                    width: 100%;
                }

                .vjs-tech {
                    object-position: center center;
                    // clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%);

                    @include land-only {
                        object-position: center center;
                    }
                }
            }
        }
    }

    &.dealing {
        .v-image {
            .video-player {
                margin-left: 0;
                width: 100%;
                    
                transform: none;

                @include land-only {
                    margin-left: 0;
                    width: 100%;
                }

                .video-js {
                    .vjs-tech {
                        object-position: center center;

                        @include land-only {
                            object-position: center center;
                        }
                    }
                }
            }
        }
    }
}
#game-video.roulette {
    @include port-only {
        right: 0;
        height: calc(30% + 24px - 5px);

        // transition: all 1s;

        .v-image {
            .video-player {
                margin-left: 0;
                width: 100%;

                transform: none;

                .video-js {
                    .vjs-tech {
                        object-position: center center;
                        // clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%);
                    }
                    .vjs-modal-dialog {
                        overflow: hidden;
                    }
                    .vjs-modal-dialog-content {
                        opacity: 1;
                        transition: all 1s;
                    }
                }
            }
        }

        &.dealing {
            .v-image {
                .video-player {
                    transform: scale(1.5) translate(0%, 15%);

                    .video-js {
                        .vjs-tech {
                            object-position: center center;
                        }
                    }
                }
            }
        }
        .btn-scale {
            display: block;
            position: fixed;
            top: 5.5px;
            right: 130px;

            // transition: all 1s;
        }

        &.small-video {
            top: calc(24px + 52.5px + (100% - 167.5px) / 14);
            right: 0;
            width: 110px;
            height: calc(30% - 5px - (52.5px + (100% - 167.5px) / 14));

            .v-image {
                // border-radius: 5px 0 0 5px;

                .video-player {
                    .video-js {
                        .vjs-modal-dialog-content {
                            opacity: 0;
                        }
                    }
                }
            }
        }
    }

    @include land-only {
        &.dealing {
            .v-image {
                .video-player {
                    margin-left: 0;
                    width: 100%;
                    transform: translateX(-5%);

                    .video-js {
                        .vjs-tech {
                            object-position: center 15%;
                        }
                    }
                }
            }
        }
        .btn-scale {
            display: block;
            position: absolute;
            top: 30px;
            right: 260px;
        }
    }
}
</style>
