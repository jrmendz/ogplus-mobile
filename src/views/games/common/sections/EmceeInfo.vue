<template>
    <v-container id="emcee-info" class="ma-0 pa-0">
        <v-layout align-start row wrap>
            <v-flex class="emcee-avatar" xs2-7>
                <v-img :src="require('@/assets/images/settings/img_emceeDefault.png')" width="34px" contain />
            </v-flex>
            <v-flex xs5-7>
                <v-layout align-start justify-center column wrap>
                    <v-flex class="emcee-data nickname" xs12>{{ emceeName }}</v-flex>
                    <v-flex class="emcee-data balance" xs12>
                        <v-img class="img-trend d-inline-block" :src="require('@/assets/images/settings/img_trendFire.png')" width="12px" contain /><span>{{ emceeTrend }}</span>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
        <div class="btn-follow" @click="followEmcee()">{{ $t("follow") }}</div>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events, { TableData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{


// #[Props] ---------- + ---------- + ----------
    

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ---------- 


// #[Evnets] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    followEmcee() {
        this.mediaCtrl.spotFxSound.play("click");
        console.log("followEmcee");
    }

// #[Computed] ---------- + ---------- + ----------
    get emceeData() {
        return this.gameInfo.emceeDatas[this.userInfo.tableSelection.tableNumber];
    }
    get emceeName() {
        const name = this.emceeData ? this.emceeData.nickname : "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    get emceeTrend() {
        return this.emceeData ? this.emceeData.followers : 0;
    }
}
</script>

<style lang="scss">
#emcee-info {
    position: fixed;
    z-index: 1;
    left: 2.5px;
    top: 5px;

    width: 160px;
    height: 40px;
    border-radius: 20px;
    background: rgba(#000000, 0.6);

    .emcee-avatar .v-image {
        margin: 3px 0 0 4px;
    }
    .emcee-data {
        text-shadow: 1px 1px #000000;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.nickname {
            margin-top: 2px;
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
            line-height: 20px;
        }
        &.balance {
            font-size: 14px;
            line-height: 16px;

            .img-trend {
                vertical-align: text-bottom;
                margin-right: 5px;
            }
        }
    }

    .btn-follow {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 50px;
        height: 30px;
        line-height: 30px;

        border-radius: 15px;
        background: #FF0038;
    }
}
</style>
