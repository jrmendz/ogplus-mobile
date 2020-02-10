<template>
    <v-container id="login" fluid fill-height justify-center ma-0 pa-0 @keyup.enter="onLogin()">
        <v-container id="copyright" fluid justify-center ma-0 pa-0>
            <span>{{ siteState.license }}</span>
            <v-img :src="require('@/assets/images/img_pagcor.gif')" height="22px" width="22px" />
            <span>{{ siteState.copyright }}</span>
        </v-container>
        <v-container id="form" fluid justify-center ma-0 pa-0>
            <v-img id="img-girls" :src="require('@/assets/images/img_logoPlus.png')" />
            <v-container id="form-content" fluid justify-center ma-0 pa-0>
                <v-img id="img-form-top" :src="require('@/assets/images/login/img_formTop.png')" />
                <v-container id="form-fields" fluid justify-center ma-0 px-0 py-1>
                    <!-- <v-img id="img-og-logo" :src="require('@/assets/images/img_logoPlus.png')" max-height="30%" contain /> -->
                    <v-text-field maxlength="30" class="text-field" v-model="username" :label="$t('loginForm.username')" color="#d28213" prepend-inner-icon="people" clearable outline />
                    <v-text-field maxlength="30" class="text-field" v-model="password" :label="$t('loginForm.password')" type="password" color="#d28213" prepend-inner-icon="lock" clearable outline />
                    <v-btn class="button" color="#975e0e" round @click="onLogin()">{{ $t("loginForm.login") }}</v-btn>
                </v-container>
                <v-img id="img-form-bottom" :src="require('@/assets/images/login/img_formBottom.png')" />
            </v-container>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";

import ModulesMixin from "@/models/mixins/modulesMixin";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    username: string = "";
    password: string = "";

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Events] ---------- + ---------- + ----------
    onLogin() {
        this.userInfo.doLogin({ username: this.username, password: this.password });
    }

// #[Methods] ---------- + ---------- + ----------


// #[Computed] ---------- + ---------- + ----------


}
</script>

<style lang="scss">
#login {
    background: url("../../assets/images/login/img_loginBg.jpg") center no-repeat;
    background-size: cover;

    #form {
        position: absolute;
        width: 300px;
        transform: translateY(7.5%);

        #img-girls {
            transform: scale(0.85);
        }
        #form-content {
            transform: translateY(-20px);

            #form-fields {
                height: 180px;
                background-color: rgba(#000000, 0.8);

                .text-field {
                    @include text-field-outline(#975e0e, #975e0e, 0.9);
                }
                .button {
                    div.v-btn__content {
                        font-weight: bold;
                        font-size: 16px;
                    }
                }
            }
        }

        @include xs-land-only {
            width: 600px;

            #img-girls {
                width: 300px;

                transform: scale(0.85) translate(-20px, -20px);
            }
            #form-content {
                position: absolute;
                top: 145px;
                right: 20px;
                width: 300px;

                transform: translateY(-180px);
            }
        }
    }
    #copyright {
        position: fixed;
        bottom: 10px;

        color: gray;
        font-size: 11px;

        .v-image {
            margin: 0 2px;
            display: inline-block;
            vertical-align: middle;
        }
    }
}
</style>
