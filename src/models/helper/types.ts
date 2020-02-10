export default class Events
{
    /** 
     * @event # Open Loading screen
     * @param visible (boolean)
     * @param msg (string = "")
     * @param opacity (number = 1)
     */
    static readonly ON_OPEN_LOADING: string = "openLoading";

    /** @event # The language was changed */
    static readonly ON_LANG_CHANGED: string = "onLangChanged";

    /**
     * @event # Open or hide the user setting modal
     * @param isOpening (boolean)
     */
    static readonly ON_USER_SETTING: string = "onUserSetting";

    /**
     * @event # Open or hide the game setting modal
     * @param isOpening (boolean)
     */
    static readonly ON_GAME_SETTING: string = "onGameSetting";

    /**
     * @event # Open or hide the language setting modal
     * @param isOpening (boolean)
     */
    static readonly ON_LANG_SETTING: string = "onLangSetting";

    /**
     * @event # Open or hide the history modal
     * @param isOpening (boolean)
     */
    static readonly ON_HISTORY: string = "onHistory";

    /**
     * @event # Open or hide the social modal
     * @param isOpening (boolean)
     */
    static readonly ON_SOCIAL: string = "onSocial";

    /**
     * @event # Event: Open or hide the sidebar drawer
     * @param isOpening (boolean)
     */
    static readonly ON_SIDEBAR: string = "onSidebar";

    /**
     * @event # Open or hide the chip amounts modal to edit the amount of chips
     * @param isOpening (boolean)
     */
    static readonly ON_CHIP_AMOUNTS: string = "onChipAmounts";

    /**
     * @event # Open or hide the game chat modal
     * @param isOpening (boolean)
     */
    static readonly ON_CHAT_BOX: string = "onChatBox";

    /** @event # The chip amounts were changed */
    static readonly ON_CHIP_AMOUNTS_CHANGED: string = "onChipAmountsChanged";

    /**
     * @event # Show the toast and its message in the table
     * @param msg (string)
     * @param color (string = "#000000")
     * @param duration (number = 2000)
     */
    static readonly ON_BET_MSG_TOAST: string = "onBetMsgToast";

    /**
     * @event # Show the toast and its message in the table
     * @param msg (string)
     * @param tableNumber (string)
     */
    static readonly ON_BET_MSG_SIDEBAR: string = "onBetMsgSidebar";

    /**
     * @event # Show the snack bar and its message
     * @param visible (boolean)
     * @param msg (string = "")
     * @param duration (number = 6000)
     * @param color (string = "rgba(226, 71, 53, 0.95)")
     */
    static readonly ON_MSG_SNACKBAR: string = "onMsgSnackbar";

    /** @event # The bet were confirmed */
    static readonly ON_BET_CONFIRMED: string = "onBetConfirmed";

    /**
     * @event # The text input is focused
     * @param isFocus (boolean)
     * @param appHeight (number)
     * @param isPortrait (boolean)
     */
    static readonly ON_FOCUS_INPUT: string = "onFocusInput";

    /**
     * @event # Bet on the item of the bet area
     * @param key (string)
     * @param amount (?number)
     */
    static readonly ON_BET_ITEM_SUB: string = "onBetItemSub";

    /** 
     * @event # Flip the specific card
     * @param type (string)
     * @param id (number)
     * @param card (any)
     * @param userInitiated (boolean = false)
     */
    static readonly ON_FLIP_CARD: string = "onFlipCard";

    /**
     * @event # Redraw the card from backend data
     * @param cards ({ [key: string]: any })
     */
    static readonly ON_DRAW_CARDS: string = "onDrawCards";

    /** @event # Cancel the bet */
    static readonly ON_CANCEL_BET: string = "onCancelBet";

    /** @event # Repeat the bet */
    static readonly ON_REPEAT_BETS: string = "onRepeatBet";

    /** @event # Change to another table through the Sidebar */
    static readonly ON_TABLE_CHANGED: string = "onTableChanged";
}

// #[Types: Roadmap] ---------- + ---------- + ----------
export type RoadmapData = BaccaratData | DragonTigerData | MoneywheelData | RouletteData | ThreeCardsData | NiuniuData;

