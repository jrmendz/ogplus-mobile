<template>
    <div id="mini-road-map-content" :class="tableState.isWhiteRoadmap ? 'white-theme' : ''" @click="tableState.changeRoadmapTheme()">
        <canvas id="mini-road-map" ref="roadMap" resize />
        <v-progress-circular v-if="!hasRoadmapData" size="50" width="6" color="rgba(255, 255, 255, 0.8)" indeterminate />
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events, { GameTypes, BaccaratData, DragonTigerData, MoneywheelData, RouletteData, ThreeCardsData, NiuniuData, RoadmapData, TableData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Paper, { Point, Size, Shape, Path, PointText, Raster, Color, Rectangle } from "paper";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    roadMap!: HTMLCanvasElement;
    paper = new Paper.PaperScope();

    redrawTimeout: number = -1;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly gameType!: string;
    @Prop() readonly tableNumber!: string;

// #[Watch] ---------- + ---------- + ----------
    @Watch("tableState.isWhiteRoadmap") onRoadmapThemeChanged(val: boolean, old: boolean) {
        this.onRedraw();
    }
    @Watch("gameInfo.roadmapList") onRoadmapListChanged(val: { [table: string]: RoadmapData }, old: { [table: string]: RoadmapData }) {
        // If the roamap of this table has updated, redraw the roadmap
        if (val[this.tableNumber] && val[this.tableNumber] !== old[this.tableNumber])
            this.onRedraw();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.roadMap = this.$refs.roadMap as HTMLCanvasElement;

        this.paper.setup(this.roadMap);
        this.onRedraw(0);

        this.eventBus.$on(Events.ON_SIDEBAR, this.onRedraw);

        window.addEventListener("resize", this.onResize);
    }
    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
        
        this.eventBus.$off(Events.ON_SIDEBAR, this.onRedraw);
    }

// #[Events] ---------- + ---------- + ----------
    /** Handles when the size of the window changes */
    onResize() {
        this.onRedraw(0);
    }
    
    onRedraw(delay: number = 200) {
        // Redraw later
        window.clearTimeout(this.redrawTimeout);
        this.redrawTimeout = window.setTimeout(() => {
            this.fixCanvasDpi();
            this.drawRoadGrid();

            if (!this.hasRoadmapData) return;

            if (this.isMoneywheel)
                 this.drawMoneywheelBeans(this.gameInfo.roadmapList[this.tableNumber] as MoneywheelData);
            else if (this.isRoulette)
                 this.drawRouletteBeans(this.gameInfo.roadmapList[this.tableNumber] as RouletteData);
            else if (this.isThreeCards)
                 this.drawThreeCardsBeans(this.gameInfo.roadmapList[this.tableNumber] as ThreeCardsData);
            else if (this.isNiuniu)
                 this.drawNiuniuBeans(this.gameInfo.roadmapList[this.tableNumber] as NiuniuData);
            else this.drawBaccaratBeans(this.gameInfo.roadmapList[this.tableNumber] as BaccaratData | DragonTigerData);
        }, delay);
    }

