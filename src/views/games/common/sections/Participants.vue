<template>
    <v-container id="participants" :class="currentTableData.code" fluid ma-0 pa-0>
        <div class="total-participants"><v-icon color="#ffffff" small>person</v-icon><span>{{ participants.length * PLAYERS_MULTIPLE }}</span></div>
        <v-layout row fill-height align-content-end justify-center>
            <v-flex v-for="(player, idx) in firstParticipants" :key="player.name + idx" xs2-10>
                <v-img :src="player.avatar.replace('NaNa', '9a') || `${ protocol }//og-333.s3.amazonaws.com/panda/assets/avatar/avtr_01.png`" width="38px" height="95%" position="center bottom" contain>
                    <div class="player-name">{{ player.name }}</div>
                    <div class="player-balance">{{ formatChip(player.balance) }}</div>
                </v-img>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import Events, { TableData, ParticipantData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Socket from "@/models/helper/socket";
import Utils from "@/models/helper/utils";

@Component({ components: {}})
export default class Participants extends Mixins(ModulesMixin)
{
    participants: { avatar: string, name: string, balance: number }[] = [];

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("gameInfo.currentTableInfo.players", {deep: true, immediate: true }) onPlayerUpdate(val: any) {
        this.serializeParticipants(val || []);
    }

    @Watch("userInfo.balance") onBalanceUpdate(val: any) {
        this.serializeParticipants(this.gameInfo.currentTableInfo.players || []);
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.eventBus.$on(Events.ON_FOCUS_INPUT, this.onFocusInput);
    }

// #[Events] ---------- + ---------- + ----------
    onFocusInput(isFocus: boolean, appHeight: number, isPortrait: boolean) {
        if (isFocus) {
            if (isPortrait) {
                Utils.addStyles("#participants", {
                    bottom: `${ (window.innerHeight - appHeight) + appHeight * 0.2 + 107.5 }px`,
                    height: `${ appHeight * 0.1 }px`
                });
                Utils.addStyles("#participants.roulette", { bottom: `${ (window.innerHeight - appHeight) + 32 }px` });
            }
            else Utils.addStyles("#participants", { bottom: `${ window.innerHeight - appHeight }px`, height: `${ appHeight * 0.1 }px` });
        }
        else Utils.addStyles("#participants", { bottom: "", height: "" });
    }

// #[Methods] ---------- + ---------- + ----------
    getUserAvatar(id: number) {
        return Utils.format(this.userInfo.avatarUrl, id);
    }

    formatChip(chip: number) {
        return Utils.formatNumber(chip);
    }

    serializeParticipants(players: ParticipantData[]) {
        this.participants = [];
        players.forEach((value: ParticipantData, index: number) => {
            // No contain current players
            // if (this.userInfo.id === value.id) return;
            this.participants.push({ avatar: value.imgname, balance: (this.userInfo.id === value.id) ? this.userInfo.balance : value.balance, name: value.nickname });
        });

        // Sort Descending by balance
        // this.participants.sort((a, b) => b.balance - a.balance);
    }

// #[Computed] ---------- + ---------- + ----------
    get lastParticipants() {
        return this.participants.slice(Math.max(this.participants.length - 5, 0));
    }
    get firstParticipants() {
        return this.participants.slice(0, 5);
    }
    get PLAYERS_MULTIPLE() {
        return Socket.PLAYERS_MULTIPLE;
    }
}
</script>

<style lang="scss">
#participants {
    overflow: visible;
    position: fixed;
    bottom: calc(20% + 107.5px);

    width: 87.5%;
    height: 40px;

    pointer-events: none;

    @include land-only {
        bottom: 0;
        left: 12.5%;
        width: 75%;
        height: 10%;

        @include ios-left("", "12.5%");
        @include ios-width("", "75%");
    }

    > .layout {
        margin-left: 14.3%;
        width: 85.7%;

        @include land-only {
            margin-left: calc(14.3% - 38px);
        }

        .v-image {
            overflow: visible;
            left: calc(50% - 19px);

            @include land-only {
                overflow: visible;
                left: 0;
            }

            .v-responsive__content {
                position: absolute;
                padding: 0 5px;
                bottom: 38px;
                left: -25%;
                width: 150%;

                border-radius: 5px;
                background-color: rgba(#000000, 0.6);
                font-size: 11.5px;
                line-height: 14px;

                text-shadow: 1px 1px #000000;
                white-space: nowrap;

                pointer-events: none;

                @include land-only {
                    left: 38px;
                    bottom: 3.5px;

                    text-align: left;
                }

                .player-name {
                    color: $c-light-yellow;
                    letter-spacing: -0.5px;

                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
    .total-participants {
        position: absolute;
        padding-left: 10px;
        bottom: 5px;
        width: 15%;

        text-align: left;
        font-weight: bold;
        text-shadow: 1px 1px #000000;
        white-space: nowrap;

        @include land-only {
            padding-left: 0;
            right: -60px;
        }

        .v-icon {
            transform: translateY(-1px);
        }
    }
}
#participants.roulette {
    display: none;

    @include port-only {
        bottom: 32px;
    }
}
</style>
