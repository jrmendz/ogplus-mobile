<template>
    <SettingPopup id="user-setting" :event="event" hasTitle>
        <template v-slot:title>{{ $t("profile.title") }}</template>
        <v-flex xs12 sm6>
            <v-text-field class="text-field" v-model="userNickname" :value="userNickname" :label="$t('profile.nickname')" color="#d28213" maxlength="10" prepend-inner-icon="people" clearable outline @focus="$root.$children[0].onFocusInput(true)" @blur="$root.$children[0].onFocusInput(false)" />
        </v-flex>
        <v-layout class="experience" xs12 sm6>
            <v-flex xs3>
                <v-img :src="userAvatar" height="60px" contain />
            </v-flex>
            <v-flex xs9>
                <div class="account-info"> <span class="label">Account: </span> <span> OG_Player_88 </span></div>
                <div class="experience-bar">
                    <v-progress-linear v-model="experience" color="#45955F" height="12" reactive>
                        <strong> 888/1000 </strong>
                    </v-progress-linear>
                </div>
                <div class="level"> <span class="label"> Level: </span> <div class="lvl-container"> 88 </div> </div>
            </v-flex>
        </v-layout>
        <v-flex class="setting-avatar" xs12>
            <v-icon>photo</v-icon>
            {{ $t("profile.avatar") }}
        </v-flex>
        <template v-for="i in 19">
            <v-flex v-if="i >= 9" :key="i" :class="['setting-avatar-img', (i === userInfo.avatarId ? 'select' : null)]" xs3 sm1-10>
                <v-img :src="getAvatarUrl(i)" max-height="54px" contain @click="userInfo.setAvatarId(i)" />
            </v-flex>
        </template>
    </SettingPopup>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";

import Events from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Utils from "@/models/helper/utils";

@Component({ components: {
    SettingPopup: () => import("@/views/settings/slots/SettingPopup.vue"),
} })
export default class extends Mixins(ModulesMixin)
{
    readonly event = Events.ON_USER_SETTING;

    checker = 0;

    experience = 88.8;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("userInfo.nickname") onNicknameChange(val: string) {
        if (++this.checker === 1) return false;

        this.dUpdateUser({ nickname: val });
    }

    @Watch("userInfo.avatarId") onAvatarChange(val: number) {
        if (++this.checker === 1) return false;

        const url = this.getAvatarUrl(val);
        this.dUpdateUser({ imgname: url, imgname_mobile: url });
    }

// #[Life Cycle] ---------- + ---------- + ----------
    

// #[Events] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    getAvatarUrl(id: number) {
        return Utils.format(this.userInfo.avatarUrl, id);
    }

    getStringWithNumCodes(str: string, numCodes: number) {
        for (let i = 0, len = 0, max = str.length; i < max; ++i) {
            let s = str.charCodeAt(i);
            while (s > 0) {
                s = s >> 8;
                if (++len >= numCodes) {
                    return str.substr(0, i + 1);
                }
            }
        }
        return str;
    }

// #[Computed] ---------- + ---------- + ----------
    get userNickname() {
        return this.userInfo.nickname;
    }

    set userNickname(name: string) {
        if (name && name !== this.userNickname) {
            this.userInfo.setNickname(this.getStringWithNumCodes(name, 10));
        }
    }

    /** Add delay to function so it will not execute repeteadly when called */
    get dUpdateUser() {
        return Utils.debounce(this.userInfo.updateUser, 500);
    }
    
    get userAvatar() {
        return Utils.format(this.userInfo.avatarUrl, this.userInfo.avatarId);
    }

    get userId() {
        return this.userInfo.id;
    }
}
</script>

<style lang="scss">
#user-setting {
    .setting-avatar {
        margin: 13px 13px;

        font-size: 18px;
        font-weight: bold;
        text-align: left;

        .v-icon {
            margin-right: 5px;
        }
    }
    .setting-avatar-img {
        margin: 0 0 10px 0;

        &.select {
            background-color: rgba(#ffffff, 0.5);
            border-radius: 5px;
        }
    }
    .text-field {
        @include text-field-outline(#ffffff, transparent);

        .v-input__slot {
            border-bottom: 2px solid #ffffff;
        }
    }
    .experience {
        margin-top: 10px;
        text-align: left;
        font-size: 14px;
        .label {
            color: #daa520
        }
        .v-progress-linear {
            border-radius: 10px;
            margin: 5px 0;
            line-height: 1;
            text-align: center;
            font-size: 12px;
        }
        .lvl-container {
            background-color: #daa520;
            border-radius: 10px;
            display: inline-block;
            width: 30px;
            text-align: center;
        }
    }
}
</style>
