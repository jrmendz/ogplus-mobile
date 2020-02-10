<template>
    <v-container id="table-state-wrap" fluid fill-height>
        <!-- <v-img ref="tableState" id="table-state" :src="require('@/assets/images/settings/img_stateBar.png')" class="ma-0 pa-0" width="100%"> -->
        <v-img ref="tableState" id="table-state" :class="`ma-0 pa-0 ${ currentTableData.code } ${ tableState.isEmcee && 'is-emcee' }`" width="100%">
            <div class="table-number">
                <span class="point pr-2">{{ modTableNumber }}</span>
                <span v-if="!platform.orientation.isPortrait" class="pr-2">{{ tableName }}</span>
                <span>{{ currentTableData.shoeGame }}</span>
                <!-- <v-icon color="#b5e8e7" small>attach_money</v-icon> -->
                <!-- <span>{{ userInfo.userMinBet }} - {{ userInfo.userMaxBet }}</span> -->
            </div>
            <div class="dealer-name">
                <!-- <span class="small">{{ $t("dealer") }}: </span><span class="point">{{ dealerName }}</span> -->
                <span class="point">{{ dealerName }}</span>
            </div>
        </v-img>
        <v-progress-circular :class="`state-time ${ timerMessage && 'message' } ${ currentTableData.code }`" :value="`${ (progress / maxTime * 100) }`" :size="platform.orientation.isPortrait ? 50 : 75" width="6.5" :color="timerMessage ? '#ffffff' : timerColor">
            <span class="timer" ref="timer">{{ timerMessage || timer.toFixed(0) }}</span>
        </v-progress-circular>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import Events, { RoadmapData, TableData, GameTypes, TableStatus } from "@/models/helper/types";
import Utils from "@/models/helper/utils";

import { Route } from "vue-router";
import { TweenLite, Linear, Back } from "gsap";
import { Howl, Howler } from "howler";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    tableStateElement!: HTMLDivElement;
    timerElement!: HTMLSpanElement;

    progress: number = 0;
    timerColor: string = "rgba(0, 255, 0, 0.8)";
    timerMessage: string = "";

    isResultSent: boolean = false;   // Sometimes backend sends result twice

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { deep: true }) onStatusChanged(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                setTimeout(() => this.mediaCtrl.baccaratSound.play("betStart"), this.$route.path.includes("roulette") ? 3000 : 0);
                this.isResultSent = false;
                this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.betStart"), undefined, 4000);
                this.tableState.initBets({ tableNumber: this.userInfo.tableSelection.tableNumber, hasHistory: true });
                this.gameInfo.setWinLoss(0);
                this.startTimer();
                break;
                
            case TableStatus.Dealing:
                this.mediaCtrl.baccaratSound.play("betEnd");
                this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.betEnd"), undefined, 4000);
                this.closeTimer();

                if (!this.tableState.onGoingBet){
                    this.tableState.cancelBets(this.userInfo.tableSelection.tableNumber);
                }
                else {
                    const checker = setInterval(() => {
                        if (!this.tableState.onGoingBet) {
                            this.tableState.cancelBets(this.userInfo.tableSelection.tableNumber);
                            clearInterval(checker);
                        }
                    }, 100);
                }
                break;

            case TableStatus.SqueezeEnd:
            case TableStatus.SqueezePlayerEnd:
            case TableStatus.SqueezeBankerEnd:
                // this.mediaCtrl.baccaratSound.play("betEnd");
                this.closeTimer();
                break;

            case TableStatus.Default:
                // Not to be confused with `default` switch endpoint
                if (this.isResultSent) return false;

                let gameResult = this.currentTableData.game.result;
                if (this.currentTableData.code === GameTypes.Roulette)
                     gameResult = this.currentTableData.game.value;
                else gameResult = gameResult.split(",")[0];
                
                this.isResultSent = true;

                if ([GameTypes.Baccarat, GameTypes.DragonTiger].includes(this.userInfo.tableSelection.gameType as any))
                    this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t(`betToast.wins.${ gameResult }`), this.getResultColor(gameResult), 4000);
                break;

            case TableStatus.Shuffling:
                this.isResultSent = false;
                this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("waiting.shuffling"), undefined, 4000);
                this.tableState.initBets({ tableNumber: this.userInfo.tableSelection.tableNumber, hasHistory: true });
                this.gameInfo.setWinLoss(0);
                break;
        }
    }

    @Watch("currentTableData.game.timer", { deep: true }) onTimerChanged(val: string, old: string) {
        if (+val <= 5) TweenLite.fromTo(this.timerElement, 0.5, { scale: 1.5 }, { scale: 1, ease: Back.easeOut });
        if (+val <= 10 && +val > 0) this.mediaCtrl.spotFxSound.play("timer");
        if (+val === 0) this.mediaCtrl.spotFxSound.play("endRing");
        this.startTimer();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.tableStateElement = (this.$refs.tableState as Vue).$el as HTMLDivElement;
        this.timerElement = this.$refs.timer as HTMLSpanElement;

        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
        this.eventBus.$on(Events.ON_LANG_CHANGED, this.onLangChanged);

        if (this.timer === 0) this.closeTimer();
        else this.startTimer();
    }
    beforeDestroy() {
        TweenLite.killTweensOf(this);
        TweenLite.killTweensOf(this.startTimer);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                if (this.tableState.isEmcee)
                    Utils.addStyles("#table-state", { bottom: `${ window.innerHeight - appHeight }px` });
            }
            else Utils.addStyles("#table-state-wrap .state-time", { bottom: `${ (window.innerHeight - appHeight) + 140 }px` });
        }
        else {
            Utils.addStyles("#table-state-wrap", { bottom: "" });
            Utils.addStyles("#table-state-wrap .state-time", { bottom: "" });
        }
    }

    onLangChanged() {
        try {
            if (this.timer === 0) this.timerMessage = this.$t("timeClosed").toString();
        }
        catch (e) { console.log(e); }
    }

