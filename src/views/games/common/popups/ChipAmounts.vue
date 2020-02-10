<template>
    <SettingPopup id="chip-amounts" :event="event" :onBeforeOpen="onBeforeOpen">
        <v-flex xs12 sm6>
            <v-layout row wrap>
                <v-flex v-for="i in tableState.chipAmounts.length" :key="i" xs2-10>
                    <v-img :class="['img-chip-amount', `chip-amount-${ i - 1 }`]" :src="require(`@/assets/images/games/bet/img_chip${ i - 1 }.png`)" height="45px" contain @click="onChangeChip(i - 1)">
                        {{ formatLiteralAmount(tableState.chipAmounts[i - 1]) }}
                    </v-img>
                    <div class="amonut">{{ formatAmount(tableState.chipAmounts[i - 1]) }}</div>
                </v-flex>
                <v-flex class="edit-amount-wrap" xs9>
                    <v-text-field ref="inputField" class="amount-field" v-model="newChipAmount" :label="$t('chipAmount.edit')" :value="newChipAmount" prepend-inner-icon="edit" type="tel" mask="########" clearable outline @input="onInputAmount()" @focus="$root.$children[0].onFocusInput(true)" @blur="$root.$children[0].onFocusInput(false)" />
                </v-flex>
                <v-flex class="edit-amount-wrap" xs3>
                    <!-- <v-btn :disabled="newChipAmount === undefined || newChipAmount > userInfo.userMaxBet || newChipAmount < userInfo.userMinBet" class="save-amount" color="#39946a" @click="onSaveAmount()">{{ $t('chipAmount.save') }}</v-btn> -->
                    <v-btn :disabled="newChipAmount === undefined" class="save-amount" color="#39946a" @click="onSaveAmount()">{{ $t('chipAmount.save') }}</v-btn>

                </v-flex>
                <v-flex class="amount-format" xs12>
                    <template v-if="errorMsg"><span>{{ errorMsg }}</span></template>
                    <template v-else>
                        <span>{{ formatAmount(newChipAmount) }}</span><span v-if="newChipAmount >= 1000"> ≈ {{ formatLiteralAmount(newChipAmount) }}</span>
                    </template>
                </v-flex>
            </v-layout>
        </v-flex>
    </SettingPopup>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    event = Events.ON_CHIP_AMOUNTS;

    chipEditChoice = 0;
    newChipAmount: number | undefined = 0;

    errorMsg = "";

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    onBeforeOpen() {
        setTimeout(() => this.onChangeChip(0), 100);
        
        setTimeout(() => {
            Utils.addStyles(".amount-field .v-text-field__slot input", {
                maxlength:  `${ 8 }`,
                min: `${ this.userInfo.userMinBet }`,
                max: `${ this.userInfo.userMaxBet }`,
                inputmode: `numeric`,
                pattern: `[0-9]*`
            });
        }, 1000);
    }

    onChangeChip(choice: number) {
        this.errorMsg = "";
        this.chipEditChoice = choice;
        this.newChipAmount = this.tableState.chipAmounts[choice];

        this.mediaCtrl.spotFxSound.play("click");

        Utils.removeClass(".img-chip-amount", ["chip-selection", this.userInfo.tableTheme]);
        Utils.addClass(`.chip-amount-${ choice }`, ["chip-selection", this.userInfo.tableTheme]);
    }

    onInputAmount() {
        this.errorMsg = "";
        this.newChipAmount = this.newChipAmount ? (parseInt(this.newChipAmount.toString().slice(0, 8).replace(/^0|[^\d]/g, ""), 10) || 1) : undefined;
    }

    onSaveAmount() {
        let errorMsg = "";

        if (this.newChipAmount === undefined) this.$t("chipAmount.errorMsg.min").toString();
        else if (this.tableState.chipAmounts.indexOf(this.newChipAmount) !== -1) errorMsg = this.$t("chipAmount.errorMsg.duplicate").toString();

        if (errorMsg) {
            this.newChipAmount = this.tableState.chipAmounts[this.chipEditChoice];
            setTimeout(() => this.errorMsg = errorMsg, 50);
        } else {
            errorMsg = this.$t("chipAmount.success").toString();
            setTimeout(() => this.errorMsg = errorMsg, 50);
            this.tableState.upChipAmount({ choice: this.chipEditChoice, amount: this.newChipAmount || this.userInfo.userMinBet });
            this.$forceUpdate();

            this.eventBus.$emit(Events.ON_CHIP_AMOUNTS_CHANGED);
        }
    }

// #[Events] ---------- + ---------- + ----------
    formatAmount(amount: number) {
        return `$${ Utils.currency(amount, 3, 0) }`;
    }

    formatLiteralAmount(amount: number) {
        return Utils.formatNumber(amount, 1);
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#chip-amounts {
    .amonut {
        margin-top: 5px;
        font-size: 12px;
    };

    .img-chip-amount .v-responsive__content {
        transform: translateY(22.5%);

        color: #000000;
        font-size: 14px;
        font-weight: bold;
        font-family: Arial, Helvetica, sans-serif;
        white-space: nowrap;
        letter-spacing: -1px;
    }

    .v-image.chip-selection {
        transform: scale(1.2) translateY(-7.5px);
        z-index: 1;

        // animation: chip-selection 2s infinite;
        filter: drop-shadow(0 5px 5px rgba($c-light-blue, 0.75));

        &.-yellow {
            filter: drop-shadow(0 5px 5px rgba($c-main, 0.75));
        }
        &.-green {
            filter: drop-shadow(0 5px 5px rgba($c-light-green, 0.75));
        }
    }
    .v-image.chip-selection + .amonut {
        color: $c-main;
        font-weight: bold;
    }
    @keyframes chip-selection {
        0%   { filter: drop-shadow(0 0 2.5px #8CF7FB); }
        50%  { filter: drop-shadow(0 0 10px  #8CF7FB); }
        100% { filter: drop-shadow(0 0 2.5px #8CF7FB); }
    }

    .edit-amount-wrap {
        transform: translateX(-2.5%);
        margin-top: 15px;

        .amount-field {
            @include text-field-outline(#ffffff, #ffffff, 0.9);

            .v-input__slot {
                padding: 0 6px;

                .v-input__prepend-inner {
                    margin-top: 14px;
                }
            }
            .v-text-field__slot {
                margin: 0 -2px;

                label {
                    letter-spacing: -1px;
                }
                input[type=number]:-webkit-inner-spin-button,
                input[type=number]:-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;    // Firefox
                }
            }
        }
        .save-amount {
            transform: scaleX(0.9) translateX(-20%);
            margin-top: 5.5px;
            height: 50.4px;

            color: #ffffff;
            font-size: 14px;

            @include sm-and-up {
                font-size: 16px;
            }
        }
    }
    .amount-format {
        margin-top: -5px;
        padding-left: 29px;

        color: $c-main;
        text-align: left;
    }
}
</style>
