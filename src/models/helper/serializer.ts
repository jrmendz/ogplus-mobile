import { BackendBetData, BaccaratItems, MoneywheelItems, GameTypes } from "@/models/helper/types";
import Utils from "@/models/helper/utils";

export default class Serializer 
{
    static fix(data: { [key: string]: number }, gameCode?: string) {
        if (!data) return null;

        const serializedValues: BackendBetData[] = [];

        try {
            Object.entries(data).forEach(([key, value]) => {
                let index = "";

                switch (gameCode) {
                    case GameTypes.Baccarat:
                        switch (key) {
                            case BaccaratItems[BaccaratItems.BPair]:
                                index = "banker_pair";
                                break;
                            case BaccaratItems[BaccaratItems.PPair]:
                                index = "player_pair";
                                break;
                            case BaccaratItems[BaccaratItems.Super6]:
                                index = "super_six";
                                break;
                            default:
                                index = key.toLowerCase();
                                break;
                        }
                        break;

                    case GameTypes.Moneywheel:
                        if (key === MoneywheelItems[MoneywheelItems.X40]) index = "og";
                        else index = key.substr(1, key.length);
                        break;

                    case GameTypes.Roulette:
                        index = key;
                        if (key.includes("other"))
                            index = ["small", "even", "red", "black", "odd", "big"][+key.substring(key.length - 1) - 1];
                        break;

                    case GameTypes.ThreeCards:
                        index = "3c-" + key.toLowerCase();
                        break;

                    case GameTypes.Niuniu:
                        index = "niu-" + key.toLowerCase().replace("_", "-");
                        break;

                    default:
                        index = key.toLowerCase();
                        break;
                }
                serializedValues.push({ index, chipValue: value || 0 });
            });
            return serializedValues;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
}
