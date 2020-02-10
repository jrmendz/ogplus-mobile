<template>
    <v-container v-if="isOpening" id="chat-box" :class="[currentTableData.code, tableState.isEmcee && 'is-emcee']" fluid fill-height>
        <v-container fluid class="close-emoji" @click="switchEmojiPicker(false)"></v-container>
        <v-timeline dense light>
            <v-timeline-item v-for="(data, i) in lastDialog" :key="i" color="#000000" class="pt-1 pb-1" small>
                <template v-slot:icon>
                    <v-avatar size="24px"><img :src="data.avatar.replace('NaNa', '9a') || `${ protocol }//og-333.s3.amazonaws.com/panda/assets/avatar/avtr_01.png`" contain></v-avatar>
                </template>
                <v-layout class="timeline-content">
                    <span><span>{{ data.nickname + ":" }}</span><span>{{ data.message }}</span></span>
                </v-layout>
            </v-timeline-item>
        </v-timeline>
        <v-text-field class="input" label="input" :placeholder="$t('chat.typing')" v-model="message" solo light @click="onClick()" @keydown.enter="sendMessage()" @focus="$root.$children[0].onFocusInput(true)" @blur="$root.$children[0].onFocusInput(false)">
            <template v-slot:append>
                <v-img :src="require('@/assets/images/settings/img_send.png')" width="20px" height="20px" contain @click.stop="sendMessage()" />
                <!-- <v-img :src="require('@/assets/images/settings/img_emoji.png')" class="ml-2" width="20px" height="20px" contain @click.stop="switchEmojiPicker()" /> -->
            </template>
        </v-text-field>
        <!-- <EmojiPicker :class="['emoji-picker', isVisibleEmojiPicker && 'open']" :emojisByRow="10" :pack="emojiPack" :labelSearch="$t('chat.search')" @select="selectEmoji" /> -->
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import emojiPackData from "v-emoji-picker/data/emojis.json";

import Events, { ChatData, TableData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    EmojiPicker: () => import("v-emoji-picker"),
} })
export default class ChatBox extends Mixins(ModulesMixin)
{
    isOpening = false;

    isVisibleEmojiPicker = false;
    emojiPack = emojiPackData;
    chatList!: any;

    message = "";

    /** Delay chat in miliseconds */
    maxChatDelay = 0;
    lastMessageTime = new Date();

//# [Props] ---------- + ---------- + ----------
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_CHAT_BOX, this.onOpen);
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

    beforeDestroy() {
        this.eventBus.$off(Events.ON_CHAT_BOX, this.onOpen);
    }

// #[Events] ---------- + ---------- + ----------
    onOpen(isOpening?: boolean) {
        if (isOpening === undefined) this.isOpening = !this.isOpening;
        else this.isOpening = isOpening;
    }
    
    onClick() {
        this.siteState.toggleFullscreen(true);
    }

    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                if (this.tableState.isEmcee)
                    Utils.addStyles("#chat-box", { bottom: "10px" });
                else {
                    Utils.addStyles("#chat-box", { height: `${ appHeight * 0.375 - 72 }px` });
                    Utils.addStyles("#chat-box.roulette", { height: `${ appHeight * 0.325 - 24 }px` });
                }
            }
            else {
                Utils.addStyles("#chat-box", { height: `${ appHeight * 0.49 - 75 }px` });
            }
        }
        else Utils.addStyles("#chat-box", { height: "", bottom: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    selectEmoji({ emoji }: { emoji: string }) {
        this.message += emoji;
    }

    switchEmojiPicker(visible: boolean) {
        if (document.activeElement) (document.activeElement as any).blur();

        if (visible !== undefined) this.isVisibleEmojiPicker = visible;
        else this.isVisibleEmojiPicker = !this.isVisibleEmojiPicker;
    }

    sendMessage() {
        if (!this.userInfo.canChat) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.banChat"));
            return;
        }
        if (this.message.trim().length <= 0) return;

        // Chat delay codes
        const diffTime = new Date().getTime() - this.lastMessageTime.getTime();
        if (diffTime <= this.maxChatDelay) {
            this.eventBus.$emit(Events.ON_BET_MSG_TOAST, this.$t("betToast.delayChat", [Math.ceil((this.maxChatDelay - diffTime) / 1000)]));
            return;
        }

        const trimmedString = this.message.substring(0, 22);

        const sentData = this.socialInfo.sendChatMessage({ tableNumber: this.tableNumber, message: this.message.substring(0, 22) });
        if (sentData) this.message = "";
        
        if (document.activeElement) (document.activeElement as any).blur();

        this.lastMessageTime = new Date();
    }

// #[Computed] ---------- + ---------- + ----------
    get lastDialog() {
        const tableChatMessages = this.socialInfo.chatMessagesList.filter(msg => {
            return msg.table_number === this.tableNumber;
        });
        if (this.platform.orientation.isPortrait)
             return tableChatMessages.slice(Math.max(tableChatMessages.length - 5, 0));
        else return tableChatMessages.slice(Math.max(tableChatMessages.length - 4, 0));
    }

    get userAvatar() {
        return Utils.format(this.userInfo.avatarUrl, this.userInfo.avatarId);
    }

    get protocol() {
        return location.protocol;
    }
}
</script>

