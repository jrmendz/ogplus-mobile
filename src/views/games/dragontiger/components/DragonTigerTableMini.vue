<template>
    <v-img :class="['dragontiger-table mini', `table-${ tableNumber }`]" :src="require('@/assets/images/games/tables/img_dragontigerTable-mini.png')" width="100%" height="130px" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <!-- Tie -->
                <v-flex xs3></v-flex>
                <v-flex class="bet-table-top" xs6>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tie)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.tie") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:8</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.Tie }`, getTotalChipBy(betItems.Tie) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.Tie) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.Tie) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Dragon -->
                <v-flex class="bet-table-bottom" xs6>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Dragon)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.dragon") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:1</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.Dragon }`, getTotalChipBy(betItems.Dragon) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.Dragon) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.Dragon) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Tiger -->
                <v-flex class="bet-table-bottom" xs6>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Tiger)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.tiger") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:1</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.Tiger }`, getTotalChipBy(betItems.Tiger) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.Tiger) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.Tiger) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>
            </v-layout>
        </v-container>
    </v-img>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import MiniTableMixin from "@/views/games/common/mixins/miniTableMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class DragonTigerTableMini extends Mixins(MiniTableMixin)
{


// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
.dragontiger-table.mini {
    padding: 1px;
    color: #ffffff;

    > .v-image__image {
        background-size: calc(100% - 4px) calc(130px - 4px);
    }

    .bet-title {
        font-size: 16px;
        font-weight: bold;
        line-height: 20px;
    }
    .bet-odds {
        font-size: 12px;
        line-height: 12px;
    }

    .user-bet-chip {
        position: absolute;
        z-index: 1;

        height: 36px;
        width: 36px;

        pointer-events: none;
        overflow: visible;

        &.hidden-chip { display: none; }

        &.chip-PPair  { top: 25px;   left : 17.5px;           }
        &.chip-Tie    { top: 25px;   left : calc(50% - 18px); }
        &.chip-BPair  { top: 25px;   right: 17.5px;           }
        &.chip-Dragon { top: 87.5px; left : 32.5px;           }
        &.chip-Tiger  { top: 87.5px; right: 32.5px;           }

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
