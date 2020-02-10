<template>
    <v-container id="game-menu" fluid fluid-ios ma-0 pa-0>
        <v-tabs v-model="gameSelection" slider-color="slider-style" height="56px" centered grow show-arrows @change="onTabChange()">
            <v-tab v-for="(game, id) in gameInfo.gameList" :key="game.name + id" :class="game.enabled || 'disabled'" :to="`/lobby/${ game.name }`">
                <v-img :src="game.icon" height="40px" width="40px" contain>
                    <div v-if="!game.enabled">{{ $t(`comingSoon`) }}</div>
                </v-img>
                <div v-if="game.enabled" class="game-title">
                    <template v-for="name in $t(`gameMenu2.${ game.name }`).split('{n}')">
                        <div :key="name" :class="['game-name', game.icon ? '' : 'no-icon']">{{ name }}</div>
                    </template>
                </div>
            </v-tab>
        </v-tabs>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class GameMenu extends Mixins(ModulesMixin)
{

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------
    onTabChange(): void {
        // console.log(`onTabChange: ${ this.gameInfo.gameSelectionId } (${ this.gameSelection })`);
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------
    get gameSelection() {
        return `/lobby/${ this.gameInfo.gameList[this.gameInfo.gameSelectionId].name }`;
    }
    
    set gameSelection(value: string) {
        const id = this.gameInfo.gameList.findIndex(el => el.name === value.split("/")[2]);
        this.gameInfo.setGameSelectionId(id);
    }
}
</script>

<style lang="scss">
#game-menu {
    position: fixed;
    bottom: 0;
    height: 56px;

    background-color: $c-black;
    background-image: linear-gradient(90deg, #233d60 0%, #14253b 100%);
    box-shadow: 0 -5px 10px rgba(#000000, 0.5);
    border-radius: 15px 15px 0 0;

    .v-tabs__div.disabled {
        pointer-events: none;
    }

    .v-tabs .v-tabs__bar {
        background-color: transparent;

        .v-tabs__slider {
            width: 91%;
            height: 52px;
            margin: 0px;
            background: linear-gradient(163deg, #233d60 0%, #09101b 74%);

            border: 2px solid $c-main;
            border-radius: 12.5px;
            box-sizing: border-box;

            @include land-only {
                margin: 2px 2px 2px 2px;
            }
        }

        .v-tabs__wrapper--show-arrows {
            margin-left: 20px;
            margin-right: 20px;
        }
        .v-tabs__icon {
            width: 16px;
            color: rgba(#ffffff, 0.8);
        }
    }

    .v-image {
        flex: 0.25 0 auto;
        overflow: visible;

        > .v-image__image {
            background-size: 70% 70%;
            background-position: top center !important;
        }
        > .v-responsive__content div {
            position: absolute;
            padding: 3px 0;
            left: -25%;
            bottom: -5px;
            width: 150%;

            color: #ffffff;
            font-size: 12px;
            line-height: 12px;

            border-radius: 3px;
            background: rgba(#ff0000, 0.8);

            @include land-only {
                left: -55%;
                width: 210%;
            }
        }
    }

    .game-title {
        position: relative;
    }
    .game-name {
        color: #ffffff;
        font-size: 11px;
        letter-spacing: -0.5px;

        position: absolute;
        width: 75px;
        left: -58px;
        line-height: 10px;
        bottom: -22px;

        &.no-icon {
            font-size: 12px;
            line-height: 12px;

            &:nth-of-type(1) {
                bottom: 0;
            }
            &:nth-of-type(2) {
                bottom: -15px;
            }
        }

        @include land-only {
            left: -59px;
        }
    }
}
</style>
