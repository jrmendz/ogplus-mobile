import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import { Howl } from "howler";

import { app } from "@/main";
import store from "@/models/store";
import Utils from "@/models/helper/utils";

@Module({ namespaced: true, dynamic: true, store, name: "mediaCtrl" })
export default class MediaCtrl extends VuexModule
{
    isBgmMute = false;
    isSoundMute = false;
    isVideoVisible = true;
    isLiveVideoMuted = false;

    isInited = false;

    soundArray: Howl[] = [];
    hadJustExit = false;

    /** In Roulette, the video has two sizes: normal, small */
    isVideoNormalSize = false;
    /** In Emcee, the video has two sizes: normal, small */
    isSmallEmcee = false;

    cameraIndex = 0;
    cameraLineIndex = 0;

    gameBgmIndex = 0;
    gameBgms: Howl[] = [];

    readonly spotFxSound = new Howl({
        src: require("@/assets/sounds/snd_spotFx.mp3"),
        preload: true,
        html5: true,
        xhrWithCredentials: false,
        sprite: {
            trigger: [0, 1],
            chip: [0, 1000],
            timer: [1300, 800],
            winchips: [3000, 2500],
            endRing: [5700, 2000],
            click: [8500, 1000],
        },
        volume: 0.65,
    });

    readonly soundNames = {
        baccarat:    ["betStart", "betEnd", "betSuccess", ...Utils.serialize("banker", 0, 9), "bankerWin", ...Utils.serialize("player", 0, 9), "playerWin", "tie"],
        dragonTiger: [...Utils.serialize("dragon", 1, 13), "dragonWin", ...Utils.serialize("tiger", 1, 13), "tigerWin"],
        moneywheel:  ["spinningW", "win1", "win2", "win5", "win10", "win20", "win40"],
        roulette:    ["black", "even", "odd", "red", ...Utils.serialize("point", 0, 36)],
        threecards:  ["dragonWin", "phoenixWin", "tie"],
        niuniu:      ["banker_5P" , ...Utils.serialize("banker_B" , 1, 9), "banker_BB", "banker_First", "banker_NB", 
                      "player1_5P", ...Utils.serialize("player1_B", 1, 9), "player1_BB", "player1_First", "player1_NB", 
                      "player2_5P", ...Utils.serialize("player2_B", 1, 9), "player2_BB", "player2_First", "player2_NB", 
                      "player3_5P", ...Utils.serialize("player3_B", 1, 9), "player3_BB", "player3_First", "player3_NB"],
    };

    soundsList: { [game: string]: { [name: string]: Howl } } = {};

// #[Getters] ---------- + ---------- + ----------
    get baccaratSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`baccarat${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get dragonTigerSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`dragonTiger${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get moneywheelSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`moneywheel${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get rouletteSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`roulette${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get threecardsSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`threecards${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get niuniuSound() {
        const isCN = (app.$i18n.locale === "cn");

        return {
            play: (name: string) => {
                if (!this.isSoundMute && !this.hadJustExit) {
                    const sound = this.soundsList[`niuniu${ isCN ? "_cn" : "" }`][name];
                          sound.play();
                    this.soundArray.push(sound);
                }
            },
        };
    }

    get cameraLine() {
        return ["sea", "china", "nea"][this.cameraLineIndex];
    }

// #[Mutations] ---------- + ---------- + ----------
    @Mutation initSounds() {
        if (this.isInited) return;
        this.isInited = true;

        this.spotFxSound.play("trigger");

        const bgmList: any[] = [
            require(`@/assets/sounds/bgm_game${ (Math.random() * 1) >> 0 }.mp3`),
        ];

        // Initialize the background sounds
        const randomBgm = () => {
            this.gameBgms.forEach(bgm => bgm.stop());
            this.gameBgmIndex = (Math.random() * this.gameBgms.length) >> 0;
        };

        bgmList.forEach(src => {
            this.gameBgms.push(new Howl({
                src,
                volume: 0,
                preload: true,
                html5: true,
                xhrWithCredentials: false,
        
                onend: randomBgm,
                mute: true,
            }));
        });

        randomBgm();

        // Initialize the sound effects
        Object.entries(this.soundNames).forEach(([game, names]) => {
            this.soundsList[game] = {};
            this.soundsList[`${ game }_cn`] = {};

            names.forEach(name => {
                this.soundsList[game][name] = new Howl({
                    src: require(`@/assets/sounds/${ game }/${ name }.mp3`),
                    preload: true,
                    autoplay: false,
                });
                this.soundsList[`${ game }_cn`][name] = new Howl({
                    src: require(`@/assets/sounds/${ game }_cn/${ name }.mp3`),
                    preload: true,
                    autoplay: false,
                });
            });
        });

    }

    /** Set the sound fx to turn on or mute */
    @Mutation toggleSound(toggle?: boolean) {
        this.isSoundMute = (toggle === undefined) ? !this.isSoundMute : !toggle;

        this.spotFxSound.mute(this.isSoundMute);
    }

    /** Set the background music to turn on or mute */
    @Mutation toggleBgm(toggle?: boolean) {
        this.isBgmMute = (toggle === undefined) ? !this.isBgmMute : !toggle;

        this.gameBgms.forEach(bgm => bgm.mute(this.isBgmMute));
    }

    @Mutation randomBgm() {
        if (this.gameBgms.length === 0) return;
        
        this.gameBgms.forEach(bgm => bgm.stop());

        this.gameBgmIndex = (Math.random() * this.gameBgms.length) >> 0;
        this.gameBgms[this.gameBgmIndex].play();
    }

    @Mutation toggleVideo() {
        this.isVideoVisible = !this.isVideoVisible;
    }
    @Mutation toggleVideoSnd(toggle?: boolean) {
        this.isLiveVideoMuted = (toggle === undefined) ? !this.isLiveVideoMuted : !toggle;
    }
    @Mutation toggleVideoSize(isNormalSize: boolean) {
        this.isVideoNormalSize = (isNormalSize === undefined) ? !this.isVideoNormalSize : isNormalSize;
    }

    @Mutation switchCameraLine() {
        this.cameraLineIndex++;
        this.cameraLineIndex %= 3;
    }

    @Mutation stopIngameSound() {
        this.hadJustExit = true;
        this.soundArray.forEach(snd => snd.stop());

        setTimeout(() => {
            this.hadJustExit = false;
            this.soundArray = [];
        }, 3500);
    }

    @Mutation toggleSmallEmcee(toggle?: boolean) {
        this.isSmallEmcee = (toggle === undefined) ? !this.isSmallEmcee : !toggle;
    }

// #[Actions] ---------- + ---------- + ----------
    @Action toggleAllSounds(toggle?: boolean) {
        this.context.commit("toggleSound", toggle);
        this.context.commit("toggleBgm", toggle);
        this.context.commit("toggleVideoSnd", toggle);
    }

    @Action stopIngameSnd() {
        this.context.commit("stopIngameSound");
    }
}
