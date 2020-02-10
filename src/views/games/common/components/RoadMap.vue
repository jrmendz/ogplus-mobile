<template>
    <div id="road-map-content" :class="[tableState.isWhiteRoadmap ? 'white-theme' : '', inRow && 'in-row']" @click="(disabledTheme === undefined) && tableState.changeRoadmapTheme()">
        <canvas id="road-map" ref="roadMap" resize />
        <template v-if="(isBaccarat || isDragonTiger) && (inGame !== undefined || inGameLand !== undefined)">
            <div v-if="!lookupMode" class="maximize road-big-eye" @click.stop="onScaleRoad('max', 'big-eye')"><v-img :src="require(`@/assets/images/games/road/img_maximize.svg`)" contain /></div>
            <div v-if="!lookupMode" class="maximize road-small"   @click.stop="onScaleRoad('max', 'small'  )"><v-img :src="require(`@/assets/images/games/road/img_maximize.svg`)" contain /></div>
            <div v-if="!lookupMode" class="maximize road-roach"   @click.stop="onScaleRoad('max', 'roach'  )"><v-img :src="require(`@/assets/images/games/road/img_maximize.svg`)" contain /></div>
            <div v-if=" lookupMode" class="minimize road-roach"   @click.stop="onScaleRoad('min'           )"><v-img :src="require(`@/assets/images/games/road/img_minimize.svg`)" contain /></div>
        </template>
        <v-flex v-if="tableData && tableData.status === 'shuffling'" class="shuffling" xs12>
            <v-img class="shuffling-icon" :src="require(`@/assets/images/games/bet/img_dealing.svg`)" height="52px" contain />
            <div class="shuffling-text">{{ $t("waiting.shuffling") + "..." }}</div>
        </v-flex>
        <v-progress-circular v-if="!hasRoadmapData" :class="[inGame !== undefined ? 'inGame' : '', inGameLand !== undefined ? 'inGameLand' : '']"
                             size="50" width="6" :color="tableState.isWhiteRoadmap ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)'" indeterminate />
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenMax, Power2 } from "gsap";

import Events, { GameTypes, BaccaratData, DragonTigerData, MoneywheelData, RouletteData, ThreeCardsData, NiuniuData, RoadmapData, TableData, TableStatus } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Paper, { Point, Size, Shape, Path, PointText, Raster, Group, Item, Color, Rectangle } from "paper";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    roadMap!: HTMLCanvasElement;
    paper = new Paper.PaperScope();

    /** 0: blue bead (player, dragon), 1: red bead (banker, tiger) */
    predictionGroups!: [Group, Group];
    predictionTweens!: TweenMax[];

    lookupMode: "big-eye" | "small" | "roach" | false = false;

    redrawTimeout: number = -1;

// #[Props] ---------- + ---------- + ----------
    @Prop() readonly inGame!: boolean;
    @Prop() readonly inGameLand!: boolean;

    @Prop() readonly gameType!: string;
    @Prop() readonly tableNumber!: string;

    @Prop() readonly disabledTheme!: string;

    @Prop({ default: false }) readonly inRow!: boolean;

// #[Watch] ---------- + ---------- + ----------
    @Watch("tableState.isWhiteRoadmap") onRoadmapThemeChanged(val: boolean, old: boolean) {
        this.onRedraw();
    }

    @Watch("gameInfo.roadmapList") onRoadmapListChanged(val: { [table: string]: RoadmapData }, old: { [table: string]: RoadmapData }) {
        // If the roamap of this table has updated, redraw the roadmap
        if (val[this.tableNumber] && val[this.tableNumber] !== old[this.tableNumber]) this.onRedraw();
    }

    @Watch("inRow") onInRowChanged(val: boolean) {
        this.onRedraw(val ? 500 : 0);
    }

    @Watch("tableData.status") onStatusChange(val: TableStatus) {
        switch (val) {
            case TableStatus.Shuffling:
                if (this.tableData) this.onRedraw();
                break;
        }
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.roadMap = this.$refs.roadMap as HTMLCanvasElement;

        this.paper.setup(this.roadMap);
        this.onRedraw(0);

        this.eventBus.$on(Events.ON_LANG_CHANGED, this.onLangChanged);

        window.addEventListener("resize", this.onResize);
    }

    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
        
        this.eventBus.$off(Events.ON_LANG_CHANGED, this.onLangChanged);

        if (this.predictionTweens) this.predictionTweens.forEach(tween => tween.kill());
    }

