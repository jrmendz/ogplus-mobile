export default class Utils
{
    /**
     * Formatted as a currency value
     * @param value 	The value to be formatted
     * @param digits 	Specify the number of separated digits, preset to be separated by 3 digits, such as: 99,999
     * @param decimal 	Specify the number of decimal places, preset to a floating number of decimals
     */
    static currency(value: number, digits = 3, decimal = -1)
    {
        if (decimal !== -1) {
            const tenPow = 10 ** decimal;
            value = (value * tenPow >> 0) / tenPow;
        }
        if (Math.abs(value) < 10 ** digits) return (decimal === -1) ? value.toString() : value.toFixed(decimal);

        // Decimal part
        let decimalStr = "";
        if (decimal !== 0) {
            const decimalIndex = value.toString().indexOf(".");
            decimalStr = (decimalIndex >= 0) ? value.toString().substr(decimalIndex) : "";

            if (decimal > 0) {
                if (decimal >= decimalStr.length) {
                    if (decimalStr) decimalStr = decimalStr + new Array(decimal - decimalStr.length + 2).join("0");
                    else decimalStr = "." + new Array(decimal + 1).join("0");
                }
                else decimalStr = decimalStr.substr(0, decimal + 1);
            }
        }

        // Negative part
        const isNegat = value < 0;
        if (isNegat) value *= -1;

        return (isNegat ? "-" : "") + (value >> 0).toString().replace(new RegExp(`\\d(?=(\\d{${ digits }})+$)`, "g"), "$&,") + decimalStr;
    }

    /**
     * Formatted value, insufficient digits to fill the specified character
     * @param value The value to be formatted
     * @param pads 	Specify the number of complements
     * @param char	Specify complement character
     */
    static pad(value: number, pads: number, char = "0")
    {
        if (Math.abs(value) >= 10 ** pads) return value.toString();

        // Decimal part
        const decimalIndex = value.toString().indexOf(".");
        const decimalStr = (decimalIndex >= 0) ? value.toString().substr(decimalIndex) : "";
        value = value >> 0;

        // Negative part
        const isNegat = value < 0;
        if (isNegat) value *= -1;

        return (isNegat ? "-" : "") + new Array(pads - value.toString().length + 1).join(char) + value + decimalStr;
    }

    /**
     * Use String.format like in C#
     * 
     * Usage: `let fullName: string = StringUtils.format("Hello. My name is {0} {1}.", "FirstName", "LastName");`
     */
    static format(text: string, ...args: any[])
    {
        for (let i = 0; i < args.length; i++)
            text = text.replace(new RegExp(`\\{${ i }\\}`, "gm"), args[i]);

        return text;
    }

    /** Format number with the short symbol, like: `16,500 => 16.5K` */
    static formatNumber(num: number, digits: number = 1, trimZero = true)
    {
        const si = [
            { value: 1   , symbol: ""  },
            { value: 1E3 , symbol: "K" },
            { value: 1E6 , symbol: "M" },
            { value: 1E9 , symbol: "G" },
            { value: 1E12, symbol: "T" },
            { value: 1E15, symbol: "P" },
            { value: 1E18, symbol: "E" },
        ];

        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) break;
        }

        let fn = (num / si[i].value).toFixed(digits);
        if (trimZero) fn = fn.replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1");

        return fn + si[i].symbol;
    }

    /**
     * Format alphanumeric Array of strings
     * 
     * Usage: `["A1", "B2", "A3"].sort(sortAlphaNumeric);`, it returns sorted Array string list
     */
    static sortAlphaNumeric(a: string, b: string) {
        const [, aTable, aId] = a.match(/([A-Za-z]*)([0-9]*)/)!;
        const [, bTable, bId] = b.match(/([A-Za-z]*)([0-9]*)/)!;

        if (aTable === bTable) return +aId > +bId ? 1 : -1;
        else return aTable > bTable ? 1 : -1;
    }

    static fixCase(input: string, caseType: string) {
        caseType = caseType.toLowerCase();

        let x: any = input;
            x = x.replace(/[\d\W]/g, " ");
            x = x.split(" ");
            x = x.filter((i: any) => !!i);    // remove null/empty values

        if (caseType.includes("pascal")) {
            x = x.map((i: any) => i.charAt(0).toUpperCase() + i.substring(1, i.length));
            x = x.join("");
        }
        else if (caseType.includes("snake")) {
            x = x.join("_");
        }
        else if (caseType.includes("kebab")) {
            x = x.join("-");
        }
        else if (caseType.includes("camel")) {
            x = x.map((i: any, j: number) => {
                if (j !== 0) return i.charAt(0).toUpperCase() + i.substring(1, i.length);
                else return i.toLowerCase();
            });
            x = x.join("");
        }
        return x;
    }

    /** Input `rgb(#, #, #)` or `rgba(#, #, #, #)` in css string, and output `#rrggbb` */
    static rgbToHex(rgb: string): string;
    /** Input red, green, blue in number that range from 0 to 255, and output `#rrggbb` */
    static rgbToHex(r: number, g: number, b: number): string;

    static rgbToHex(rgb: string | number, g?: number, b?: number) {
        let hexs: string[] | null = [];

        // The opacity of rgba is ignored
        if (typeof rgb === "string")
             hexs = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        else hexs = ["", `${ rgb }`, `${ g }`, `${ b }`];

        return (hexs && hexs.length === 4) ? "#" +
               ("0" + parseInt(hexs[1]).toString(16)).slice(-2) +
               ("0" + parseInt(hexs[2]).toString(16)).slice(-2) +
               ("0" + parseInt(hexs[3]).toString(16)).slice(-2) : "";
    }

    /** Input `#rrggbb` in css string, and output `rgb(#, #, #)`, `rgba(#, #, #, #)` or RGB object. */
    static hexToRgb(hex: string, opacity = 1) {
        const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        const result = rgb && { r: parseInt(rgb[1], 16), g: parseInt(rgb[2], 16), b: parseInt(rgb[3], 16) };

        if (opacity < 0) return result;
        else if (opacity >= 1) return result ? `rgb(${ result.r }, ${ result.g }, ${ result.b })` : "";
        else return result ? `rgba(${ result.r }, ${ result.g }, ${ result.b }, ${ opacity })` : "";
    }

    /**
     * Usage: `Utils.addStyles(".class", { width: "100px", height: 100px, ... });`
     * 
     * is like jQuery `$(".class").css("width", "100px").css("height", "100px");`
     */
    static addStyles(selectors: string, styles: { [key: string]: string }) {
        document.querySelectorAll(selectors).forEach(elem => {
            if (elem instanceof HTMLElement)
                Object.keys(styles).forEach(key => (elem.style as any)[key] = styles[key]);
        });
    }

    /** Usage: `Utils.addClass(".aaa", "className" | ["className1, className2"]);` */
    static addClass(selectors: string, classes: string | string[]) {
        if (typeof classes === "string") classes = [classes];

        document.querySelectorAll(selectors).forEach(elem => {
            if (elem instanceof HTMLElement) (classes as string[]).forEach(className => { 
                if (className) elem.classList.add(className);
            });
        });
    }

    /** Usage: `Utils.removeClass(".aaa", "className" | ["className1, className2"]);` */
    static removeClass(selectors: string, classes: string | string[]) {
        if (typeof classes === "string") classes = [classes];

        document.querySelectorAll(selectors).forEach(elem => {
            if (elem instanceof HTMLElement) (classes as string[]).forEach(className => {
                if (className) elem.classList.remove(className);
            });
        });
    }

    /** Usage: `Utils.debounce(functionName: (updates: any) => void, delay: number);` */
    static debounce(func: (updates: any) => void, wait: number = 500) {
        let timeoutID: number;

        return function(this: any, ...args: any[]) {
            clearTimeout(timeoutID);
            timeoutID = window.setTimeout(() => func.apply(this, (args as any)), wait);
        };
    }

    /** Merge all objects */
    static merge(target: { [key: string]: any }, ...sources: { [key: string]: any }[]) {
        target = target || {};
        sources = sources.filter(src => typeof src === "object");

        // Only deep copy second level object
        for (const src of sources) {
            for (const param in src) {
                if (typeof src[param] === "object") {
                    target[param] = target[param] ? Object.assign(target[param], src[param]) : src[param];
                    delete src[param];
                }
            }
        }

        if (sources.length > 0) return Object.assign(target || {}, ...sources);
        return {};
    }

    /** Serialize sound effects for all games */
    static serialize(name: string, startNum: number, endNum: number) {
        const names: string[] = [];

        for (let i = 0, max = endNum - startNum; i <= max; i++)
            names[i] = name + (startNum + i);

        return names;
    }
}