<style lang="scss">
#chat-box {
    position: fixed;
    top: 72px;
    height: calc(37.5% - 72px);
    overflow: scroll;

    @include land-only {
        z-index: 1;
        top: 45px;
        width: 40%;
        height: calc(59% - 75px);

        @include ios-left("", "70px");
    }

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 50%;

        background-image: linear-gradient(to bottom, rgba(#000000, 0) 0%, rgba(#000000, 0.2) 25%, rgba(#000000, 0.4) 100%);
        pointer-events: none;

        @include land-only {
            left: -65px;
            top: -24px;
            width: calc(100% + 60px);
            height: 100%;

            background-image: radial-gradient(circle farthest-side at left top, rgba(#000000, 0.8) 0%, rgba(#000000, 0.2) 80%, rgba(#000000, 0) 100%);
        }
    }

    .v-timeline {
        position: absolute;
        bottom: 30px;

        transform: scale(0.9) translateX(-30px);
        width: 100%;

        pointer-events: none;

        &::before {
            transform: translateY(25px);
            height: 80%;
            // background-color: rgba($c-main, 0.6);
        }

        .v-timeline-item__body {
            max-width: calc(100% - 38px);
        }
        .timeline-content {
            color: #ffffff;
            text-align: left;

            span {
                word-wrap: break-word;
                overflow-wrap: break-word;
                width: 100%;

                span:first-of-type {
                    padding-right: 5px;
                    color: $c-main;
                    font-weight: bold;
                }
            }
        }
    }
    .close-emoji {
        position: fixed;
        top: 0;
        left: 0;
    }
    .input {
        position: absolute;
        left: calc(10px + 35px);
        bottom: 0;
        width: calc(100% - 20px - 35px);

        @include land-only {
            left:0;
        }

        .v-input__control {
            min-height: 16px;

            .v-input__slot {
                background-color: rgba(#000000, 0.4);
            }
            .v-text-field__slot input {
                padding: 6px 0 4px 0;

                color: rgba(#ffffff, 0.87);
                text-align: left;
                font-size: 14px;
                line-height: 14px;

                &::placeholder {
                    color: rgba(#ffffff, 0.6);
                }
            }
            .v-text-field__details {
                display: none;
            }
            .v-input__append-inner {
                opacity: 0.6;
            }
        }
    }

    .emoji-picker {
        position: absolute;
        right: 10px;
        bottom: 40px;
        width: 35%;
        height: 0;
        opacity: 0;

        transition: all 0.5s ease-in-out;

        &.open {
            width: calc(100% - 20px);
            height: calc(100% - 95px);
            opacity: 1;
        }

        #InputSearch {
            .container-search input[type="text"] {
                padding: 4px !important;
            }
        }

        @include land-only {
            position: fixed;
            top: 30px;
            bottom: unset;
            left: calc(40% + 10px);

            width: 0;
            height: calc(65% - 100px);

            &.open {
                width: calc(60% - 60px);
                height: calc(65% - 100px);
            }
            #InputSearch {
                display: none;
            }
        }
        @include xxs-only {
            #InputSearch {
                display: none;
            }
        }
    }
}

#chat-box.roulette {
    z-index: 1;

    @include port-only {
        width: calc(100% - 40px);
        height: calc(32.5% - 24px);

        &::before {
            top: 0;
            height: 100%;
            background-image: linear-gradient(to left, rgba(#000000, 0) 0%, rgba(#000000, 0.2) 25%, rgba(#000000, 0.4) 100%);
        }
    }
}

#chat-box.is-emcee {
    @include port-only {
        top: unset;
        bottom: calc(40% - 120px + 40px);
        width: calc(100% - 50px);

        .input {
            left: 10px;
            width: calc(100% - 20px);
        }

        &::before {
            background-image: none;
        }
    }
}
</style>