// #[Events] ---------- + ---------- + ----------
    /** Change the language of the roadmap to player's choice */
    onLangChanged() {
        this.onRedraw();
    }

    onPredict(type: "blue" | "red") {
        if (!this.predictionGroups) return;
        if (this.predictionTweens) this.predictionTweens.forEach(tween => tween.kill());

        if (type === "blue") {
            this.predictionGroups[0].visible = !this.predictionGroups[0].visible;
            this.predictionGroups[1].visible = false;

            if (this.predictionGroups[0].visible)
                this.predictionTweens = TweenMax.staggerFromTo(this.predictionGroups[0].children, 0.75, { opacity: 1 }, { opacity: 0, repeat: 4, yoyo: true, ease: Power2.easeInOut }, 0);
        }
        else if (type === "red") {
            this.predictionGroups[0].visible = false;
            this.predictionGroups[1].visible = !this.predictionGroups[1].visible;

            if (this.predictionGroups[1].visible)
                this.predictionTweens = TweenMax.staggerFromTo(this.predictionGroups[1].children, 0.75, { opacity: 1 }, { opacity: 0, repeat: 4, yoyo: true, ease: Power2.easeInOut }, 0);
        }
    }

    /** Handles when the size of the window changes */
    onResize() {
        this.onRedraw(0);
    }
    onRedraw(delay: number = 200) {
        // Redraw later
        window.clearTimeout(this.redrawTimeout);
        this.redrawTimeout = window.setTimeout(() => {
            if (this.predictionTweens) this.predictionTweens.forEach(tween => tween.kill());

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

    onScaleRoad(type: "max" | "min", road: "big-eye" | "small" | "roach") {
        if (type === "max") {
                 if (road === "big-eye") this.lookupMode = "big-eye";
            else if (road === "small"  ) this.lookupMode = "small";
            else if (road === "roach"  ) this.lookupMode = "roach";
        }
        else if (type === "min") this.lookupMode = false;

        this.onRedraw();
    }

// #[Methods] ---------- + ---------- + ----------
    /** Depending on the devicePixelRatio to scale the canvas */
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

        const raster = new Raster(`${ type }${ (this.inGame === undefined) ? "" : "-game" }${ this.lookupMode ? "-lookup" : "" }${ this.inRow ? "-row" : "" }${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`);
              raster.scale(width / (this.inGame === undefined ? 400 : 513), height / 173);
              raster.position = new Point(this.roadMap.width / 2, this.roadMap.height / 2);
    }

    /** Draw all Baccarat's beads of the road map */
    drawBaccaratBeans(data: BaccaratData | DragonTigerData) {
        if (this.tableData.status === TableStatus.Shuffling) return;
        
        this.paper.activate();

        const inGame = this.inGame !== undefined;
        const predictionGroupsItems: Item[][] = [[], []];

        // For bead road
        let beadRoad = data.roadMap.beadRoad || [];

        const margin = 4;
        let padding = 2;

        let gridWidth  = (this.roadMap.width - margin * 2) / (inGame ? 18 : 14);
        let gridHeight = (this.roadMap.height - margin * 2) / 6;

        let beanWidth  = gridWidth - padding * 2;
        let beanHeight = gridHeight - padding * 2;
        let beanScaleX = beanWidth / 180;
        let beanScaleY = beanHeight / 180;

        let left = (margin + 1) + beanWidth / 2;
        let top = (margin + 1) + beanHeight / 2;

        const maxLength = 30;
        if (beadRoad.length > maxLength)
            beadRoad = beadRoad.slice(Math.ceil((beadRoad.length - maxLength) / 6) * 6);

        const drawBeadRoad = (length: number, result: number, pair?: [boolean, boolean], superSix?: boolean) => {
            const row = length % 6;
            const col = (length / 6) >> 0;

            const pairIdx = (this.gameType === GameTypes.Baccarat && pair) ? ((pair[0] ? 1 : 0) + (pair[1] ? 2 : 0)) : 0;

            let raster: Raster;
            if (this.gameType === GameTypes.DragonTiger)
                 raster = new Raster(`bean-${ this.gameInfo.beadIds.dragonTiger[result] }${ (this.$i18n && this.$i18n.locale === "cn") ? "-cn" : "" }` /*+ `${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`*/);
            else raster = new Raster(`bean-${ this.gameInfo.beadIds.baccarat[result] }${ this.gameInfo.beadIds.pair[pairIdx] }${ superSix ? "-s6" : "" }${ (!superSix && this.$i18n && this.$i18n.locale === "cn") ? "-cn" : "" }` /*+ `${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`*/);

            raster.scale(beanScaleX, beanScaleY);
            raster.position = new Point(left + col * gridWidth, top + row * gridHeight);

            return raster;
        };

        for (let i = beadRoad.length - 1; i >= 0; --i) {
            const bead: { result: number, pair?: [boolean, boolean], super_six?: boolean } = beadRoad[i];
            drawBeadRoad(i, bead.result, bead.pair, bead.super_six);
        }

        for (let i = 1; i >= 0; --i)
            predictionGroupsItems[i].push(drawBeadRoad(beadRoad.length, i));

        // For big road
        let bigRoad = data.roadMap.bigRoad || [];

        padding = 0.5;
        gridWidth  = gridWidth / 2;
        gridHeight = gridHeight / 2;

        beanWidth  = gridWidth - padding * 2;
        beanHeight = gridHeight - padding * 2;
        beanScaleX = beanWidth / 180;
        beanScaleY = beanHeight / 180;

        left = (margin + 1) + 12 * gridWidth + beanWidth / 2;
        top = (margin + 1) + beanHeight / 2;

        let maxCols = (inGame ? 24 : 16) - 2;
        let start = 0;
        for (const value of bigRoad)
            start = Math.max(value.place[0] - maxCols, start);

        if (start > 0) bigRoad = bigRoad.filter(value => value.place[0] >= start);

        const drawBigRoad = (bead: { place: [number, number] }, result: number, tie: number = 0, pair?: [boolean, boolean]) => {
            const pairIdx = (this.gameType === GameTypes.Baccarat && pair) ? ((pair[0] ? 1 : 0) + (pair[1] ? 2 : 0)) : 0;

            const raster = new Raster(`other-${ this.gameInfo.beadIds.baccarat[result] }${ this.gameInfo.beadIds.pair[pairIdx] }` /*+ `${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`*/);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);

            if (tie > 0) {
                const text = new Raster(`other-tie${ (tie < 10) ? tie : 10 }`);
                      text.scale(beanScaleX, beanScaleY);
                      text.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);
            }
            return raster;
        };

        for (let i = bigRoad.length - 1; i >= 0; --i) {
            const bead: { place: [number, number], result: number, tie: number, pair?: [boolean, boolean] } = bigRoad[i];
            drawBigRoad(bead, bead.result, bead.tie, bead.pair);
        }

        try {
            for (let i = 1; i >= 0; --i) {
                const bead = ((i === 0) ? ((data as BaccaratData).prediction.player || (data as DragonTigerData).prediction.dragon)
                                        : ((data as BaccaratData).prediction.banker || (data as DragonTigerData).prediction.tiger )).bigRoad;
                if (bead && bead.place) predictionGroupsItems[i].push(drawBigRoad(bead, i, 0));
            }
        }
        catch (e) {}

        // For big eye road
        if (this.lookupMode === "big-eye" || !this.lookupMode) {
            let bigEyeRoad = data.roadMap.bigEyeRoad || [];

            if (this.lookupMode)
                top = (margin + 1) + 6.5 * gridHeight;
            else {
                gridWidth  = gridWidth / 2;
                gridHeight = gridHeight / 2;
                beanWidth  = gridWidth - padding / 2;
                beanHeight = gridHeight - padding / 2;

                left = (margin + 1) + 24 * gridWidth;
                top  = (margin + 1) + 12 * gridHeight;

                maxCols = (inGame ? 44 : 32) - 2;
            }

            start = 0;
            for (const value of bigEyeRoad)
                start = Math.max(value.place[0] - maxCols, start);

            if (start > 0) bigEyeRoad = bigEyeRoad.filter(value => value.place[0] >= start);

            let drawBigEyeRoad: (bead: { place: [number, number], result: number }) => Item;
            if (this.lookupMode) {
                drawBigEyeRoad = bead => {
                    const raster = new Raster(`other-${ this.gameInfo.beadIds.baccarat[bead.result] }` /*+ `${ this.tableState.isWhiteRoadmap ? "-dark" : "" }`*/);
                          raster.scale(beanScaleX, beanScaleY);
                          raster.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);
                    return raster;
                };
            }
            else {
                drawBigEyeRoad = bead => {
                    const shape = Shape.Ellipse(new Paper.Rectangle(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight, beanWidth, beanHeight));
                          shape.strokeColor = (/*this.tableState.isWhiteRoadmap ? this.gameInfo.beadDarkColors :*/ this.gameInfo.beadColors)[bead.result * 2];
                          shape.strokeWidth = 3;
                    return shape;
                };
            }

            for (let i = bigEyeRoad.length - 1; i >= 0; --i)
                drawBigEyeRoad(bigEyeRoad[i]);
        
            try {
                for (let i = 1; i >= 0; --i) {
                    const bead = ((i === 0) ? ((data as BaccaratData).prediction.player || (data as DragonTigerData).prediction.dragon)
                                            : ((data as BaccaratData).prediction.banker || (data as DragonTigerData).prediction.tiger )).bigEyeRoad;
                    if (bead && bead.place) predictionGroupsItems[i].push(drawBigEyeRoad(bead));
                }
            }
            catch (e) {}
        }

        // For small road
        if (this.lookupMode === "small" || !this.lookupMode) {
            let smallRoad = data.roadMap.smallRoad || [];

            if (this.lookupMode)
                top = (margin + 1) + 6.5 * gridHeight;
            else {
                top = (margin + 1) + 18 * gridHeight;
                maxCols = (inGame ? 20 : 16) - 2;
            }

            start = 0;
            for (const value of smallRoad)
                start = Math.max(value.place[0] - maxCols, start);

            if (start > 0) smallRoad = smallRoad.filter(value => value.place[0] >= start);


            let drawSmallRoad: (bead: { place: [number, number], result: number }) => Item;
            if (this.lookupMode) {
                drawSmallRoad = bead => {
                    const raster = new Raster(`other-${ this.gameInfo.beadIds.baccarat[bead.result] }-fill` /*+ `${ this.isWhiteRoadmap ? "-dark" : "" }`*/);
                          raster.scale(beanScaleX, beanScaleY);
                          raster.position = new Point(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight);
                    return raster;
                };
            }
            else {
                drawSmallRoad = bead => {
                    const shape = Shape.Ellipse(new Paper.Rectangle(left + (bead.place[0] - start) * gridWidth, top + bead.place[1] * gridHeight, beanWidth, beanHeight));
                          shape.fillColor = (/*this.tableState.isWhiteRoadmap ? this.gameInfo.beadDarkColors :*/ this.gameInfo.beadColors)[bead.result * 2];
                    return shape;
                };
            }

            for (let i = smallRoad.length - 1; i >= 0; --i)
                drawSmallRoad(smallRoad[i]);

            try {
                for (let i = 1; i >= 0; --i) {
                    const bead = ((i === 0) ? ((data as BaccaratData).prediction.player || (data as DragonTigerData).prediction.dragon)
                                            : ((data as BaccaratData).prediction.banker || (data as DragonTigerData).prediction.tiger )).smallRoad;
                    if (bead && bead.place) predictionGroupsItems[i].push(drawSmallRoad(bead));
                }
            }
            catch (e) {}
        }

        // For cockroach road
        if (this.lookupMode === "roach" || !this.lookupMode) {
            let roachRoad = data.roadMap.roachRoad || [];

            if (this.lookupMode) {
                top = (margin + 1) + 6 * gridHeight;
                left = (margin + 1) + 12 * gridWidth;
            }
            else {
                left = (margin + 1) + (inGame ? 48 : 40) * gridWidth;
                maxCols = (inGame ? 20 : 16) - 2;
            }

            start = 0;
            for (const value of roachRoad)
                start = Math.max(value.place[0] - maxCols, start);

            if (start > 0) roachRoad = roachRoad.filter(value => value.place[0] >= start);

            const drawRoachRoad = (bead: { place: [number, number], result: number }) => {
                const path = new Path.Line(new Point(left + ((bead.place[0] - start) + 1) * gridWidth, top + bead.place[1] * gridHeight), new Point(left + (bead.place[0] - start) * gridWidth, top + (bead.place[1] + 1) * gridHeight));
                      path.strokeColor = (/*this.tableState.isWhiteRoadmap ? this.gameInfo.beadDarkColors :*/ this.gameInfo.beadColors)[bead.result * 2];
                      path.strokeWidth = this.lookupMode ? 5 : 3;
                return path;
            };

            for (let i = roachRoad.length - 1; i >= 0; --i)
                drawRoachRoad(roachRoad[i]);
        
            try {
                for (let i = 1; i >= 0; --i) {
                    const bead = ((i === 0) ? ((data as BaccaratData).prediction.player || (data as DragonTigerData).prediction.dragon)
                                            : ((data as BaccaratData).prediction.banker || (data as DragonTigerData).prediction.tiger )).roachRoad;
                    if (bead && bead.place) predictionGroupsItems[i].push(drawRoachRoad(bead));
                }
            }
            catch (e) {}
        }

        // For prediction
        this.predictionGroups = [new Group(predictionGroupsItems[0]), new Group(predictionGroupsItems[1])];
        this.predictionGroups[0].visible = this.predictionGroups[1].visible = false;
    }

    /** Draw all Moneywheel's beads of the road map */
    drawMoneywheelBeans(data: MoneywheelData) {
        this.paper.activate();

        const inGame = this.inGame !== undefined;
        const inGameLand = this.inGameLand !== undefined;

        let wheelies = data.roadMap.wheelies;

        const margin = 4;
        const padding = 2;

        let gridWidth = (this.roadMap.width - margin * 2) / (inGame ? 15 : 12);
        let gridHeight = (this.roadMap.height - margin * 2) / 5;

        let beanWidth = gridWidth - padding;
        let beanHeight = gridHeight - padding * 2;
        let beanScaleX = beanWidth / 180;
        let beanScaleY = beanHeight / 180;

        let left = (margin + 1) + beanWidth / 2;
        let top = (margin + 1) + beanHeight / 2;

        const maxLength = (inGame ? 35 : (inGameLand && this.inRow ? 10 : 25)) - 1;
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

        gridWidth = (this.roadMap.width - margin * 2) / (inGame ? 18 : 14) / 1.05;
        gridHeight = (this.roadMap.height - margin * 2) / 6 / 1.05;

        beanWidth = gridWidth - padding;
        beanHeight = gridHeight - padding * 2;
        beanScaleX = beanWidth / 180;
        beanScaleY = beanHeight / 180;

        left = (margin + 1) + beanWidth / 2;
        top = (margin + 1) + beanHeight / 2 + gridHeight * 0.15;

        const pos = inGame ? 9.25 : 6.5;

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
            const rect = Shape.Rectangle(new Rectangle(left + (pos + 0.75) * gridWidth, top + (i % 6) * gridHeight - gridHeight * 1 / 6, gridWidth * (inGame ? 5.75 : 4) * (ave < limit ? ave / limit : 1), gridHeight * 1 / 3));
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

        const inGame = this.inGame !== undefined;
        const inGameLand = this.inGameLand !== undefined;

        let rollRoad = data.roadMap.rollRoad;

        const margin = 4;
        const padding = 2;

        const gridWidth = (this.roadMap.width - margin * 2) / (inGame ? 15 : 12);
        const gridHeight = (this.roadMap.height - margin * 2) / 5;

        const beanWidth = gridWidth - padding;
        const beanHeight = gridHeight - padding * 2;
        const beanScaleX = beanWidth / 180;
        const beanScaleY = beanHeight / 180;

        const left = (margin + 1) + beanWidth / 2;
        const top = (margin + 1) + beanHeight / 2;

        const maxLength = (inGame && !inGameLand ? 15 : (inGameLand && this.inRow ? 5 : 10)) - 1;
        if (rollRoad.length > maxLength) {
            const start = rollRoad.length - maxLength;
            rollRoad = rollRoad.slice(start);
        }

        for (let i = rollRoad.length - 1; i >= 0; --i) {
            const bead = "s" + rollRoad[i];
            const row = (inGame && this.inRow) ? 0 : i % 5;
            let col = ((i / 5) >> 0);
            
            if (inGame) col = this.inRow ? i : col *= 5;
            else col *= 5.5;

            const raster = new Raster(`roulet-${ bead }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + col * gridWidth, top + row * gridHeight);

            if (!this.inRow && i < (inGame ? 15 : 10) && rollRoad[i] !== 0) {
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
    }

    drawThreeCardsBeans(data: ThreeCardsData) {
        this.paper.activate();
        
        const inGame = this.inGame !== undefined;

        // For bead road
        let beadRoad = data.roadMap.beadRoad;

        const margin = 4;
        const padding = 2;

        let gridWidth  = (this.roadMap.width - margin * 2) / (inGame ? 18 : 14);
        let gridHeight = (this.roadMap.height - margin * 2) / 6;

        let beanWidth  = gridWidth - padding * 2;
        let beanHeight = gridHeight - padding * 2;
        let beanScaleX = beanWidth / 180;
        let beanScaleY = beanHeight / 180;

        let left = (margin + 1) + beanWidth / 2;
        let top = (margin + 1) + beanHeight / 2;

        const maxLength = (inGame ? 48 : 30);
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

        gridWidth = (this.roadMap.width - margin * 2) / (inGame ? 18 : 14) / 1.05;
        gridHeight = (this.roadMap.height - margin * 2) / 6 / 1.05;

        beanWidth = gridWidth - padding;
        beanHeight = gridHeight - padding * 2;
        beanScaleX = beanWidth / 180;
        beanScaleY = beanHeight / 180;

        left = (margin + 1) + beanWidth / 2;
        top = (margin + 1) + beanHeight / 2 + gridHeight * 0.15;

        const threeCards = ["dragon", "tie", "phoenix", "star"];
        const pos = inGame ? 9.75 : 6.5;

        for (let i = 3; i >= 0; --i) {
            const limit = 0.6;
            const count = data.roadMap.count as any;
            const num: number = (i === 3) ? (count["dragonStar"] + count["phoenixStar"]) : count[threeCards[i]];
            const ave = (sum === 0) ? 0 : (num / sum);

            const color = (i === 3) ? "#fdd534" : this.gameInfo.beadColors[i];
            
            const raster = new Raster(`bean-${ threeCards[i] }${ (this.$i18n && this.$i18n.locale === "cn" && threeCards[i] !== "star") ? "-cn" : "" }`);
                  raster.scale(beanScaleX, beanScaleY);
                  raster.position = new Point(left + pos * gridWidth, top + gridHeight * (0.25 + i * 1.5));
            const rect = Shape.Rectangle(new Rectangle(left + (pos + 0.75) * gridWidth, top + gridHeight * (0.25 + i * 1.5 - 1 / 5), gridWidth * (inGame ? 5.25 : 4) * (ave < limit ? ave / limit : 1), gridHeight * 1 / 2.5));
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
        
        const inGame = this.inGame !== undefined;

        // For title
        let beadRoad = data.roadMap.beadRoad;

        const margin = 4;
        const padding = 2;

        const gridWidth  = (this.roadMap.width - margin * 2) / (inGame ? 12 : (9 + 1 / 3));
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
        const maxLength = (inGame ? 7 : 5);
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

                const text = new PointText(new Point(left + gridWidth * (1.25 + 1.5 * i), top + beanHeight / 6 + gridHeight * j));
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
    get GameTypes() { return GameTypes; }

    get isBaccarat()    { return this.gameType === GameTypes.Baccarat; }
    get isDragonTiger() { return this.gameType === GameTypes.DragonTiger; }
    get isMoneywheel()  { return this.gameType === GameTypes.Moneywheel; }
    get isRoulette()    { return this.gameType === GameTypes.Roulette; }
    get isThreeCards()  { return this.gameType === GameTypes.ThreeCards; }
    get isNiuniu()      { return this.gameType === GameTypes.Niuniu; }

    get hasRoadmapData() {
        return this.tableNumber in this.gameInfo.roadmapList;
    }
    
    get tableData() {
        return this.gameInfo.tableDatas[this.tableNumber];
    }
}
</script>

<style lang="scss">
#road-map-content, #road-map[resize] {
    width: 100%;
    height: 100%;
}
#road-map-content {
    position: relative;
    padding: 1px;

    @include port-only {
        background-color: $c-dark;
    }

    &.white-theme {
        background-color: #ffffff;
        // background-image: radial-gradient(ellipse at center, rgba(209,209,209,1) 0%, rgba(209,209,209,1) 20%, rgba(254,254,254,1) 62%, rgba(209,209,209,1) 100%);
        // background-size: 100% 200%;
    }
    &.in-row {
        pointer-events: none;
    }

    .maximize, .minimize {
        position: absolute;
        width: calc((100% - 4px) / 9);
        height: calc((100% - 4px) / 4);

        &.road-big-eye {
            right: 4px;
            bottom: calc((100% - 4px) / 6 * 1.5 + 4px);
        }
        &.road-small {
            right: calc((100% - 4px) / 18 * 6 + 3px);
            bottom: calc((100% - 4px) / 24 - 2px);
        }
        &.road-roach {
            right: 4px;
            bottom: calc((100% - 4px) / 24 - 2px);
        }

        @include land-only {
            width: calc((100% - 4px) / 7.5);

            &.road-big-eye {
                right: 5px;
                bottom: calc((100% - 4px) / 6 * 1.5 + 6px);
            }
            &.road-small {
                right: calc((100% - 4px) / 18 * 5.5 - 1px);
            }
            &.road-roach {
                right: 5px;
            }
        }

        .v-image {
            position: absolute;
            width: calc(100% / 2 - 3px);
            height: 50%;
            right: 0;
            bottom: 0;
        }
    }

    .v-progress-circular {
        position: absolute;
        top: calc(50% - 25px);
        left: calc(12.5% + 50% - 25px);

        &.inGame {
            top: calc(50% - 7px);
            left: calc(50% - 25px);
        }
        &.inGameLand {
            top: calc(50% - 25px);
            left: calc(50% - 25px);
        }
    }

    .shuffling {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.35);

        color: #ffffff;
        font-weight: bold;
        font-size: 20px;

        .shuffling-icon {
            margin-top: 25px;
            animation: dealing 0.25s infinite alternate;
        }
        .shuffling-text {
            padding-top: 5px;
        }

        @keyframes dealing {
              0% { transform: rotate(-20deg); }
            100% { transform: rotate(  0deg); }
        }
    }
}
</style>
