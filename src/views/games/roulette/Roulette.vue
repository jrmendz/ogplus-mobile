<template>
    <v-layout id="roulette" ma-0 pa-0>
        <RouletteTablePortrait v-if="platform.orientation.isPortrait" :tableNumber="tableNumber" />
        <RouletteTableLandscape v-else :tableNumber="tableNumber" />
    </v-layout>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events, { TableData, TableStatus } from "@/models/helper/types";
import GameMixin from "@/views/games/common/mixins/gameMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    RouletteTableLandscape: () => import("@/views/games/roulette/components/RouletteTableLandscape.vue"),
    RouletteTablePortrait : () => import("@/views/games/roulette/components/RouletteTablePortrait.vue"),
} })
export default class Roulette extends Mixins(GameMixin)
{
    /** 0 ~ 36, -1 means no result */
    rollingResult = -1;
    isRoundTable = false;

    betAreas = {
        other : { count:  6, startAt0: false },
        dozen : { count:  3, startAt0: false },
        row   : { count:  3, startAt0: false },
        s     : { count: 37, startAt0: true  },    // single
        street: { count: 12, startAt0: false },
        line  : { count: 12, startAt0: true  },
        near  : { count: 24, startAt0: false },
        zero  : { count:  3, startAt0: false },
        split : { count: 33, startAt0: false },
        tri   : { count:  2, startAt0: false },    // triangle
        square: { count: 22, startAt0: false },
    };

    betOthers = ["small", "even", "red", "black", "odd", "big"];

    betSingles = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    betSeries = [
        [0, 1, 2, 33, 34, 35, 36],
        [3, 4, 5, 6, 7, 28, 29, 30, 31, 32],
        [8, 9, 10, 23, 24, 25, 26, 27],
        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    ];

    numBetsInRound = 5;

    lastChipSets: { [item: string]: number } = {};

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("currentTableData.status", { immediate: true }) onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Betting:
                setTimeout(() => this.rollingResult = -1, 2000);
                break;

            case TableStatus.Default:
                this.rollingResult = !this.currentTableData.game.value ? -1 : +this.currentTableData.game.value;

                // Play the sound of the result
                this.mediaCtrl.rouletteSound.play("point" + this.rollingResult);