// #[Methods] ---------- + ---------- + ----------
    startTimer() {
        this.timerMessage = "";
        // Utils.removeClass("#table-state", "time-up-twinkle");

        TweenLite.killTweensOf(this);
        TweenLite.fromTo(this, this.timer, { timer: this.timer }, { timer: 0, ease: Linear.easeNone });
    }

    closeTimer() {
        TweenLite.killTweensOf(this);

        this.timerMessage = this.$t("timeClosed").toString();
        this.timerElement.style.transform = "scale(1)";
        // Utils.addClass("#table-state", "time-up-twinkle");
    }

    getResultColor(gameResult: string) {
             if (gameResult.includes("player") || gameResult.includes("dragon")) return this.gameInfo.beadColors[0];
        else if (gameResult.includes("banker") || gameResult.includes("tiger" )) return this.gameInfo.beadColors[2];
        else if (gameResult.includes("tie")) return this.gameInfo.beadColors[1];
    }

// #[Computed] ---------- + ---------- + ----------
    get maxTime() {
        return this.currentTableData.maxtime || this.currentTableData.maxTime;
    }

    get timer() {
        return this.currentTableData.game.timer ? +this.currentTableData.game.timer : 0;
    }

    set timer(value: number) {
        const ratio = value / this.maxTime;
        const red = (ratio <= 0.5) ? 255 : ((1 - ratio) * 2 * 255);
        const green = (ratio >= 0.5) ? 255 : (ratio * 2 * 255);

        // const colors = [
        //     `rgba(0, 0, 0, 0) ${ ratio * 45 - 10 }%`,
        //     `rgba(${ red }, ${ green }, 0, 0.8) ${ ratio * 45 }%`,
        //     `rgba(${ red }, ${ green }, 0, 0.8) ${ 100 - ratio * 45 }%`,
        //     `rgba(0, 0, 0, 0) ${ 110 - ratio * 45 }%`,
        // ];

        this.progress = value;
        this.timerColor = `rgba(${ red }, ${ green }, 0, 0.8)`;
        // this.tableStateElement.style.backgroundImage = `linear-gradient(to right, ${ colors[0] }, ${ colors[1] }, ${ colors[2] }, ${ colors[3] })`;
    }

    get dealerName() {
        const name = this.currentTableData.dealer ? this.currentTableData.dealer.name : "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    
    get tableName() {
        let name: string = "";

        switch (this.currentTableData.code) {
            case GameTypes.Baccarat:
                name = "gameNames.baccarat";
                break;
            case GameTypes.DragonTiger:
                name = "gameNames.dragonTiger";
                break;
            case GameTypes.Moneywheel:
                name = "gameNames.moneywheel";
                break;
            case GameTypes.Roulette:
                name = "gameNames.roulette";
                 break;
            case GameTypes.ThreeCards:
                name = "gameNames.threecards";
                break;
            case GameTypes.Niuniu:
                name = "gameNames.niuniu";
                break;
        }

        name += (this.currentTableData.subcode === "bidding" ? "Bid" : "");

        return this.$t(name);
    }

    get modTableNumber() {
        return this.tableState.isEmcee ? this.userInfo.tableSelection.tableNumber.replace(/[a-zA-Z]+/g, "MC") : this.userInfo.tableSelection.tableNumber;
    }
}
</script>

