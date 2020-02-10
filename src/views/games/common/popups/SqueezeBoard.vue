<template>
    <div id="squeeze-board">
        <canvas id="squeeze-canvas" ref="squeezeCanvas" resize />
        <div class="rotate-btn" @click="onRotateCard()">{{ $t("rotate") }}</div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Inject, Mixins, Model, Prop, Provide, Watch, Vue } from "vue-property-decorator";
import { TweenLite } from "gsap";

import Events, { GameTypes, TableData } from "@/models/helper/types";
import ModulesMixin from "@/models/mixins/modulesMixin";
import Paper, { Raster, Point, Tool, Group, Path, Rectangle } from "paper";

@Component({ components: {}})
export default class extends Mixins(ModulesMixin)
{
    squeezeCanvas!: HTMLCanvasElement;
    paper = new Paper.PaperScope();

    redrawTimeout = -1;

    squeezeScale = 1.25;
    isLandscape = false;
    isFlipped = false;

// #[Props] ---------- + ---------- + ----------


// #[Watch] ---------- + ---------- + ----------
    @Watch("isSqueezeFlips", { deep: true }) onSqueezeFlipsChanged() {
        this.drawSqueezeCard();
    }

// #[Life Cycle] ---------- + ---------- + ----------
    mounted() {
        this.squeezeCanvas = this.$refs.squeezeCanvas as HTMLCanvasElement;

        this.paper.setup(this.squeezeCanvas);
        this.paper.tool = new Tool();
        this.drawSqueezeCard();

        window.addEventListener("resize", this.onResize);
    }

    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
    }

// #[Events] ---------- + ---------- + ----------
    /** Handles when the size of the window changes */
    onResize() {
        this.tableState.setSqueezeVisible({ visible: true, isFlips: this.isSqueezeFlips, status: this.squeezeStatus, isHighestBidder: this.isHighestBidder });
    }

    onRotateCard() {
        this.isLandscape = !this.isLandscape;
        this.drawSqueezeCard();
    }