                // Even, Odd, Red, Black
                if (this.rollingResult > 0) {
                    setTimeout(() => this.mediaCtrl.rouletteSound.play(this.rollingResult % 2 === 0 ? "even" : "odd"), 1600);
                    setTimeout(() => this.mediaCtrl.rouletteSound.play([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(this.rollingResult) ? "red" : "black"), 2300);
                }
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    beforeDestroy() {
        TweenLite.killTweensOf(".roulette-table.landscape");
    }

// #[Events] ---------- + ---------- + ----------
    onBetItem(key: string, hasSound: boolean = true) {
        if (this.currentTableData.status !== TableStatus.Betting) return;
        if (hasSound) this.mediaCtrl.spotFxSound.play("click");

        this.onBetItemSub(key);
    }

    onBetInRound(id: number) {
        const index = this.betSingles.indexOf(id);

        const numSingles = this.betSingles.length;
        const numSide = (this.numBetsInRound / 2) >> 0;

        this.mediaCtrl.spotFxSound.play("click");

        if (this.isRoundTable && this.tableState.chipAmounts[this.tableState.chipSelection] * this.numBetsInRound > this.userInfo.balance - this.userInfo.tempInGameBalance)
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.noFund"));
        else {
            for (let i = numSide; i >= -numSide; --i) {
                this.onBetItem(`s${ this.betSingles[(index + i + numSingles) % numSingles] }`, false);
            }
        }
    }

    onBetSeries(id: number) {
        if (this.currentTableData.status !== TableStatus.Betting) return;

        this.mediaCtrl.spotFxSound.play("click");
        
        if (this.isRoundTable && this.tableState.chipAmounts[this.tableState.chipSelection] * this.betSeries[id].length > this.userInfo.balance - this.userInfo.tempInGameBalance)
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.state.noFund"));
        else {
            for (const i of this.betSeries[id]) this.onBetItem(`s${ this.betSingles[i] }`, false);
        }
    }

    onChangeBetNum() {
        this.numBetsInRound += 2;
        if (this.numBetsInRound > 5) this.numBetsInRound = 1;
    }

// #[Methods] ---------- + ---------- + ----------
    getIsExistChips(item: string) {
        let isExist = false;

        if (item.search(/s\d+/) !== -1) {
            const id = +item.substr(1);

            if (id >= 1) {
                // Small, Big
                if (id <= 18) isExist = isExist || this.getTotalChipBy("other1") > 0;
                else isExist = isExist || this.getTotalChipBy("other6") > 0;

                // Even, Odd
                if (id % 2 === 0) isExist = isExist || this.getTotalChipBy("other2") > 0;
                else isExist = isExist || this.getTotalChipBy("other5") > 0;

                // Red, Black
                if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(id)) isExist = isExist || this.getTotalChipBy("other3") > 0;
                else isExist = isExist || this.getTotalChipBy("other4") > 0;

                // Row
                isExist = isExist || this.getTotalChipBy(`row${ (id - 1) % 3 + 1 }`) > 0;

                // Dozen
                isExist = isExist || this.getTotalChipBy(`dozen${ (((id - 1) / 12) >> 0) + 1 }`) > 0;

                // Line
                isExist = isExist || this.getTotalChipBy(`line${ (((id - 1) / 3) >> 0) + 1 }`) > 0 || this.getTotalChipBy(`line${ (((id - 4) / 3) >> 0) + 1 }`) > 0;

                // Street
                isExist = isExist || this.getTotalChipBy(`street${ (((id - 1) / 3) >> 0) + 1 }`) > 0;

                // Zero
                if (id <= 3) isExist = isExist || this.getTotalChipBy(`zero${ id }`) > 0;

                // Triangle
                if (id <= 3) isExist = isExist || this.getTotalChipBy(`tri${ id }`) > 0 || this.getTotalChipBy(`tri${ id - 1 }`) > 0;

                // Near
                if (id % 3 === 1) isExist = isExist || this.getTotalChipBy(`near${ ((id / 3) >> 0) * 2 + 1 }`) > 0;
                else if (id % 3 === 2) isExist = isExist || this.getTotalChipBy(`near${ (((id - 1) / 3) >> 0) * 2 + 1 }`) > 0 || this.getTotalChipBy(`near${ ((id / 3) >> 0) * 2 + 2 }`) > 0;
                else isExist = isExist || this.getTotalChipBy(`near${ (((id - 1) / 3) >> 0) * 2 + 2 }`) > 0;

                // Split
                isExist = isExist || this.getTotalChipBy(`split${ id }`) > 0 || this.getTotalChipBy(`split${ id - 3 }`) > 0;

                // Square
                if (id % 3 === 1) isExist = isExist || this.getTotalChipBy(`square${ ((id / 3) >> 0) * 2 + 1 }`) > 0 || this.getTotalChipBy(`square${ (((id - 3) / 3) >> 0) * 2 + 1 }`) > 0;
                else if (id % 3 === 2) isExist = isExist || this.getTotalChipBy(`square${ (((id - 1) / 3) >> 0) * 2 + 1 }`) > 0 || this.getTotalChipBy(`square${ ((id / 3) >> 0) * 2 + 2 }`) > 0
                                                         || this.getTotalChipBy(`square${ ((((id - 3) - 1) / 3) >> 0) * 2 + 1 }`) > 0 || this.getTotalChipBy(`square${ (((id - 3) / 3) >> 0) * 2 + 2 }`) > 0;
                else isExist = isExist || this.getTotalChipBy(`square${ (((id - 1) / 3) >> 0) * 2 + 2 }`) > 0 || this.getTotalChipBy(`square${ (((id - 4) / 3) >> 0) * 2 + 2 }`) > 0;
            }
            else {
                // Zero
                isExist = isExist || this.getTotalChipBy("zero1") > 0 || this.getTotalChipBy("zero2") > 0 || this.getTotalChipBy("zero3") > 0;

                // Triangle
                isExist = isExist || this.getTotalChipBy("tri1") > 0 || this.getTotalChipBy("tri2") > 0;
            }
        }

        return isExist || this.getTotalChipBy(item) > 0;
    }

    getIsRollingResult(item: string) {
        if (this.rollingResult === -1) return false;

        let isResult = false;

        if (this.rollingResult === 0)
            isResult = item === "s0" || item === "line0" || item.search(/zero\d+/) === 0 || item.search(/tri\d+/) === 0;

        else {
            if (item.search(/s\d+/     ) === 0) isResult = isResult || +item.substr("s".length     ) === this.rollingResult;
            if (item.search(/street\d+/) === 0) isResult = isResult || +item.substr("street".length) === (((this.rollingResult - 1) /  3) >> 0) + 1;
            if (item.search(/line\d+/  ) === 0) isResult = isResult || +item.substr("line".length  ) === (((this.rollingResult - 1) /  6) >> 0);
            if (item.search(/dozen\d+/ ) === 0) isResult = isResult || +item.substr("dozen".length ) === (((this.rollingResult - 1) / 12) >> 0) + 1;
            if (item.search(/row\d+/   ) === 0) isResult = isResult || +item.substr("row".length   ) % 3 === this.rollingResult % 3;

            if (item === "other1") isResult = isResult || this.rollingResult <= 18;
            else if (item === "other6") isResult = isResult || this.rollingResult >= 19;

            if (item === "other2") isResult = isResult || this.rollingResult % 2 === 0;
            else if (item === "other5") isResult = isResult || this.rollingResult % 2 === 1;

            if (item === "other3") isResult = isResult || [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(this.rollingResult);
            else if (item === "other4") isResult = isResult || ![1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(this.rollingResult);
        }

        return isResult;
    }

    showTable(visible: boolean) {
        // Utils.addStyles(".roulette-table", { pointerEvents: visible ? "auto" : "none" });
    }

// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#roulette {

}
</style>
