<template>
    <v-container class="niuniu-table landscape-wrap" pa-0 ma-0>
        <v-img class="niuniu-table landscape" :src="require('@/assets/images/games/tables/img_niuniuTable-land.png')" width="100%" height="100%" contain>
            <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
                <div v-for="i in 3" :key="i" :class="`bet-group bet-group-${ i - 1 }`">
                    <div :class="`group-tag group-tag-top group-tag-${ i - 1 }`">{{ `${ $t("tableAreas.niuniu.banker") } ${ i }` }}</div>
                    <div :class="`group-tag group-tag-bottom group-tag-${ i - 1 }`">{{ `${ $t("tableAreas.niuniu.player") } ${ i }` }}</div>
                    <template v-for="item in betItems">
                        <div v-if="item.includes(i)" :key="item" :class="`bet-table-all bet-table-${ item.charAt(0) === 'B' ? 'top' : 'bottom' } bet-table-${ item.substr(3) }`">
                            <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(item)">
                                <v-layout align-content-start justify-center row wrap>
                                    <div :class="`bet-title ${ $i18n.locale !== 'cn' && 'narrow-text' }`" xs9>{{ $t(`tableAreas.niuniu.${ item.substr(3).toLowerCase() }`) }}</div>
                                </v-layout>
                                
                                <v-img :class="['user-bet-chip', `chip-${ item }`, $parent.getTotalChipBy(item) ? '' : 'hidden-chip']"
                                    :src="require(`@/assets/images/games/bet/img_chip${ $parent.getLastChipSetsTemp(item) }.png`)" contain>
                                    <span>{{ $parent.formatChipBy(item) }}</span>
                                </v-img>
                            </v-container>
                        </div>
                    </template>
                </div>
            </v-container>
        </v-img>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import BettingTableMixin from "@/views/games/common/mixins/bettingTableMixin";
import Events from "@/models/helper/types";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class NiuniuTableLandscape extends Mixins(BettingTableMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus)
             Utils.addStyles(".niuniu-table.landscape-wrap", { bottom: `${ (window.innerHeight - appHeight) + 30 }px` });
        else Utils.addStyles(".niuniu-table.landscape-wrap", { bottom: "" });
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get groupTags() {
        return Array(6).fill(null).map((value, i) => `${ (i < 3) ? this.$t("tableAreas.niuniu.banker") : this.$t("tableAreas.niuniu.player") } ${ i % 3 + 1 }`);
    }
}
</script>

<style lang="scss">
.niuniu-table.landscape-wrap {
    position: fixed;
    left: 100px;
    bottom: 30px;

    height: calc(35% - 10px);
    width: calc(100% - 200px);

    perspective: 450px;

    @include md-and-up {
        height: 27.5% !important;
    }

    @include ios-left("", "100px");
    @include ios-width("", "100% - 200px");
}
.niuniu-table.landscape {
    position: absolute;
    overflow: visible;

    transform: rotateX(50deg) translateY(10px);
    transform-origin: bottom;

    color: $c-main-light;

    > .v-image__image {
        background-size: 100% 100%;
    }

    .group-tag {
        position: absolute;
        left: -20%;
        width: 30%;
        height: 18px;

        font-size: 13px;
        font-weight: bold;
        line-height: 18px;
        letter-spacing: -1px;

        &.group-tag-top    {    top: 25%; color: $c-light-red;  }
        &.group-tag-bottom { bottom: 25%; color: $c-light-blue; }
    }

    .bet-group {
        position: absolute;
        width: 30%;
        height: 88%;

        &.bet-group-0 {
            top: 4%;
            left: 1.75%;
            transform: rotate(4.5deg);
        }
        &.bet-group-1 {
            top: 13.5%;
            left: 35.5%;
        }
        &.bet-group-2 {
            top: 4%;
            left: 69.5%;
            transform: rotate(-4.5deg);
        }
    }

    .bet-table-all {
        position: absolute;
        width: 32.5%;
        height: 50%;

        &.bet-table-Double { left:  1%; }
        &.bet-table-Equal  { left: 34%; }
        &.bet-table-Many   { left: 67%; }

        &.bet-table-bottom {  top: 50%; }
        
        &.bet-table-top .bet-title {
            color: $c-light-red;
        }
        &.bet-table-bottom .bet-title {
            color: $c-light-blue;
        }
    }

    .bet-title {
        margin-top: 5px;
        font-size: 15px;
        font-weight: bold;
        line-height: 20px;
        
        &.narrow-text {
            font-size: 13px;
            letter-spacing: -1.5px;
        }
    }

    .user-bet-chip {
        position: absolute;
        left: 22.5%;
        z-index: 1;

        height: 32px;
        width: 32px;

        pointer-events: none;
        overflow: visible;

        &.hidden-chip { display: none; }

        &.chip-Dragon { top: 20%; left : calc((100% - 36px) * 0.5); }
        &.chip-Phoenix  { top: 20%; right: calc((100% - 36px) * 0.5); }
        &.chip-Lucky    { top: 25%; left : calc((100% - 36px) * 0.8); }

        .v-responsive__content span {
            display: inline-block;
            margin-top: 8px;
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
