export default class Platform 
{
    /** The minimum width of screen for a desktop */
    static readonly SCREEN_TELEVISION: number = 1920 - 16;
    /** The minimum width of screen for a desktop */
    static readonly SCREEN_DESKTOP: number = 1280 - 16;
    /** The minimum width of screen for a notebook */
    static readonly SCREEN_LAPTOP: number = 960;
    /** The minimum width of screen for a tablet */
    static readonly SCREEN_TABLET: number = 600;

    /** According to the current width (or height in landscape) of the browser, determine what is current device */
    static get screen() {
        return Platform.orientation.isPortrait ? {
            /** Whether it is a television */
            isTelevision: window.innerWidth >= this.SCREEN_TELEVISION,
            /** Whether it is a desktop (and television) */
            isDesktop: window.innerWidth >= this.SCREEN_DESKTOP,
            /** Whether it is a laptop */
            isLaptop: window.innerWidth >= this.SCREEN_LAPTOP && window.innerWidth < this.SCREEN_DESKTOP,
            /** Whether it is a tablet */
            isTablet: window.innerWidth >= this.SCREEN_TABLET && window.innerWidth < this.SCREEN_LAPTOP,
            /** Whether it is a phone */
            isPhone: window.innerWidth < this.SCREEN_TABLET,

            /** Whether it is a mobile (tablet + phone) */
            isMobile: window.innerWidth < this.SCREEN_LAPTOP,
        } : {
            /** Whether it is a television */
            isTelevision: window.innerHeight >= this.SCREEN_TELEVISION,
            /** Whether it is a desktop (and television) */
            isDesktop: window.innerHeight >= this.SCREEN_DESKTOP,
            /** Whether it is a laptop */
            isLaptop: window.innerHeight >= this.SCREEN_LAPTOP && window.innerWidth < this.SCREEN_DESKTOP,
            /** Whether it is a tablet */
            isTablet: window.innerHeight >= this.SCREEN_TABLET && window.innerWidth < this.SCREEN_LAPTOP,
            /** Whether it is a phone */
            isPhone: window.innerHeight < this.SCREEN_TABLET,

            /** Whether it is a mobile (tablet and phone) */
            isMobile: window.innerHeight < this.SCREEN_LAPTOP,
        };
    }

    /** Determine what is current orientation */
    static get orientation() {
        return {
            isPortrait: window.innerWidth / window.innerHeight <= 13 / 9,
            isLandscape: window.innerWidth / window.innerHeight >= 13 / 9,
        };
    }

    /** Determine what is current device */
    static get device() {
        const u = navigator.userAgent;
        return {
            /** Whether it is an Android device */
            isAndroid: u.indexOf("Android") > -1 || u.indexOf("Adr") > -1,
            /** Whether it is an iOS device */
            isIOS: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            /** Whether it is an iPhone device or a QQ, HD browser */
            isIPhone: u.indexOf("iPhone") > -1,
            /** Whether it is an iPad device */
            isIPad: u.indexOf("iPad") > -1,
            
            /** Whether it is a mobile */
            isMobile: !!u.match(/AppleWebKit.*Mobile.*/),
        };
    }

    /** Determine what is current browser */
    static get browser() {
        const u = navigator.userAgent;
        return {
            /** Whether it is a IE kernel */
            isTrident: u.indexOf("Trident") > -1,
            /** Whether it is a Opera kernel */
            isPresto: u.indexOf("Presto") > -1,
            /** Whether it is a Apple、Chrome、Webkit kernel */
            isWebKit: u.indexOf("AppleWebKit") > -1,
            /** Whether it is a Firefox kernel */
            isGecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") === -1,

            /** Whether it is a WeChat */
            isWeixin: u.indexOf("MicroMessenger") > -1,
            /** Whether it is a QQ Broswer */
            isQQ: !!u.match(/\sQQ/i),
            /** Whether it is a UC Broswer */
            isUC: u.indexOf("UCBrowser") > -1,

            /** Whether it is a Opera */
            isOpera: u.indexOf("Opera") > -1,
            /** Whether it is a Maxthon */
            isMaxthon: u.indexOf("Maxthon") > -1,
            /** Whether it is a IE */
            isIE: u.indexOf("compatible") > -1 && u.indexOf("MSIE") > -1 && !u.indexOf("Opera"),
            /** Whether it is a Firefox */
            isFirefox: u.indexOf("Firefox") > -1,
            /** Whether it is a Safari */
            isSafari: u.indexOf("Safari") > -1 && u.indexOf("Chrome") < 1,
            /** Whether it is a Chorme */
            isChorme: u.indexOf("Chrome") > -1 || u.indexOf("CriOS") > -1,
            
            /** Whether it is a Web app (No head and bottom) */
            isWebApp: u.indexOf("Safari") === -1,
        };
    }

    /** Current language of the device */
    static get language(): string {
        return navigator.language;
    }

    static openDebugConsole() {
        const script = document.createElement("script");
              script.src = "//cdn.jsdelivr.net/npm/eruda";
              script.onload = () => {
                (window as any).eruda.init();
                console.log(navigator.userAgent);
              };
        document.body.appendChild(script);
    }
}
