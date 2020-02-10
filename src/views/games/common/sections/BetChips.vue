<template>
    <v-container id="bet-chips" :class="[gameType, tableState.isEmcee && 'is-emcee', userInfo.tableTheme]" fluid align-content-end ma-0 pa-0>
        <v-img v-if="platform.orientation.isPortrait && !isRoulette && !tableState.isEmcee" :src="require('@/assets/images/games/img_tableBg.png')" width="100%" height="100%">
            <v-container fluid align-content-end ma-0 pa-0>
                <v-img class="bet-wrap-top" :src="require('@/assets/images/games/img_betBg-top.png')" width="100%" height="22.5px" />
                <v-img class="bet-wrap-bottom" :src="require('@/assets/images/games/img_betBg-bottom.png')" width="100%" height="85px" />
            </v-container>
        </v-img>

        <!-- Chips -->
        <v-container class="bet-chips-wrap" justify-center ma-0 pa-0>
            <v-layout :class="(platform.orientation.isPortrait && !isRoulette && !tableState.isEmcee) || 'column'" wrap>
                <v-flex v-for="i in tableState.chipAmounts.length" :key="i" :class="[(platform.orientation.isPortrait && i === 1 && gameType !== 'roulette') && 'offset-xs1']" xs2>
                    <v-img :class="['chip', `chip-${ i - 1 }`]" height="52px"
                            :src="require(`@/assets/images/games/bet/img_chip${ i - 1 }.png`)" contain @click="onChangeChip(i - 1)">
                        <div class="chip-value">{{ formatChip(tableState.chipAmounts[i - 1]) }}</div>
                    </v-img>
                </v-flex>
                <v-flex class="chip-edit" xs1>
                    <v-img :src="require(`@/assets/images/games/bet/img_chipEdit.png`)" width="32px" height="32px" contain @click="onEditChip()" />
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Buttons -->
        <v-container class="bet-btns-wrap" align-content-space-between ma-0 pa-0>
            <v-layout :class="[(platform.orientation.isPortrait && !isRoulette) || 'column reverse']" wrap>
                <v-flex v-for="key in betActions" :key="key" :class="key" xs4>
                    <v-img :src="require(`@/assets/images/games/bet/img_bet${ key }.svg`)" height="20px" contain @click="onBetAction(key)" />
                </v-flex>
            </v-layout>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite, TimelineLite, Back } from "gsap";

import Events, { GameTypes, TableData, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

enum BetActions { Repeat, Cancel, Confirm }

@Component({ components: {}})
export default class BetChips extends Mixins(ModulesMixin)
{
    canBet: boolean = false;
    showChipsTween!: TimelineLite;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly gameType!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("$route") onRouteChanged() {
        this.showChips(this.currentTableData.status === TableStatus.Betting, false);
    }

    @Watch("platform.orientation.isPortrait") onPortraitChanged(val: boolean) {
        this.$nextTick(() => {
            this.showChips(this.currentTableData.status === TableStatus.Betting, false);
        });
    }

    @Watch("currentTableData.status", { immediate: true }) onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                this.userInfo.tempBalance(0);
                this.canBet = true;
                setTimeout(() => this.showChips(true), 500);
                break;

            case TableStatus.Dealing:
                this.canBet = false;
                this.showChips(false);
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.onChangeChip(0);
        this.showChips(this.currentTableData.status === TableStatus.Betting, false);

        this.eventBus.$on(Events.ON_CHIP_AMOUNTS_CHANGED, this.onUpChipAmounts);
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_CHIP_AMOUNTS_CHANGED, this.onUpChipAmounts);

        if (this.showChipsTween) this.showChipsTween.kill();
    }

// #[Events] ---------- + ---------- + ----------
    onChangeChip(choice: number) {
        this.mediaCtrl.spotFxSound.play("click");
        this.tableState.selectChip(choice);

        Utils.removeClass(".chip", "chip-select");
        Utils.addClass(`.chip-${ choice }`, "chip-select");
    }

    onEditChip() {
        this.mediaCtrl.spotFxSound.play("click");
        this.eventBus.$emit(Events.ON_CHIP_AMOUNTS, true);
    }

    onUpChipAmounts() {
        this.userInfo.updateUser({ settings: { chips: this.tableState.chipAmounts } });
        this.$forceUpdate();
    }

    onBetAction(key: string) {
        if (!this.canBet) return false;
        this.mediaCtrl.spotFxSound.play("click");

        switch (key) {
            case BetActions[BetActions.Confirm]:
                this.eventBus.$emit(Events.ON_BET_CONFIRMED);
                this.userInfo.tempBalance(0);
                this.tableState.confirmBets({ tableNumber: this.userInfo.tableSelection.tableNumber, tableId: this.currentTableData.id, gameSet: this.currentTableData.gameSet, shoeGame: this.currentTableData.shoeGame });
                break;

            case BetActions[BetActions.Cancel]:
                this.userInfo.tempBalance(0);
                this.tableState.cancelBets(this.userInfo.tableSelection.tableNumber);
                break;

            case BetActions[BetActions.Repeat]:
                this.tableState.repeatBets(this.userInfo.tableSelection.tableNumber);
                break;
        }
        this.$forceUpdate();
    }

    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            Utils.addStyles("#bet-chips", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.2 }px`, height: `${ appHeight * 0.4 }px` });
            Utils.addStyles("#bet-chips.roulette", { bottom: `${ (window.innerHeight - appHeight) + 36 }px`, height: `${ appHeight - 60 }px` });

            if (isPortrait) {
                if (this.tableState.isEmcee)
                    Utils.addStyles("#bet-chips", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.4 - 120 }px`, height: `${ appHeight * 0.6 + 120 }px` });
            }
            else Utils.addStyles("#bet-chips .bet-btns-wrap", { bottom: `${ (window.innerHeight - appHeight) + 35 }px` });
        }
        else {
            Utils.addStyles("#bet-chips", { bottom: "", height: "" });
            Utils.addStyles("#bet-chips .bet-btns-wrap", { bottom: "" });
        }
    }

