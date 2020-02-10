<template>
    <v-img class="niuniu-table portrait" :src="require('@/assets/images/games/tables/img_niuniuTable.png')" width="100%" height="calc(40% - 120px)" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start>
            <div v-for="(tag, i) in groupTags" :key="i" :class="`group-tag group-tag-${ (i < 3) ? 'top' : 'bottom' } group-tag-${ i % 3 }`">{{ tag }}</div>
            <v-layout fill-height row wrap ma-0>
                <v-flex v-for="item in betItems" :key="item" :class="`bet-table-all bet-table-${ item.charAt(0) === 'B' ? 'top' : 'bottom' }`" xs1-9>
                    <v-container fluid fill-height grid-list-xs @click="onBetItem(item)">
                        <v-layout align-content-start justify-center row wrap>
                            <div :class="`bet-title ${ $i18n.locale !== 'cn' && 'narrow-text' }`" xs9>{{ $t(`tableAreas.niuniu.${ item.substr(3).toLowerCase() }`) }}</div>
                        </v-layout>
                        
                        <v-img :class="['user-bet-chip', `chip-${ item }`, $parent.getTotalChipBy(item) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(item) }.png`)" contain>
                            <span>{{ $parent.formatChipBy(item) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>
            </v-layout>
        </v-container>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class NiuniuTablePortrait extends Mixins(BettingTableMixin)
{
    isSmallPhone = false;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);

        this.onResize();
        window.addEventListener("resize", this.onResize);
    }

    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            Utils.addStyles(".niuniu-table.portrait", {
                bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.235 + 120 }px`,
                height: `${ appHeight * 0.4 - 120 }px`
            });
            Utils.addStyles(".niuniu-table.portrait .super6-switch", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.2 + 105 }px` });
        }
        else {
            Utils.addStyles(".niuniu-table.portrait", { bottom: "", height: "calc(40% - 120px)" });
            Utils.addStyles(".niuniu-table.portrait .super6-switch", { bottom: "" });
        }
    }

    onResize() {
        this.isSmallPhone = window.innerHeight < 560;
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get groupTags() {
        return Array(6).fill(null).map((value, i) => `${ (i < 3) ? this.$t("tableAreas.niuniu.banker") : this.$t("tableAreas.niuniu.player") } ${ i % 3 + 1 }`);
    }
}
</script>

<style lang="scss">
.niuniu-table.portrait {
    position: fixed;
    left: 0;
    bottom: calc(23.5% + 120px);

    > .v-image__image {
        background-size: 100% 100%;
    }

    .container {
        padding: 6% 1.5% 12% 1.5%;
    }

    .group-tag {
        position: absolute;
        width: 30%;
        height: 20px;

        font-size: 11px;
        font-weight: bold;
        line-height: 20px;

        &.group-tag-top    {    top:  2%; color: $c-light-red;  }
        &.group-tag-bottom { bottom: 11%; color: #bbd3ff; }

        &.group-tag-0 { left:  2%; }
        &.group-tag-1 { left: 35%; }
        &.group-tag-2 { left: 68%; }
    }

    .bet-table-all {
        position: relative;
        
        &.bet-table-top .bet-title {
            color: $c-light-red;
        }
        &.bet-table-bottom .bet-title {
            color: #bbd3ff;
        }
    }

    .bet-title {
        font-size: 11px;
        font-weight: bold;
        line-height: 20px;
        
        &.narrow-text {
            letter-spacing: -1.5px;
        }
    }

    .user-bet-chip {
        position: absolute;
        top: calc(50% - 10px);
        left: 12.5%;
        z-index: 1;

        height: 30px;
        width: 30px;

        pointer-events: none;
        overflow: visible;

        &.hidden-chip { display: none; }

        .v-responsive__content span {
            display: inline-block;
            margin-top: 7px;
            padding: 0 5px;

            color: #000000;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            white-space: nowrap;
            letter-spacing: -1px;
        }
    }
}
</style>
