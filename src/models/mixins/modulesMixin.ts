/* eslint-disable */
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";

import GameInfo    from "../modules/gameInfo";
import HistoryInfo from "../modules/historyInfo";
import MediaCtrl   from "../modules/mediaCtrl";
import SiteState   from "../modules/siteState";
import SocialInfo  from "../modules/socialInfo";
import TableState  from "../modules/tableState";
import UserInfo    from "../modules/userInfo";

@Component({ components: {}})
export default class ModulesMixin extends Vue
{

// #[Props] ---------- + ---------- + ----------
    

// #[Computed: Modules] ---------- + ---------- + ----------
    get gameInfo() {
        return getModule(GameInfo, this.$store);
    }

    get historyInfo() {
        return getModule(HistoryInfo, this.$store);
    }

    get mediaCtrl() {
        return getModule(MediaCtrl, this.$store);
    }

    get siteState() {
        return getModule(SiteState, this.$store);
    }

    get socialInfo() {
        return getModule(SocialInfo, this.$store);
    }

    get userInfo() {
        return getModule(UserInfo, this.$store);
    }

    get tableState() {
        return getModule(TableState, this.$store);
    }

// #[Computed: State] ---------- + ---------- + ----------
    get eventBus(): Vue {
        return this.siteState.eventBus;
    }
    get platform() {
        return this.siteState.platform;
    }

    get currentTableData() {
        return this.gameInfo.currentTableInfo.tableData!;
    }

// #[Watch] ---------- + ---------- + ----------


// #[Life Cycle] ---------- + ---------- + ----------


// #[Methods] ---------- + ---------- + ----------
    

}