/** The roadmap data for Baccarat game */
export type BaccaratData = {
    roadMap: {
        count: {
            player: number, banker: number, tie: number
        },
        beadRoad  : { result: number, pair: [boolean, boolean], super_six: boolean }[],
        bigRoad   : { place: [number, number], result: number, tie: number, pair: [boolean, boolean] }[],
        bigEyeRoad: { place: [number, number], result: number }[],
        smallRoad : { place: [number, number], result: number }[],
        roachRoad : { place: [number, number], result: number }[],
        bead      : { result: string, player: string, banker: string, shoeGame: string, videoUrl: string }[],
    },
    prediction: {
        player: {
            bigRoad   : { place: [number, number] },
            bigEyeRoad: { place: [number, number], result: number },
            smallRoad : { place: [number, number], result: number },
            roachRoad : { place: [number, number], result: number },
        },
        banker: {
            bigRoad   : { place: [number, number] },
            bigEyeRoad: { place: [number, number], result: number },
            smallRoad : { place: [number, number], result: number },
            roachRoad : { place: [number, number], result: number },
        },
    },
};

/** The roadmap data for DragonTiger game */
export type DragonTigerData = {
    roadMap: {
        count: {
            dragon: number, tiger: number, tie: number
        },
        beadRoad  : { result: number }[],
        bigRoad   : { place: [number, number], result: number, tie: number }[],
        bigEyeRoad: { place: [number, number], result: number }[],
        smallRoad : { place: [number, number], result: number }[],
        roachRoad : { place: [number, number], result: number }[],
        bead      : { result: string, dragon: string, tiger: string, shoeGame: string, videoUrl: string }[],
    },
    prediction: {
        dragon: {
            bigRoad   : { place: [number, number] },
            bigEyeRoad: { place: [number, number], result: number },
            smallRoad : { place: [number, number], result: number },
            roachRoad : { place: [number, number], result: number },
        },
        tiger: {
            bigRoad   : { place: [number, number] },
            bigEyeRoad: { place: [number, number], result: number },
            smallRoad : { place: [number, number], result: number },
            roachRoad : { place: [number, number], result: number },
        },
    },
};

/** The roadmap data for Moneywheel game */
export type MoneywheelData = {
    roadMap: {
        count: {
            x1: number, x2: number, x5: number, x10: number, x20: number, x40: number
        },
        wheelies: number[],
        road    : { result: string, values: string[], shoeGame: string, videoUrl: string }[],
    }
};

/** The roadmap data for Roulette game */
export type RouletteData = {
    roadMap: {
        count: { [key: string]: number },
        rollRoad: number[],
        road    : { result: string, values: string[], shoeGame: string, videoUrl: string }[],
    }
};

/** The roadmap data for ThreeCards game */
export type ThreeCardsData = {
    roadMap: {
        count: {
            dragon: number, phoenix: number, tie: number, dragonStar: number, phoenixStar: number
        },
        beadRoad  : number[],
        bead      : { result: string, dragon: string, phoenix: string, shoeGame: string, videoUrl: string }[],
    },
};

/** The roadmap data for Niuniu game */
export type NiuniuData = {
    roadMap: {
        count: {
            banker: number, player1: number, player2: number, player3: number
        },
        beadRoad  : string[][],
        bead      : { result: string, banker: string, player1: string, player2: string, player3: string, shoeGame: string, videoUrl: string }[],
    },
};

// #[Types: Backend] ---------- + ---------- + ----------
// # All data below will be serialized for backend usage
export type Config = null | {
    minBetLimit: number,
    maxBetLimit: number,
    minBetToChat: number,
    otherLimit: object,
    ads: {
        default: string[],
        lobby: string[],
    },
    music: {
        useMainAsBGMusic: boolean,
        main: string,
        baccarat: string,
        dragontiger: string,
        moneywheel: string,
        roulette: string,
        niuniu: string,
        threeCards: string,
    },
    liveTables: string[],
    event: {
        active: boolean,
    },
    dealer: {
        custom: string,
        imageFileType: string,
        defaultStudio: string,
        defaultImageURL: string,
        url: string,
    },
    maxDigitValue: number,
};

