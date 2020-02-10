<template>
    <v-container id="user-menu" fluid fluid-ios ma-0 pa-1>
        <v-layout align-start justify-start row wrap>
            <v-flex class="user-info" xs8 sm10 ma-0 pa-0>
                <v-layout align-start row wrap>
                    <v-flex xs3 sm1-10>
                        <v-img class="user-avatar" :src="userAvatar" height="42px" contain @click="onProfile()" />
                    </v-flex>
                    <v-flex xs8 sm10>
                        <v-layout align-start justify-center column wrap>
                            <v-flex class="user-data" xs12>{{ userInfo.nickname }}</v-flex>
                            <v-flex class="user-data" xs12><v-icon color="#ffffff">attach_money</v-icon>{{ formattedBalance }}</v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-flex>
            <div class="total-people-wrap">
                <v-img class="total-people" :src="require('@/assets/images/settings/img_people.png')" width="18px" height="100%" contain />
                <span class="total-people">{{ siteState.onlinePlayers }}</span>
            </div>
            <div class="setting">
                <!-- <v-img :src="require('@/assets/images/settings/img_records.png')" width="36px" height="36px" @click="onRecords()" /> -->
                <!-- <v-img :src="require(`@/assets/images/settings/img_sound${ mediaCtrl.isBgmMute? 'Off' : 'On' }.png`)" width="36px" height="36px" @click="mediaCtrl.toggleBgm()" /> -->
                <v-img :src="require('@/assets/images/settings/img_setting.png')" width="36px" height="36px" @click="onSetting()" />
            </div>
            <div id="header-marquee">
                <div class="marquee-container">
                    <div :style="{ animation: `marquee ${ marqueeMessageLength / 1.5 }s linear infinite` }">{{ marqueeMessage }}</div>
                </div>
            </div>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events from "@/models/helper/types";
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
        this.siteState.updateMarqueeMessage();
    }

// #[Events] ---------- + ---------- + ----------
    onSupport() {
        this.mediaCtrl.spotFxSound.play("click");
    }

    onRecords() {
        this.mediaCtrl.spotFxSound.play("click");
        this.eventBus.$emit(Events.ON_HISTORY, true);
    }

    onProfile() {
        this.mediaCtrl.spotFxSound.play("click");
        this.eventBus.$emit(Events.ON_USER_SETTING, true);
     }

    onSetting() {
        this.mediaCtrl.spotFxSound.play("click");
        this.eventBus.$emit(Events.ON_GAME_SETTING, true);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get formattedBalance() {
        return Utils.currency(this.displayedBalance, 3, 2);
    }
    
    get userAvatar() {
        return Utils.format(this.userInfo.avatarUrl, this.userInfo.avatarId);
    }

    get marqueeMessage() {
        let lang = this.$i18n.locale;
             if (lang === "ja") lang = "jp";
        else if (lang === "kr") lang = "kr";
        else if (lang === "id") lang = "ind";
        else if (lang === "vi") lang = "vt";

        return (this.siteState.marqueeMessages && this.siteState.marqueeMessages.length > 0) ? this.siteState.marqueeMessages.reduce((prev, value) => prev + value["Announcement_" + lang] + "　", "") : this.$t("lobbyMarquee[0]");
    }

    get marqueeMessageLength() {
        return this.marqueeMessage.length;
    }
    
}
</script>

<style lang="scss">
#user-menu {
    position: fixed;
    top: 0;
    height: 72px;

    background-color: $c-black;
    background-image: linear-gradient(to right, #141e30, #243b55);
    box-shadow: 0 5px 10px rgba(#000000, 0.5);
    border-radius: 0 0 15px 15px;

    color: #ffffff;

    .user-data {
        text-shadow: 1px 1px #000000;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:first-of-type {
            color: $c-main-light;
            font-size: 15px;
            font-weight: bold;
        }
        &:last-of-type {
            color: $c-main-light;
            font-size: 15px;

            .v-icon {
                transform: translateX(-1px) translateY(-1px);
                margin: 0 -3px;
                font-size: 16px;
            }
        }
    }
    .total-people-wrap {
        position: absolute;
        top: 15px;
        right: 30px;
        width: 100px;
        height: 20px;

        line-height: 20px;

        .v-image {
            display: inline-table;
            margin-right: 5px;
        }
        span {
            display: inline-table;

            font-weight: bold;
            font-size: 16px;
            color: $c-main;
        }
    }

    .setting {
        position: absolute;
        right: 0;
        top: 7.5px;

        .v-image {
            display: inline-block;
            margin-right: 12px;

            border-radius: 5px;
            background-image: linear-gradient(to bottom, #666767 0%, #1f1f1f 100%);

            > .v-image__image {
                background-size: 24px 24px;
            }
        }
    }

    #header-marquee {
        position: absolute;
        bottom: 4px;
        margin: 0 5px;
        width: calc(100% - 20px);
        overflow: hidden;

        border-radius: 10px;
        background-color: rgba(#000000, 0.2);

        div.marquee-container {
            float: right;
            overflow: hidden;

            div {
                color: #ffffff;
                white-space: nowrap;
                // animation: marquee 960s linear infinite;
            }
        }
    }

    @keyframes marquee {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-240%);
        }
    }

    @include land-only {
        height: 50px;

        #header-marquee {
            top: 10px;
            width: calc(87.5% - 120px - 200px);
            height: 30px;

            border-radius: 15px;
            background-position: 10px 6.5px;

            @include ios-left("", 12.5% "+" 120px);

            div.marquee-container {
                margin-top: 5px;
            }
        }
    }
    @include xxs-land-only {
        #header-marquee {
            @include ios-left("", 20% "+" 120px);
            width: calc(80% - 120px - 200px);
        }
    }
}
</style>
