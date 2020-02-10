<template>
    <v-container id="user-info" :class="['ma-0 pa-0', currentTableData.code, tableState.isEmcee && 'is-emcee']">
        <v-layout align-start row wrap>
            <v-flex class="user-avatar" xs3-10>
                <v-img :src="userAvatar" width="34px" contain @click="onProfile()" />
            </v-flex>
            <v-flex xs7-10>
                <v-layout align-start justify-center column wrap>
                    <v-flex class="user-data nickname" xs12>{{ userInfo.nickname }}</v-flex>
                    <v-flex class="user-data balance" xs12><v-icon color="#ffffff">attach_money</v-icon>{{ formattedBalance }}</v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
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
    displayedBalance: number = 0;


// #[Props] ---------- + ---------- + ----------
    

// #[Watch] ---------- + ---------- + ----------
    @Watch("userInfo.balance") onBalanceChanged(val: number, old: number) {
        TweenLite.killTweensOf(this);
        TweenLite.to(this, 0.5, { displayedBalance: val });
    }

// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        this.displayedBalance = this.userInfo.balance;
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }


// #[Evnets] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus && isPortrait && this.tableState.isEmcee)
             Utils.addStyles("#user-info", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.4 - 120 + 5 }px` });
        else Utils.addStyles("#user-info", { bottom: "" });
    }

    onProfile() {
        this.eventBus.$emit(Events.ON_USER_SETTING, true);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get formattedBalance() {
        return Utils.currency(this.displayedBalance, 3, 2);
    }

    get userAvatar() {
        return Utils.format(this.userInfo.avatarUrl, this.userInfo.avatarId);
    }
}
</script>

<style lang="scss">
#user-info {
    position: fixed;
    z-index: 1;
    left: 2.5px;
    top: 5px;

    width: 145px;
    height: 40px;
    border-radius: 20px;
    background: rgba(#000000, 0.6);

    @include land-only {
        top: 2.5px;
        border-top: unset;

        @include ios-left("", "5px");
    }

    .user-avatar .v-image {
        margin: 3px 0 0 4px;
    }
    .user-data {
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

            .v-icon {
                transform: translateY(-1.5px);
                margin: 0 -2px;
                font-size: 12px;
            }
        }
    }
}
#user-info.moneywheel {
    @include port-only {
        top: calc(35% - 55px);
        left: unset;
        right: 2.5px;
    }
}

#user-info.is-emcee {
    @include port-only {
        top: unset;
        left: 10px;
        height: 24px;
        bottom: calc(40% - 120px + 5px);

        .user-avatar, .nickname {
            display: none;
        }
        .balance {
            line-height: 24px;
            padding-left: 10px;
        }
    }
}
</style>