// #[Methods] ---------- + ---------- + ----------
    drawSqueezeCard() {
        // Get the card waiting for flipping
        if (!this.isSqueezeFlips || !this.isHighestBidder) {
            this.tableState.setSqueezeVisible({ visible: false });
            return;
        }
        
        let card!: { color: string, id: number, value: any };
        if (this.squeezeStatus === "squeeze_start" || this.squeezeStatus === "squeeze_time") {
            if (this.isBaccarat) {
                if (!this.isSqueezeFlips.blue[0] && this.isHighestBidder.blue)
                    card = { color: "blue", id: 0, value: this.currentTableData.game.cards.player["card1"] };
                else if (!this.isSqueezeFlips.blue[1] && this.isHighestBidder.blue)
                    card = { color: "blue", id: 1, value: this.currentTableData.game.cards.player["card2"] };
                else if (!this.isSqueezeFlips.red[0] && this.isHighestBidder.red && !this.isHighestBidder.blue)
                    card = { color: "red" , id: 0, value: this.currentTableData.game.cards.banker["card1"] };
                else if (!this.isSqueezeFlips.red[1] && this.isHighestBidder.red && !this.isHighestBidder.blue)
                    card = { color: "red" , id: 1, value: this.currentTableData.game.cards.banker["card2"] };
            }
            else if (this.isDragonTiger) {
                if (!this.isSqueezeFlips.blue[0] && this.isHighestBidder.blue)
                    card = { color: "blue", id: 0, value: this.currentTableData.game.cards.dragon };
                else if (!this.isSqueezeFlips.red[0] && this.isHighestBidder.red && !this.isHighestBidder.blue)
                    card = { color: "red" , id: 0, value: this.currentTableData.game.cards.tiger  };
            }
        }
        else if (this.squeezeStatus === "squeezep_start" && this.isHighestBidder.blue) {
            if (!this.isSqueezeFlips.blue[2]) card = { color: "blue", id: 2, value: this.currentTableData.game.cards.player["card3"] };
        }
        else if (this.squeezeStatus === "squeezeb_start" && this.isHighestBidder.red && !this.isHighestBidder.blue) {
            if (!this.isSqueezeFlips.red[2] ) card = { color: "red" , id: 2, value: this.currentTableData.game.cards.banker["card3"] };
        }

        if (!card) {
            this.tableState.setSqueezeVisible({ visible: false });
            return;
        }

        // Initialize the canvas
        this.isFlipped = false;

        this.paper.activate();
        this.paper.project.clear();

        const computedStyle = getComputedStyle(this.squeezeCanvas);
        const styleW = +computedStyle.width!.slice(0, -2);
        const styleH = +computedStyle.height!.slice(0, -2);

        // The back of the card
        const rasterBack = new Raster(`card-back-${ card.color }`);
              rasterBack.rotation = this.isLandscape ? 90 : 0;
              rasterBack.position = new Point(styleW / 2, styleH / 2);
              rasterBack.scale(this.squeezeScale);

        const cardW = (this.isLandscape ? rasterBack.height : rasterBack.width ) * this.squeezeScale;
        const cardH = (this.isLandscape ? rasterBack.width  : rasterBack.height) * this.squeezeScale;
        
        // The front of the card
        const rasterFront = new Raster(`card-table-${ this.getCardImage(card.value) }`);
              rasterFront.pivot = this.isLandscape ? rasterFront.bounds.leftCenter : rasterFront.bounds.topCenter;
              rasterFront.rotation = this.isLandscape ? 90 : 0;
              rasterFront.position = new Point(styleW / 2, (styleH + cardH / 2));
              rasterFront.scale(this.squeezeScale);
              
        // The mask
        const pathBack = new Path.Rectangle(new Rectangle((styleW - cardW) / 2, (styleH - cardH) / 2, cardW, cardH));
              pathBack.clipMask = true;

        const group = new Group([rasterBack, rasterFront, pathBack]);

        // The fingers
        const fingerL = new Raster("card-finger");
              fingerL.scale(0.75);
              fingerL.rotate(135);
        const fingerR = new Raster("card-finger");
              fingerR.scale(0.75);
              fingerR.rotate(-135);
              fingerR.position.x = cardW * 1.05;
        const fingerGroup = new Group([fingerL, fingerR]);
              fingerGroup.position = new Point(styleW / 2, (styleH + cardH) / 2);
              fingerGroup.visible = false;
        
        // The interaction for squeezing
        let startDrag = false;

        const updatePath = (pointY: number) => {
            pathBack.segments[0].point.y = pathBack.segments[3].point.y = (styleH + cardH) / 2 - ((styleH + cardH) / 2 - pointY) / 2;
            pathBack.segments[1].point.y = pathBack.segments[2].point.y = (styleH - cardH) / 2 - ((styleH + cardH) / 2 - pointY) / 2;

            rasterFront.position.y = pointY;
            fingerGroup.position.y = pointY;

            if (pointY < (styleH - cardH) / 2) {
                startDrag = false;
                fingerGroup.visible = true;
                this.isFlipped = true;
            
                pathBack.clipMask = false;
                rasterBack.remove();
                TweenLite.fromTo(rasterFront.scaling, 0.5, { x: 1.5, y: 1.5 }, { x: 1.25, y: 1.25, onComplete: () => {
                    this.isFlipped = true;
                    this.eventBus.$emit(Events.ON_FLIP_CARD, card.color, card.id, card.value);
                }});
            }
        };

        rasterBack.onMouseDown = event => {
            startDrag = true;
            fingerGroup.visible = true;
            updatePath(event.point.y);
        };
        this.paper.tool.onMouseMove = event => {
            if (startDrag) updatePath(event.point.y);
        };
        this.paper.tool.onMouseUp = event => {
            startDrag = false;
            fingerGroup.visible = false;
            
            pathBack.segments[0].point.y = pathBack.segments[3].point.y = (styleH + cardH) / 2;
            pathBack.segments[1].point.y = pathBack.segments[2].point.y = (styleH - cardH) / 2;

            if (!this.isFlipped) rasterFront.position.y = (styleH + cardH) / 2;
        };
    }

    /** Compute to know which card image to show depending on the card string from backend */
    getCardImage(card: string) {
        const suitCase: any = { c: "club", d: "diamond", h: "heart", s: "spade" };
        const valueEquivalent: any = { A: 1, J: 11, Q: 12, K: 13 };

        const suit = card.slice(-1).toLowerCase();
        let value = card.substring(0, card.length - 1);
            value = isNaN(+value) ? valueEquivalent[value] : value;

        return `${ suitCase[suit] }${ value }`;
    }

    checkRoute(search: string) {
        const routePath = this.$route.path;
        return routePath ? (routePath.indexOf(search) !== -1) : false;
    }

// #[Computed] ---------- + ---------- + ----------
    get isBaccarat()    { return this.checkRoute(GameTypes.Baccarat   ); }
    get isDragonTiger() { return this.checkRoute(GameTypes.DragonTiger); }

    get isSqueezeFlips() {
        return this.tableState.isSqueezeFlips;
    }
    get isHighestBidder() {
        return this.tableState.isHighestBidder;
    }
    get squeezeStatus() {
        return this.tableState.squeezeStatus;
    }
}
</script>

<style lang="scss">
#squeeze-board {
    position: fixed;
    z-index: 2;
    bottom: calc(20% + 195px + 10px);
    left: 2.5%;
    width: 95%;
    height: calc(80% - 75px - 195px - 20px);
    
    border-radius: 10px;
    background: rgba(#000000, 0.35);

    #squeeze-canvas[resize] {
        width: 100%;
        height: 100%;
    }

    .rotate-btn {
        position: absolute;
        padding: 2px 10px;
        top: 5px;
        right: 5px;

        border: 1px solid $c-main; 
        border-radius: 5px;
        background-color: rgba($c-main, 0.2);

        font-size: 16px;
        color: $c-main;
    }

    @include land-only {
        bottom: 10%;
        left: 245px;
        width: calc(100% - 245px * 2);
        height: 80%;
    }
}
</style>
