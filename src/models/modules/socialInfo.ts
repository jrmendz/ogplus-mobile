
import { Action, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import Cookies from "vue-cookies";

import { app } from "@/main";
import { FollowUserData, FollowDealerData, RankingData, ChatData } from "@/models/helper/types";
import Axios from "@/models/helper/axiosConfig";
import Events from "@/models/helper/types";
import Socket from "@/models/helper/socket";
import store, { IStore } from "@/models/store";

@Module({ namespaced: true, dynamic: true, store, name: "socialInfo" })
export default class SocialInfo extends VuexModule
{
    chatMessagesList: ChatData[] = [];
    rankingList: RankingData[] = [];
    followedUsersList: FollowUserData[] = [];
    followedDealersList: FollowDealerData[] = [];

// #[Getters] ---------- + ---------- + ----------
    get hasFollowedDealer() {
        return ({ dealersCode }: { dealersCode: number }) => {
            if (!dealersCode) return false;
            return this.followedDealersList.some(item => item.dealersCode === dealersCode);
        };
    }

// #[Mutations] ---------- + ---------- + ----------
    @Mutation setFollowedUsers(data: any[]) {
        const newList: FollowUserData[] = [];

        for (const item of data) {
            newList.push({
                followers: item.followers,
                online: !!item.logged,    // Translate 1/0 to true/false
                remove: true,
                name: item.nickname,
                table: item.table_location,
                id: item.followedUserId,
            });
        }
        this.followedUsersList = newList;
    }

    @Mutation setRankingPlayers(data: any) {
        const newList: RankingData[] = [];

        for (const item of data) {
            newList.push({
                add: !item.isFollowed,    // converts value into boolean
                name: item.nickname,
                online: !!item.logged,
                amount: item.win_loss,
                id: item.followedUserId,
            });
        }
        this.rankingList = newList;
    }

    @Mutation setFollowedDealers(data: any) {
        const newList: FollowDealerData[] = [];

        for (const item of data) {
            newList.push({
                followers: item.followers,
                online: !item.logged,    // Translate 1/0 to true/false
                remove: true,
                name: item.nickname,
                table: item.table_location || "Offline",
                dealersCode: item.dealerscode,
            });
        }
        this.followedDealersList = newList;
    }

    @Mutation newChatMessage(data: ChatData) {
        this.chatMessagesList.push(data);
    }

// #[Actions] ---------- + ---------- + ----------
    @Action async getFollowedDealers() {
        return Axios.get("/follow/dealerlist", { params: { token: Cookies.get("panda_token") }})
                    .then(res => {
                        const followedDealers = res.data.data;
                        this.context.commit("setFollowedDealers", followedDealers);
                    })
                    .catch(e => console.error(e));
    }
    @Action async getFollowedPlayers() {
        return Axios.get("/follow/userlist", { params: { token: Cookies.get("panda_token") }})
                    .then(res => {
                        const followedUsers = res.data.data;
                        this.context.commit("setFollowedUsers", followedUsers);
                    })
                    .catch(e => console.error(e));
    }

    @Action async getPlayerRanking() {
        return Axios.get("/ranking/rankinglist", { params: { token: Cookies.get("panda_token") }})
                    .then(res => {
                        const rankingPlayers = res.data.data;
                        this.context.commit("setRankingPlayers", rankingPlayers);
                    })
                    .catch(e => console.error(e));
}
    @Action async followUser({ userId }: { userId: number }) {
        return Socket.post("/follow/user", { token: Cookies.get("panda_token"), method: "follow", followedUserId: userId })
                     .catch(e => console.error(e));
    }

    @Action async unfollowUser({ userId }: { userId: number }) {
        return Socket.post("/follow/user", { token: Cookies.get("panda_token"), method: "unfollow", followedUserId: userId })
                     .then(res => this.context.dispatch("getFollowedPlayers"))
                     .catch(e => console.error(e));
    }

    @Action async followDealer({ dealersCode }: { dealersCode: number }) {
        if (!dealersCode) return;

        // Check if dealers list is pristine
        if (!this.followedDealersList.length) this.context.dispatch("getFollowedDealers");

        // Check if dealer is already followed
        let isFollowed = false;
        this.followedDealersList.forEach(item => {
            if (item.dealersCode === dealersCode) isFollowed = true;
        });

        const rootState = this.context.rootState as IStore;
        if (isFollowed)
            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.dealer.hasFollowed"));
        else {
            return Socket.post("/follow/dealer", { token: Cookies.get("panda_token"), method: "follow", dealerscode: dealersCode })
                         .then(res => {
                            // Added notification on following a dealer
                            this.context.dispatch("getFollowedDealers");
                            rootState.siteState.eventBus.$emit(Events.ON_BET_MSG_TOAST, app.$t("betToast.dealer.followed"));
                         })
                         .catch(e => console.error(e));
        }
    }

    @Action async unfollowDealer({ dealersCode }: { dealersCode: number }) {
        return Socket.post("/follow/dealer", { token: Cookies.get("panda_token"), method: "unfollow", dealerscode: dealersCode })
                     .then(res => this.context.dispatch("getFollowedDealers"))
                     .catch(e => console.error(e));
    }

    @Action async joinChatTable({ tableNumber }: { tableNumber: string }) {
        return Socket.post("/user/joinChatTable", { token: Cookies.get("panda_token"), table_number: tableNumber })
                     .catch(e => console.error(e));
    }

    @Action async sendChatMessage({ tableNumber, message }: { tableNumber: string, message: string }) {
        return Socket.post("/user/chatMessage", { token: Cookies.get("panda_token"), table_number: tableNumber, message })
                     .then(res => {
                        // Mutate Object
                        delete res.created_at;
                        delete res.updated_at;
                        delete res.cancelled;

                        return res;
                     })
                     .catch(e => console.error(e));
    }
}