// #[Methods] ---------- + ---------- + ----------
    formatChip(chip: number) {
        return Utils.formatNumber(chip);
    }

    showChips(visible: boolean, hasAnim = true) {
        const tweenOptions = {
            hide: {
                chip: { x: -100, rotation: -360, opacity: 0, scale: 0.8 },
                edit: { opacity: 0, scale: 0 },
                btns: { x: 100, opacity: 0 },
            },
            show: {
                chip: { x: 0, rotation: 0, opacity: 1, scale: 1 },
                edit: { opacity: 1, scale: 1 },
                btns: { x: 0, opacity: 1 },
            },
        };

        if (this.showChipsTween) this.showChipsTween.kill();

        const setShowing = () => {
            for (let i = 4; i >= 0; --i)
                TweenLite.set(`.chip.chip-${ i }`, tweenOptions.show.chip);
            TweenLite.set(".chip-edit"    , tweenOptions.show.edit);
            TweenLite.set(".bet-btns-wrap", tweenOptions.show.btns);
        };

        if (this.platform.orientation.isPortrait) {
            setShowing();
            return;
        }

        if (hasAnim) {
            if (visible) {
                const showChipTo = Object.assign({}, tweenOptions.show.chip, { ease: Back.easeOut });
                this.showChipsTween = new TimelineLite()
                        .fromTo(".chip.chip-0"  , 0.3, tweenOptions.hide.chip, showChipTo, 0.2)
                        .fromTo(".chip.chip-1"  , 0.3, tweenOptions.hide.chip, showChipTo, 0.1)
                        .fromTo(".chip.chip-2"  , 0.3, tweenOptions.hide.chip, showChipTo, 0  )
                        .fromTo(".chip.chip-3"  , 0.3, tweenOptions.hide.chip, showChipTo, 0.1)
                        .fromTo(".chip.chip-4"  , 0.3, tweenOptions.hide.chip, showChipTo, 0.2)
                        .fromTo(".chip-edit"    , 0.3, tweenOptions.hide.edit, Object.assign({}, tweenOptions.show.edit, { ease: Back.easeOut }), 0.2)
                        .fromTo(".bet-btns-wrap", 0.5, tweenOptions.hide.btns, tweenOptions.show.btns, 0);
            }
            else {
                this.showChipsTween = new TimelineLite()
                        .to(".chip.chip-0"  , 0.3, tweenOptions.hide.chip, 0  )
                        .to(".chip.chip-1"  , 0.3, tweenOptions.hide.chip, 0.1)
                        .to(".chip.chip-2"  , 0.3, tweenOptions.hide.chip, 0.2)
                        .to(".chip.chip-3"  , 0.3, tweenOptions.hide.chip, 0.1)
                        .to(".chip.chip-4"  , 0.3, tweenOptions.hide.chip, 0  )
                        .to(".chip-edit"    , 0.3, tweenOptions.hide.edit, 0)
                        .to(".bet-btns-wrap", 0.5, tweenOptions.hide.btns, 0);
            }
        }
        else {
            if (visible) setShowing();
            else {
                for (let i = 4; i >= 0; --i)
                    TweenLite.set(`.chip.chip-${ i }`, tweenOptions.hide.chip);
                TweenLite.set(".chip-edit"    , tweenOptions.hide.edit);
                TweenLite.set(".bet-btns-wrap", tweenOptions.hide.btns);
            }
        }
    }

// #[Computed] ---------- + ---------- + ----------
    get isRoulette() {
        return this.gameType === GameTypes.Roulette;
    }

    get betActions() {
        return Object.keys(BetActions).filter(key => typeof (BetActions as any)[key] === "number");
    }

}
</script>