// #[Methods] ---------- + ---------- + ----------
    fixCanvasDpi() {
        const dpi = (window.devicePixelRatio || 1);

        const computedStyle = getComputedStyle(this.roadMap);
        const styleW = +computedStyle.width!.slice(0, -2);
        const styleH = +computedStyle.height!.slice(0, -2);

        // Scale the canvas
        // this.paper.view.viewSize = new Size(styleW, styleH);

        this.roadMap.width = styleW * dpi;
        this.roadMap.height = styleH * dpi;
    }

    /** Resize the road map and redraw the grid of the road map */
    drawRoadGrid() {
        this.paper.activate();
        this.paper.project.clear();

        const margin = 2;
        const width = this.roadMap.width - margin * 2;
        const height = this.roadMap.height - margin * 2;

        let type: string = "grid";
             if (this.isMoneywheel) type = "wheel";
        else if (this.isRoulette  ) type = "roulet";
        else if (this.isNiuniu    ) type = "niu";
        else if (this.isThreeCards) type = "tcards";

        const raster = new Raster(`${ type }-mini${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`);
              raster.scale(width / 286, height / 173);
              raster.position = new Point(this.roadMap.width / 2, this.roadMap.height / 2);
    }

    /** Draw all Baccarat's beads of the road map */
    drawBaccaratBeans(data: BaccaratData | DragonTigerData) {
        this.paper.activate();

        // For bead road
        let bigRoad = data.roadMap.bigRoad || [];
        if (!bigRoad) return;

        const margin = 4;
        const padding = 2;

        const gridWidth = (this.roadMap.width - margin * 2) / 10;
        const gridHeight = (this.roadMap.height - margin * 2) / 6;

        const beanWidth = gridWidth - padding * 2;
        const beanHeight = gridHeight - padding * 2;
        const beanScaleX = beanWidth / 180;
        const beanScaleY = beanHeight / 180;

        const left = (margin + 1) + beanWidth / 2;
        const top = (margin + 1) + beanHeight / 2;

        const maxCols = 10 - 1;
        let start = 0;
        
        for (const value of bigRoad)
            start = Math.max(value.place[0] - maxCols, start);

        if (start > 0) bigRoad = bigRoad.filter(value => value.place[0] >= start);

        for (let i = bigRoad.length - 1; i >= 0; --i) {
            const bead: { place: [number, number], result: number, tie: number, pair?: [boolean, boolean] } = bigRoad[i];
            const pairIdx = (this.gameType === GameTypes.Baccarat && bead.pair) ? ((bead.pair[0] ? 1 : 0) + (bead.pair[1] ? 2 : 0)) : 0;

            const raster = new Raster(`other-${ this.gameInfo.beadIds.baccarat[bead.result] }${ this.gameInfo.beadIds.pair[pairIdx] }` /*+ `${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`*/);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);

            if (bead.tie > 0) {
                const text = new Raster(`other-tie${ (bead.tie < 10) ? bead.tie : 10 }`);
                      text.scale(beanScaleX, beanScaleY);
                      text.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);
            }
        }
    }

    /** Draw all Moneywheel's beads of the road map */
    drawMoneywheelBeans(data: MoneywheelData) {
        this.paper.activate();

        const margin = 4;
        const padding = 2;

        let gridWidth = (this.roadMap.width - margin * 2) / 8.5;
        let gridHeight = (this.roadMap.height - margin * 2) / 5;

        let beanWidth = gridWidth - padding;
        let beanHeight = gridHeight - padding * 2;
        let beanScaleX = beanWidth / 180;
        let beanScaleY = beanHeight / 180;

        let left = (margin + 1) + beanWidth / 2;
        let top = (margin + 1) + beanHeight / 2;

        let wheelies = data.roadMap.wheelies;
        const maxLength = 15;
        if (wheelies.length > maxLength) {
            const start = Math.ceil((wheelies.length - maxLength) / 5) * 5;
            wheelies = wheelies.slice(start);
        }

        for (let i = wheelies.length - 1; i >= 0; --i) {
            const bead = "x" + wheelies[i];
            const row = i % 5;
            const col = (i / 5) >> 0;

            const raster = new Raster(`wheel-${ bead }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + col * gridWidth, top + row * gridHeight);
        }

        // Draw the statistics
        const sum = Object.values(data.roadMap.count).reduce((result, value) => result + value);
        const max = Math.max(...Object.values(data.roadMap.count));

        gridWidth = (this.roadMap.width - margin * 2) / 10 / 1.05;
        gridHeight = (this.roadMap.height - margin * 2) / 6 / 1.05;

        beanWidth = gridWidth - padding;
        beanHeight = gridHeight - padding * 2;
        beanScaleX = beanWidth / 180;
        beanScaleY = beanHeight / 180;

        left = (margin + 1) + beanWidth / 2;
        top = (margin + 1) + beanHeight / 2 + gridHeight * 0.15;

        const pos = 4;

        for (let i = 5; i >= 0; --i) {
            const limit = 0.6;
            const num: number = (data.roadMap.count as any)[this.gameInfo.wheelIds[i]];
            const ave = (sum === 0) ? 0 : (num / sum);
            const red = (ave <= limit / 2) ? 255 : ((1 - ave / limit) * 2 * 255);
            const green = (ave >= limit / 2) ? 255 : (ave / limit * 2 * 255);

            // const color = new Color(red / 255, green / 255, 0);
            const color = ["#f7f7f7", "#A93CC4", "#E6E61A", "#00FF66", "#E6421A", "#0066FF"][5 - i];

            const raster = new Raster(`wheel-${ this.gameInfo.wheelIds[i] }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + pos * gridWidth, top + (i % 6) * gridHeight);
            const rect = Shape.Rectangle(new Rectangle(left + (pos + 0.75) * gridWidth, top + (i % 6) * gridHeight - gridHeight * 1 / 6, gridWidth * 3 * (ave < limit ? ave / limit : 1), gridHeight * 1 / 3));
                  rect.fillColor = color;
            const text = new PointText(new Point(this.roadMap.width - gridHeight * 0.25, top + beanHeight / 5 + (i % 6) * gridHeight));
                  text.fillColor = color;
                  text.fontSize = gridHeight / ((num === max) ? 1.6 : 1.75);
                  text.justification = "right";
                  text.content = `${ (ave * 100).toFixed(1) } %`;
                  text.fontWeight = (num === max) ? "bold" : "normal";
                  text.scale(0.9, 1);
        }
    }

    /** Draw all Roulette's beads of the road map */
    drawRouletteBeans(data: RouletteData) {
        this.paper.activate();

        let rollRoad = data.roadMap.rollRoad;

        const margin = 4;
        const padding = 2;

        const gridWidth = (this.roadMap.width - margin * 2) / 10;
        const gridHeight = (this.roadMap.height - margin * 2) / 5;

        const beanWidth = gridWidth - padding;
        const beanHeight = gridHeight - padding * 2;
        const beanScaleX = beanWidth / 180;
        const beanScaleY = beanHeight / 180;

        const left = (margin + 1) + beanWidth / 2;
        const top = (margin + 1) + beanHeight / 2;

        const maxLength = 10 - 1;
        if (rollRoad.length > maxLength) {
            const start = rollRoad.length - maxLength;
            rollRoad = rollRoad.slice(start);
        }

        for (let i = rollRoad.length - 1; i >= 0; --i) {
            const bead = "s" + rollRoad[i];
            const row = i % 5;
            const col = ((i / 5) >> 0) * 5;

            const raster = new Raster(`roulet-${ bead }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + col * gridWidth, top + row * gridHeight);

            const textEO = new PointText(new Point(left + gridWidth * (col + 1.5), top + beanHeight / 5 + row * gridHeight));
                  textEO.fillColor = this.tableState.isWhiteRoadmap ? "#000000" : "#ffffff";
                  textEO.fontSize = gridHeight / 1.75;
                  textEO.justification = "center";
                  textEO.content = `${ this.$t(`tableAreas.roulette.${ rollRoad[i] % 2 === 0 ? "even" : "odd" }`) }`;
                  textEO.fontWeight = "normal";
                  textEO.scale(0.8, 1);

            const textSB = new PointText(new Point(left + gridWidth * (col + 3.25), top + beanHeight / 5 + row * gridHeight));
                  textSB.fillColor = this.tableState.isWhiteRoadmap ? "#000000" : "#ffffff";
                  textSB.fontSize = gridHeight / 1.75;
                  textSB.justification = "center";
                  textSB.content = `${ this.$t(`tableAreas.roulette.${ rollRoad[i] <= 18 ? "small" : "big" }`).toString().replace(/\s/g, "") }`;
                  textSB.fontWeight = "normal";
                  textSB.scale(0.8, 1);
        }
    }

    drawThreeCardsBeans(data: ThreeCardsData) {
        this.paper.activate();

        // For bead road
        let beadRoad = data.roadMap.beadRoad;

        const margin = 4;
        const padding = 2;

        let gridWidth  = (this.roadMap.width - margin * 2) / 10;
        let gridHeight = (this.roadMap.height - margin * 2) / 6;

        let beanWidth  = gridWidth - padding * 2;
        let beanHeight = gridHeight - padding * 2;
        let beanScaleX = beanWidth / 180;
        let beanScaleY = beanHeight / 180;

        let left = (margin + 1) + beanWidth / 2;
        let top = (margin + 1) + beanHeight / 2;

        const maxLength = 18;
        if (beadRoad.length > maxLength)
            beadRoad = beadRoad.slice(Math.ceil((beadRoad.length - maxLength) / 6) * 6);

        for (let i = beadRoad.length - 1; i >= 0; --i) {
            const row = i % 6;
            const col = (i / 6) >> 0;

            const raster = new Raster(`bean-${ this.gameInfo.beadIds.threeCards[beadRoad[i]] }${ (this.$i18n && this.$i18n.locale === "cn") ? "-cn" : "" }`);
                raster.scale(beanScaleX, beanScaleY);
                raster.position = new Point(left + col * gridWidth, top + row * gridHeight);
        }

        // Draw the statistics
        const sum = Object.values(data.roadMap.count).reduce((result, value) => result + value);
        const max = Math.max(...Object.values(data.roadMap.count));

        gridWidth = (this.roadMap.width - margin * 2) / 12;
        gridHeight = (this.roadMap.height - margin * 2) / 6 / 1.05;

        beanWidth = gridWidth - padding;
        beanHeight = gridHeight - padding * 2;
        beanScaleX = beanWidth / 180;
        beanScaleY = beanHeight / 180;

        left = (margin + 1) + beanWidth / 2;
        top = (margin + 1) + beanHeight / 2 + gridHeight * 0.15;

        const threeCards = ["dragon", "tie", "phoenix", "star"];
        const pos = 4;

        for (let i = 3; i >= 0; --i) {
            const limit = 0.6;
            const count = data.roadMap.count as any;
            const num: number = (i === 3) ? (count["dragonStar"] + count["phoenixStar"]) : count[threeCards[i]];
            const ave = (sum === 0) ? 0 : (num / sum);

            const color = (i === 3) ? "#fdd534" : this.gameInfo.beadColors[i];

            const raster = new Raster(`bean-${ threeCards[i] }${ (this.$i18n && this.$i18n.locale === "cn" && threeCards[i] !== "star") ? "-cn" : "" }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + pos * gridWidth, top + gridHeight * (0.25 + i * 1.5));
            const rect = Shape.Rectangle(new Rectangle(left + (pos + 0.75) * gridWidth, top + gridHeight * (0.25 + i * 1.5 - 1 / 5), gridWidth * 4 * (ave < limit ? ave / limit : 1), gridHeight * 1 / 2.5));
                  rect.fillColor = color;
            const text = new PointText(new Point(this.roadMap.width - gridHeight * 0.25, top + beanHeight / 5 + gridHeight * (0.25 + i * 1.5)));
                  text.fillColor = color;
                  text.fontSize = gridHeight / ((num === max) ? 1.6 : 1.75);
                  text.justification = "right";
                  text.content = `${ (ave * 100).toFixed(1) } %`;
                  text.fontWeight = (num === max) ? "bold" : "normal";
                  text.scale(0.9, 1);
        }
    }

    drawNiuniuBeans(data: NiuniuData) {
        this.paper.activate();

        // For title
        let beadRoad = data.roadMap.beadRoad;

        const margin = 4;
        const padding = 2;

        const gridWidth  = (this.roadMap.width - margin * 2) / (6 + 2 / 3);
        const gridHeight = (this.roadMap.height - margin * 2) / 4;

        const beanWidth  = gridWidth - padding * 2;
        const beanHeight = gridHeight - padding * 2;
        const beanScaleX = beanWidth / 180;
        const beanScaleY = beanHeight / 180;

        const left = (margin + 1) + beanWidth / 2;
        const top = (margin + 1) + beanHeight / 2;

        for (let i = 3; i >= 0; --i) {
            const text = new PointText(new Point(left, top + beanHeight / 5 + gridHeight * i));
                  text.fontSize = gridHeight / 2;
                  text.fillColor = "#ffffff";
                  text.fontFamily = "微軟正黑體";
                  text.justification = "center";
                  text.fontWeight = "bold";
                  text.content = this.$t(`tableAreas.niuniu.${ (i === 0) ? "banker" : "player" }`) + ((i !== 0) ? `${ i }` : "");
                  text.scale(0.8, 1);
        }

        // For bead road
        const maxLength = 3;
        if (beadRoad.length > maxLength)
            beadRoad = beadRoad.slice(beadRoad.length - maxLength);

        for (let i = beadRoad.length - 1; i >= 0; --i) {
            for (let j = 3; j >= 0; --j) {
                let isWin = false;

                if (j >= 1 && beadRoad[i][j].charAt(0) === "W") {
                    isWin = true;
                    const path = new Path.Rectangle(new Point(left + gridWidth * (0.55 + 1.5 * i), 5 + gridHeight * j), new Size(beanWidth * 1.5, beanHeight));
                          path.fillColor = "#305392E0";
                }

                const text = new PointText(new Point(left + gridWidth * (1.25 + 1.5 * i), top - beanHeight / 30 + gridHeight * j));
                      text.fontSize = gridHeight / 2.75;
                      text.fillColor = this.tableState.isWhiteRoadmap && !isWin ? "#000000" : "#ffffff";
                      text.fontFamily = "微軟正黑體";
                      text.justification = "center";
                      text.fontWeight = "bold";
                      text.content = this.getCardResultName(beadRoad[i][j].charAt((j === 0) ? 0 : 1));
                      text.scale(0.9, 1);
            }
        }
    }

    getCardResultName(result: string) {
        if (result === "0") return `${ this.$t("niuniuTypes.noBull") }`;
        else if (result === "B") return `${ this.$t("niuniuTypes.bullBull") }`;
        else if (result === "P") return `${ this.$t("niuniuTypes.fivePeople") }`;
        else {
            return `${ this.$t("niuniuTypes.bull", [`${ this.$t(`number[${ result }]`) }`]) }`;
        } 
    }

// #[Computed] ---------- + ---------- + ----------
    get isBaccarat()    { return this.gameType === GameTypes.Baccarat; }
    get isDragonTiger() { return this.gameType === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.gameType === GameTypes.Moneywheel; }
    get isRoulette()    { return this.gameType === GameTypes.Roulette; }
    get isThreeCards()  { return this.gameType === GameTypes.ThreeCards; }
    get isNiuniu()      { return this.gameType === GameTypes.Niuniu; }

    get hasRoadmapData() {
        return this.tableNumber in this.gameInfo.roadmapList;
    }
}
</script>

<style lang="scss">
#mini-road-map-content, #mini-road-map[resize] {
    width: 100%;
    height: 100%;
}
#mini-road-map-content {
    padding: 1px;

    &.white-theme {
        background-color: #ffffff;
        // background-image: radial-gradient(ellipse at center, rgba(209,209,209,1) 0%, rgba(209,209,209,1) 20%, rgba(254,254,254,1) 62%, rgba(209,209,209,1) 100%);
        // background-size: 100% 200%;
    }

    .v-progress-circular {
        position: absolute;
        top: calc(50% - 25px);
        left: calc(50% - 25px);
    }
}
</style>