<style lang="scss">
#table-state-wrap {
    position: fixed;
    width: 100%;

    pointer-events: none;

    .state-time {
        position: absolute;
        right: 80px;
        top: 37.5px;

        @include port-only {
            &.roulette {
                top: 67.5px;
                left: 20px;
            }
        }
        @include land-only {
            top: unset;
            bottom: 140px;
            left: 85px;

            .v-progress-circular__info::before {
                content: "";
                position: absolute;
                left: -27.5px;
                top: -27.5px;
                width: 55px;
                height: 55px;

                border-radius: 50%;
                background-color: rgba(#ffffff, 0.1);
            }

            &:not(.message) span {
                font-size: 40px;
            }

            &.moneywheel {
                left: unset;
                right: 315px;
                top: 5px;
                bottom: unset;

                transform: scale(0.9);
            }
            &.roulette {
                top: unset;
                left: 70px;
                bottom: 50px;

                transform: scale(0.9);
            }
        }

        .v-progress-circular__underlay {
            stroke: rgba(#000000, 0.4);

            @include land-only {
                stroke: rgba(#ffffff, 0.2);
            }
        }
        .v-progress-circular__overlay {
            transition: none;
        }

        span {
            position: absolute;
            width: 100px;
            top: -12.5px;
            left: -50px;

            font-size: 24px;
            font-weight: bold;
            text-align: center;
            line-height: 24px;
        }
        &.message span {
            font-size: 16px;
        }
    }
}
#table-state {
    position: fixed;
    overflow: visible;
    top: 42.5px;
    left: 0;
    height: 24px;

    color: #ffffff;
    font-size: 16px;
    text-shadow: 1px  1px 0 #000000;

    @include land-only {
        top: 5px;
        left: unset;

        @include ios-right("", "0px");
        @include ios-width("", "100% - 150px", "-", null, !important);

        > .v-image__image {
            background-size: 100% 24px;
        }
    }

    &.moneywheel {
        top: 5px;
    }

    .table-number {
        position: absolute;
        left: 10px;

        @include land-only {
            left: unset;
            right: 70px;
        }
    }

    .point {
        color: $c-main;
        font-weight: bold;
    }
    .small {
        font-size: 14px;
        line-height: 24px;
    }

    .dealer-name {
        position: absolute;
        top: 0;
        right: 10px;

        @include port-only {
            left: 90px;
            right: unset;
        }
    }

    // &.time-up-twinkle::before {
    //     content: "";
    //     position: absolute;
    //     width: 100%;
    //     height: 21.5px;

    //     background-image: none !important;
    //     animation: time-up-twinkle 0.75s infinite alternate;
    // }
    // @keyframes time-up-twinkle {
    //     0% {
    //         background-color: rgba(#ff0000, 0.4);
    //     }
    //     100% {
    //         background-color: rgba(#000000, 0.4);
    //     }
    // }
}
#table-state.is-emcee {
    top: unset;
    bottom: 0;

    .dealer-name {
        display: none;
    }
}
</style>
