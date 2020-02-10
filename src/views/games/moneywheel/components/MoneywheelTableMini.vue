<template>
    <v-img :class="['moneywheel-table mini', `table-${ tableNumber }`]" :src="require('@/assets/images/games/tables/img_moneywheelTable-mini.png')" width="100%" height="130px" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <v-flex v-for="item in betItems" :key="item" :class="`bet-table-${ ((num = +item.substr(1)) <= 5) ? 'top' : 'bottom' }`" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(item)">
                        <v-layout align-content-start row wrap pt-2>
                            <span class="bet-ratio">x {{ num }}</span>
                            <v-flex class="bet-title" xs12>{{ (num === 40) ? "财" : num }}</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ item }`, getTotalChipBy(item) ? '' : 'hidden-chip', hiddenChips !== undefined ? 'hidden-chip' : '']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(item) }.png`)" contain>
                            <span>{{ formatChipBy(item) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>
            </v-layout>
        </v-container>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import { MoneywheelItems } from "@/models/helper/types";
import MiniTableMixin from "@/views/games/common/mixins/miniTableMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class MoneywheelTableMini extends Mixins(MiniTableMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get betItems(): { [item: string]: string } {
        return Object.keys(MoneywheelItems)
                     .filter(key => typeof (MoneywheelItems as any)[key] === "number")
                     .reduce<{ [item: string]: string }>((result, value) => { result[value] = value; return result; }, {});
    }
}
</script>

<style lang="scss">
.moneywheel-table.mini {
    padding: 1px;
    color: #ffffff;

    > .v-image__image {
        background-size: calc(100% - 4px) calc(130px - 4px);
    }

    .bet-table-top, .bet-table-bottom {
        height: 50%;
    }
    .bet-title {
        font-size: 16px;
        font-weight: bold;
        line-height: 20px;
    }
    .bet-ratio {
        font-size: 10px;
        font-weight: bold;
        position: relative;
        left: 65%;
    }

    .user-bet-chip {
        position: absolute;
        z-index: 1;

        height: 36px;
        width: 36px;

        pointer-events: none;
        overflow: visible;

        &.hidden-chip { display: none; }

        &.chip-X1  { top: 25px;   left : 17.5px;           }
        &.chip-X2  { top: 25px;   left : calc(50% - 18px); }
        &.chip-X5  { top: 25px;   right: 17.5px;           }
        &.chip-X10 { top: 87.5px; left : 17.5px;           }
        &.chip-X20 { top: 87.5px; left : calc(50% - 18px); }
        &.chip-X40 { top: 87.5px; right: 17.5px;           }

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