export type TableData = {
    id: number,
    name: string,
    code: GameTypes,
    subcode: null | "bidding" | "normal",
    dealer: { name: string, imagePrestige: string, rid: number|string },
    totalResult: { [key: string]: number },
    game: {
        timer: number,
        cards: { [key: string]: { [card: string]: string | { value: number } | null }},
        result: string,
        [key: string]: any,
    },
    gameSet: number,
    maxtime: number,
    maxTime: number,
    /** Sheo no. */
    shoeGame: string,
    status: TableStatus,
    tableNumber: string,
    players: ParticipantData[],
    playerCount: number,
    videoUrl: {
        china: string[],
        nea: string[],
        sea: string[],
    },
    lastShoeBet: string,
};

export type BetData = {
    currentDate: string,
    game: string,
    tableNumber: string,
    tableid: number,
    totalUsersAndBettings: { [item: string]: { bet_place: string, total_bets: number, total_users: number }[] },
    betRankData: { [item: string]: { bet_amount: number, bet_place: string, gameset_id: number, user_id: string, [key: string]: any }[] },
    bet_percentages: { [item: string]: number },
    highestBidders: { [item: string]: string },
    [key: string]: any,
};

export type HistoryData = {
    table: string,
    shoeNo: string,
    betCode: number,
    amount: number,
    winLoss: number,
    gameValues: any,
    gameCode: string,
    betArea: string,
    betDate: string,
};

export type FollowUserData = {
    remove: boolean,
    name: string,
    online: boolean,
    table: string,
    followers: number,
    id?: number,
};

export type FollowDealerData = {
    remove: boolean,
    name: string,
    online: boolean,
    table: string,
    followers: number,
    dealersCode: number | string,
};

export type RankingData = {
    add: boolean,
    name: string,
    online: boolean,
    amount: number,
    id?: number,
};

export type ParticipantData = {
    balance: number,
    currency: string,
    id: string,
    imgname: string,
    imgname_mobile: string,
    max_bet_limit: number,
    min_bet_limit: number,
    nickname: string,
    win_amount: number,
    winningstreak: any,
    wins: number,
};

export type BaccaratBetData = {
    Banker?: number,
    BPair?: number,
    Player?: number,
    PPair?: number,
    Tie?: number,
    Super6?: number,
};

export type DragonTigerBetData = {
    Dragon?: number,
    Tiger?: number,
    Tie?: number,
};

export type ChatData = {
    id: number,
    message: string,
    nikcname: string,
    table_number: string,
    userId: number,
    username: string,
    avatar?: string,
};

export type BackendBetData = {
    index: "player" | "banker" | "player_pair" | "banker_pair" | "tie" | "super_six" | "dragon" | "tiger" | string;
    chipValue: number;
};

export type EmceeData = {
    nickname: string, 
    image: string, 
    followers: number, 
    url: string[], 
    status: "OFFLINE" | "LIVE", 
    [key: string]: any,
};

// #[Enums] ---------- + ---------- + ----------
export enum BaccaratItems { Player, Banker, Tie, PPair, BPair, Super6 }
export enum DragonTigerItems { Dragon, Tiger, Tie }
export enum MoneywheelItems { X1, X2, X5, X10, X20, X40 }
export enum ThreeCardsItems { Dragon, Phoenix, Tie, Lucky }
export enum NiuniuItems { B1_Double, B1_Equal, B1_Many, B2_Double, B2_Equal, B2_Many, B3_Double, B3_Equal, B3_Many, P1_Double, P1_Equal, P1_Many, P2_Double, P2_Equal, P2_Many, P3_Double, P3_Equal, P3_Many }

export enum GameTypes {
    Baccarat = "baccarat",
    DragonTiger = "dragontiger",
    Moneywheel = "moneywheel",
    Roulette = "roulette",
    ThreeCards = "threecards",
    Niuniu = "niuniu"
}

export enum TableStatus {
    Betting = "betting",
    Dealing = "dealing",
    Default = "default",
    Disconnected = "disconnected",
    SqueezeStart = "squeeze_start",
    SqueezePlayerStart = "squeezep_start",
    SqueezeBankerStart = "squeezeb_start",
    SqueezeBothStart = "squeezepb_start",
    SqueezeEnd = "squeeze_end",
    SqueezePlayerEnd = "squeezep_end",
    SqueezeBankerEnd = "squeezeb_end",
    SqueezeBothEnd = "squeezepb_end",
    Shuffling = "shuffling",
}
