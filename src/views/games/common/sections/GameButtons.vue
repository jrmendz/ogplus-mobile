<template>
    <v-container id="game-buttons" :class="[currentTableData.code, tableState.isEmcee && 'is-emcee']" fluid align-start ma-0 pa-0>
        <!-- <div id="camera-line">[{{ mediaCtrl.cameraLine }}]</div> -->
        <template v-for="(value, key) in MenuItems">
            <v-img v-if="isVisible(value)" :key="key" :id="`btn-${ value }`" class="menu-btns" :src="getImage(value)" @click="onButtons(value)" />
        </template>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events, { TableData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

enum MenuItems { Sidebar = "tips", DealerLike = "like", Chat = "chat", Exit = "exit", Refresh = "refresh", Setting = "setting", /*Sound = "sound"*/ }

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    
// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ---------- 
    mounted() {
        this.socialInfo.getFollowedDealers();
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ---------- 
    onButtons(id: MenuItems) {
        this.mediaCtrl.spotFxSound.play("click");
        
        switch (id) {
            case MenuItems.Sidebar: 
                this.eventBus.$emit(Events.ON_SIDEBAR, true);
                break;

            case MenuItems.DealerLike:
                this.socialInfo.followDealer({ dealersCode: +this.dealerData.rid });
                break;

            case MenuItems.Chat:
                this.eventBus.$emit(Events.ON_CHAT_BOX);
                break;

            case MenuItems.Exit:
                if (!this.tableState.hasConfirmBets(this.userInfo.tableSelection.tableNumber)) this.gameInfo.currentTableInfo.tableNumber = null;
                this.tableState.exitTable({ tableNumber: this.userInfo.tableSelection.tableNumber, gameType: this.$route.params.id });
                break;

            case MenuItems.Refresh:
                if (this.mediaCtrl.isVideoVisible) {
                    this.mediaCtrl.toggleVideo();
                    this.mediaCtrl.switchCameraLine();
                    setTimeout(() => this.mediaCtrl.toggleVideo(), 200);
                }
                break;

            case MenuItems.Setting:
                this.eventBus.$emit(Events.ON_GAME_SETTING, true);
                break;

            // case MenuItems.Sound:
                // This is for live audio
                // this.mediaCtrl.toggleAllSounds(this.mediaCtrl.isLiveVideoMuted);
                // break;
        }
    }

    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                if (this.tableState.isEmcee)
                     Utils.addStyles("#btn-chat", { bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.4 - 120 + 5 }px` });
                else Utils.addStyles("#btn-chat", { top: `${ appHeight * 0.35 - 18 }px` });
            }
        }
        else Utils.addStyles("#btn-chat", { top: "", bottom: "" });
    }

// #[Methods] ---------- + ---------- + ---------- 
    getImage(value: "sound" | "like") {
        let suffix = "";
        switch (value) {
            case "sound":
                suffix = this.mediaCtrl.isLiveVideoMuted ? "Off" : "On";
                break;

            case "like":
                suffix = this.dealerData ? (this.socialInfo.hasFollowedDealer({ dealersCode: +this.dealerData.rid }) ? "-red" : "") : "";
                break;
        }
        return require(`@/assets/images/settings/img_${ value }${ suffix }.png`);
    }

    isVisible(value: string) {
        if (value === "like") return this.dealerData ? !this.socialInfo.hasFollowedDealer({ dealersCode: +this.dealerData.rid }) : false;
        return true;
    }

// #[Computed] ---------- + ---------- + ----------
    get MenuItems() { return MenuItems; }

    get dealerData() {
        return this.currentTableData.dealer;
    }
}
</script>

<style lang="scss">
#game-buttons {
    .menu-btns {
        position: fixed;
        width: 38px;
        height: 28px;
        top: 5px;
        
        background-color: rgba(#000000, 0.6);
        pointer-events: auto;

        > .v-image__image {
            background-size: 18px 18px;
        }
    }
    #btn-chat, #btn-like { 
        left: 5px;
        width: 36px;
        height: 36px;
        border-radius: 20px;

        > .v-image__image {
            background-size: 22px 22px;
        }
    }

    #camera-line {
        position: fixed;
        bottom: calc(20% + 90px);
        width: 45px;
        height: 24px;

        color: #ffffff;
        line-height: 24px;
        font-size: 12px;

        @include land-only {
            bottom: unset;
            top: 65px;
            right: 183.5px;
        }
    }

    #btn-tips {
        @include ios-right("", "5px");

        top: 37.5px;
        width: 55px;
        height: 34px;

        border-radius: 20px;

        > .v-image__image {
            background-size: 26px 26px;
        }

        @include land-only {
            top: 30px;
        }
    }

    #btn-refresh {
        @include ios-right("", "83px");

        border-radius: 20px 0 0 20px;
    }
    #btn-setting { @include ios-right("", "44px"); }
    #btn-exit { 
        right: 5px;

        border-radius: 0 20px 20px 0;

        @include land-only {
            @include ios-right("", "5px");
        }
    }
    // #btn-sound   { right: calc(2.5px + 40px); }

    @include port-only {
        #btn-chat {
            top: calc(35% - 18px);
        }
        #btn-like {
            top: calc(35% - 60px);
        }
    }
    @include land-only {
        .menu-btns {
            top: 32.5px;
        }

        #btn-chat { 
            top: 50px;
            transform: scale(1.1);

            @include ios-left("", "20px");
        }

        #btn-like {
            left: unset;
            top: 27.5px;

            @include ios-right("", "200px");
        }

        #btn-refresh { @include ios-right("", "150px"); }
        #btn-setting { @include ios-right("", "110px"); }
        #btn-exit    { @include ios-right("", "70px" ); }
        // #btn-sound   { @include ios-right("", "45px + 105px"); }
    }
}

#game-buttons.roulette {
    z-index: 2;
    pointer-events: none;

    #btn-chat { display: none; }
    #btn-like {
        top: 37.5px;
        left: unset;
        right: 67.5px;

        @include land-only {
            top: 30px;
            @include ios-right("", "200px");
        }
    }
}

#game-buttons.is-emcee {
    #btn-like { display: none; }
    #btn-chat {
        top: unset;
        left: unset;
        right: 65px;
        bottom: calc(40% - 120px + 5px);
    }
}
</style>