<style lang="scss">
#bet-chips {
    position: fixed;
    height: 40%;
    bottom: 20%;

    .bet-wrap-top {
        position: absolute;
        bottom: 85px;

        .v-image__image {
            background-size: 100% 100%;
        }
    }
    .bet-wrap-bottom {
        position: absolute;
        bottom: 0;
    }

    .bet-chips-wrap {
        position: absolute;
        left: 15px;
        bottom: 45px;

        width: calc(100% - 30px);
        overflow: visible;

        .chip {
            transform: scale(0.95) !important;
        }
        .chip-value {
            position: absolute;
            top: calc(50% - 12.5px);
            width: 100%;

            color: #000000;
            font-size: 15px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            white-space: nowrap;
            letter-spacing: -1px;
        }
        .chip-edit {
            position: absolute;
            right: -5.5px;
            bottom: 2.5px;
        }

        .chip.chip-select {
            overflow: visible;
            z-index: 1;

            // animation: chip-select 2s infinite;
            filter: drop-shadow(0 5px 5px rgba($c-light-blue, 0.75));

            > .v-image__image, .v-responsive__content {
                transform: scale(1.1) translateY(-10px);

                @include land-only {
                    transform: scale(1.1);
                }
            }
        }
        @keyframes chip-select {
            0%   { filter: drop-shadow(0 0 2.5px #8CF7FB); }
            50%  { filter: drop-shadow(0 0 10px  #8CF7FB); }
            100% { filter: drop-shadow(0 0 2.5px #8CF7FB); }
        }

        @include land-only {
            bottom: -64px;
            width: 50px;

            .chip-edit {
                left: 58px;
                bottom: 0;
                width: 32px;
            }
        }
    }

    .bet-btns-wrap {
        position: absolute;
        left: calc(50% - 100px);
        bottom: 10px;
        width: 200px;

        .flex:not(:last-child) {
            border-right: 1px solid #ffffff;
        }

        @include xxs-only {
            left: calc(50% - 75px);
            width: 150px;
        }
        @include land-only {
            position: fixed;
            left: unset;
            right: 30px;
            bottom: 35px;
            width: 67.5px;

            @include ios-right("", "30px");

            .flex {
                padding: 5px;
                margin-top: 7.5px;

                border: 1px solid #929292;
                border-radius: 6px;

                &.Repeat  { background-color: rgba(#000000, 0.2); }
                &.Cancel  { background-color: rgba(#ff0000, 0.2); }
                &.Confirm { background-color: rgba(#00ff00, 0.2); }
            }
            .flex:not(:last-child) {
                border-right: 1px solid $c-main;
            }
        }
    }
    &.-yellow {
        .chip.chip-select {
            filter: drop-shadow(0 5px 5px rgba($c-main, 0.75));
        }
    }
    &.-green {
        .chip.chip-select {
            filter: drop-shadow(0 5px 5px rgba($c-light-green, 0.75));
        }
    }
}

#bet-chips.is-emcee {
    @include port-only {
        height: calc(60% + 120px);
        bottom: calc(40% - 120px);

        pointer-events: none !important;

        .bet-chips-wrap {
            bottom: 100px;
            left: unset;
            right: 10px;
            width: 50px;

            pointer-events: auto;

            .chip-4 {
                display: none;
            }
            .chip-edit {
                right: 9px;
                top: 215px;
                width: 32px;
            }
            .chip.chip-select {
                > .v-image__image, .v-responsive__content {
                    transform: scale(1.1);
                }
            }
        }
        .bet-btns-wrap {
            width: 110px;
            left: unset;
            right: 75px;
            bottom: 5px;
            
            pointer-events: auto;

            .flex {
                margin-right: 5px;
                
                width: 36px;
                height: 36px;
                border-radius: 20px;
                border-right: none;

                &.Repeat  { display: none; }
                &.Cancel  { background: rgba(#ff0000, 0.2); }
                &.Confirm { background: rgba(#00ff00, 0.2); }

                .v-image {
                    margin-top: calc((36px - 20px) / 2);
                }
            }
        }
    }
}

#bet-chips.roulette {
    @include port-only {
        height: calc(100% - 60px);
        bottom: calc(18px * 2);

        pointer-events: none;

        .bet-chips-wrap {
            top: calc(30% + 24px - 5px);
            left: unset;
            right: 10px;
            width: 50px;

            pointer-events: auto;

            .chip-edit {
                right: 9px;
                top: 265px;
                width: 32px;
            }
            .chip.chip-select {
                > .v-image__image, .v-responsive__content {
                    transform: scale(1.1);
                }
            }
        }
        .bet-btns-wrap {
            left: unset;
            right: 72.5px;
            // top: 32.5%;
            top: 35.3%;
            bottom: unset;
            width: 32.5px;
            
            pointer-events: auto;

            .flex {
                padding: 5px;
                margin-top: 7.5px;

                border: 1px solid #929292;
                border-radius: 6px;

                &.Repeat  { background-color: rgba(#000000, 0.2); }
                &.Cancel  { background-color: rgba(#ff0000, 0.2); }
                &.Confirm { background-color: rgba(#00ff00, 0.2); }

                .v-image {
                    height: 50px !important;
                }
            }
        }
    }
    @include land-only {
        z-index: 1;
        pointer-events: none !important;

        .bet-chips-wrap {
            pointer-events: auto;
        }
        .bet-btns-wrap {
            pointer-events: auto;
            bottom: 32px;

            @include ios-right("", "5px");
        }
    }
}
</style>
