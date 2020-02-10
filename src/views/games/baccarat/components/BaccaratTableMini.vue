<template>
    <v-img :class="['baccarat-table mini', `table-${ tableNumber }`]" :src="require('@/assets/images/games/tables/img_baccaratTable-mini.png')" width="100%" height="130px" contain>
        <v-container grid-list-xs fluid fill-height align-start justify-start ma-0 pa-0>
            <v-layout fill-height row wrap>
                <!-- P Pair -->
                <v-flex class="bet-table-top" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.PPair)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.ppair") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:11</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.PPair }`, getTotalChipBy(betItems.PPair) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.PPair) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.PPair) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Tie -->
                <v-flex class="bet-table-top" xs4>
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

                <!-- B Pair -->
                <v-flex class="bet-table-top" xs4>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.BPair)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.bpair") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:11</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.BPair }`, getTotalChipBy(betItems.BPair) ? '' : 'hidden-chip']"
                               :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.BPair) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.BPair) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Player -->
                <v-flex class="bet-table-bottom" xs6>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Player)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.player") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:1</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.Player }`, getTotalChipBy(betItems.Player) ? '' : 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.Player) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.Player) }}</span>
                        </v-img>
                    </v-container>
                </v-flex>

                <!-- Banker -->
                <v-flex class="bet-table-bottom" xs6>
                    <v-container fluid fill-height ma-0 pa-0 @click="onBetItem(betItems.Banker)">
                        <v-layout align-content-start row wrap pt-2>
                            <v-flex class="bet-title" xs12>{{ $t("tableAreas.banker") }}</v-flex>
                            <v-flex class="bet-odds" xs12>1:0.95</v-flex>
                        </v-layout>
                        <v-img :class="['user-bet-chip', `chip-${ betItems.Banker }`, getTotalChipBy(betItems.Banker) ? '' : 'hidden-chip']"
                                :src="require(`@/assets/images/games/bet/img_chip${ getLastChipSets(betItems.Banker) }.png`)" contain>
                            <span>{{ formatChipBy(betItems.Banker) }}</span>
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

@Component({ components: {}})
export default class BaccaratTableMini extends Mixins(MiniTableMixin)
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

.baccarat-table.mini {
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
        &.chip-Player { top: 87.5px; left : 32.5px;           }
        &.chip-Banker { top: 87.5px; right: 32.5px;           }

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
