<template>
    <div id="moneywheel-result">
        <v-img v-show="isVisibleSpin" class="result-board" :src="require(`@/assets/images/games/result/img_resultBoard-gray.png`)" width="80%" height="120px">
            <template v-if="!hasBonus && !hasSpin">
                <v-img class="spinning-icon" :src="require(`@/assets/images/games/bet/img_spinning.svg`)" width="60px" height="60px" contain />
                <div class="spinning-text">{{ $t("waiting.spinning") + "..." }}</div>
            </template>
            <div v-show="hasBonus" class="img-coins-wrap">
                <v-img class="img-coins" :src="require(`@/assets/images/games/result/img_coins.png`)" width="90px" height="90px" contain />
                <div class="text-bonus">{{ `×${ displayedSpinResult.bonus.toFixed() }` }}</div>
            </div>
            <v-img v-show="hasSpin" :class="['img-spin-result', hasBonus && 'has-bonus']" :src="require(`@/assets/images/games/result/img_spin-result.png`)" width="90px" height="90px" position="center bottom" contain>
                <div class="text-spin">{{ spinResult.spin === 40 ? "财" : spinResult.spin }}</div>
            </v-img>
        </v-img>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite, TimelineLite, Bounce, Back, Linear } from "gsap";

import Events, { TableData, TableStatus } from "@/models/helper/types";
import ResultMixin from "@/views/games/common/mixins/resultMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class MoneywheelResult extends Mixins(ResultMixin)
{
    isVisibleSpin = false;
    showCoinsTween!: TimelineLite;

    spinResult = { bonus: 0, spin: 0, win: 0 };
    displayedSpinResult = { bonus: 0, win: 0 };

    audioResult = true;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.game.values", { immediate: true }) onResultChange(val: any) {
        if (!val) return false;
        const results = val.split(",");

        if (results[results.length - 1] === "x3")
            this.setResult(Math.pow(3, results.length), 0, 0);
    }

    @Watch("currentTableData.status", { immediate: true }) onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.showSpinResult(false);
                return;
                
            case TableStatus.Dealing:
                this.resetResult();
                setTimeout(() => this.showSpinResult(true), 300);
                return;

            case TableStatus.Default:
                const value = this.currentTableData.game.result === "og" ? 40 : +this.currentTableData.game.result;
                this.setResult(this.spinResult.bonus, value, 0);
                break;
        }

    }

    @Watch("gameInfo.currentTableInfo.winloss", { immediate: true }) onWinningsChange(val: number) {
        if (val === 0) return;

        const value = this.currentTableData.game.result === "og" ? 40 : +this.currentTableData.game.result;
        this.setResult(this.spinResult.bonus, value, val, false);
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.resetResult();
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

    beforeDestroy() {
        if (this.showCoinsTween) this.showCoinsTween.kill();

        this.resetResult();
        TweenLite.killTweensOf(this);
        TweenLite.killTweensOf(".img-spin-result");
        TweenLite.killTweensOf("#moneywheel-result .result-board");
        TweenLite.killTweensOf(".text-spin");
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait)
                 Utils.addStyles("#moneywheel-result", { top: `${ appHeight * 0.35 + 13 }px`, height: `${ appHeight * 0.45 - 60 }px` });
            else Utils.addStyles("#moneywheel-result", { bottom: `${ (window.innerHeight - appHeight) + 10 }px`, height:  `${ appHeight * 0.65 }px` });
        }
        else Utils.addStyles("#moneywheel-result", { top: "", bottom: "", height: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    showSpinResult(visible: boolean) {
        if (visible === this.isVisibleSpin) return;

        if (visible) {
            this.isVisibleSpin = true;

            TweenLite.killTweensOf("#moneywheel-result .result-board");
            TweenLite.fromTo("#moneywheel-result .result-board", 0.75, { y: -100, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, ease: Bounce.easeOut });

            this.mediaCtrl.moneywheelSound.play("spinningW");
        }
        else {
            TweenLite.killTweensOf("#moneywheel-result .result-board");
            TweenLite.to("#moneywheel-result .result-board", 0.25, { y: -50, opacity: 0, scale: 0.9, onComplete: this.resetResult });
        }
    }

    setResult(bonus: number, spin: number = 0, win: number = 0, animate = true) {
        this.showSpinResult(true);
        
        if (bonus && this.spinResult.bonus !== bonus) {
            TweenLite.to(this.displayedSpinResult, 0.5, { bonus, ease: Linear.easeNone });

            if (this.showCoinsTween) this.showCoinsTween.kill();
            this.showCoinsTween = new TimelineLite();
        }

        if (spin) {
            
            TweenLite.to(this.displayedSpinResult, 1, { win, ease: Linear.easeNone });

            if (animate) {
                TweenLite.from(".img-spin-result", 0.5, { scale: 0.5, opacity: 0.5, ease: Back.easeOut });
                TweenLite.from(".text-spin", 1, { scale: 3, ease: Back.easeOut });
            }
        }

        Object.assign(this.spinResult, { bonus, spin, win });

        if (this.audioResult) {
            this.mediaCtrl.moneywheelSound.play(`win${this.spinResult.spin}`);
            this.audioResult = false;
            setTimeout(() => {
                this.audioResult = true;
            }, 5000);
        }
    }

    resetResult() {
        Object.assign(this.spinResult, { bonus: 0, spin: 0, win: 0 });
        Object.assign(this.displayedSpinResult, { bonus: 0, win: 0 });

        this.currentTableData.game.values = "";
        this.currentTableData.game.result = "";

        this.isVisibleSpin = false;
    }

// #[Computed] ---------- + ---------- + ----------
    get hasBonus() { return this.spinResult.bonus >= 1; }
    get hasSpin() { return this.spinResult.spin >= 1; }

    get tableNumber() {
        return this.currentTableData.tableNumber;
    }

    get formattedWin() {
        return "$ " + Utils.currency(+this.displayedSpinResult.win.toFixed(0), 3, 0);
    }
}

</script>

<style lang="scss">
#moneywheel-result {
    position: fixed;
    z-index: 1;
    left: 0;
    top: calc(18px + 35% - 5px);
    width: 100%;
    height: calc(80% - 35% - 60px);

    @include land-only {
        top: unset;
        left: unset;
        right: 0;
        bottom: 10px;
        width: 50%;
        height: 40%;
    }

    .result-board {
        position: absolute;
        left: 10%;
        bottom: 0;

        @include land-only {
            position: fixed;
            bottom: 30px;
            width: 32.5% !important;
            height: 130px !important;

            left: calc(50% - 16.25%);
        }

        > .v-image__image {
            background-size: 100% 120px;

            @include land-only {
                background-size: 100% 130px;
            }
        }
        > .v-responsive__content {
            position: absolute;
            width: 100%;
            height: 100%;

            .spinning-icon {
                position: absolute;
                left: calc(50% - 30px);
                top: calc(50% - 45px);
                animation: spinning 1.5s infinite;
            }
            .spinning-text {
                position: absolute;
                top: calc(50% + 15px);
                width: 100%;

                font-size: 20px;
                font-weight: bold;
            }

            @keyframes spinning {
                  0% { transform: rotate(-360deg); }
                100% { transform: rotate(   0deg); }
            }
        }
    }

    .img-coins-wrap {
        position: absolute;
        left: 12.5%;
        top: calc(50% - 40px);

        .v-image {
            position: absolute;
            left: 0;
            top: 0;
        }
        .text-bonus {
            position: absolute;
            left: 20px;
            top: 20px;
            width: 50px;
            height: 26px;

            text-shadow: 0 1px 0.05px #333333;

            color: $c-main;
            font-weight: bold;
            font-size: 24px;
            line-height: 28px;
        }
    }
    .img-spin-result {
        position: absolute;
        right: calc(50% - 45px);
        top: calc(50% - 45px);

        &.has-bonus {
            right: 12.5%;
        }

        .text-spin {
            position: absolute;
            top: 40px;
            width: 110px;
            height: 26px;

            text-shadow: 0 1px 0.05px #333333;

            color: $c-main;
            font-weight: bold;
            font-size: 28px;
            line-height: 32px;
        }
    }
}
</style>
