import { Engine } from "../../Engine"
import { EntityBase, IEntity, IText } from "../../Entity"
import { inflateRectangle, IPoint, pointInRect, rectInRect } from '../../Helpers';
import { Menu } from '../../Menu'
import { Ball } from "./Ball"
import { Brick, IBrickDTO } from "./Brick"
import { EditorLogic } from './EditorLogic';
import { GameLogic } from './GameLogic';
import { Level } from './Level';
import { Logo } from './Logo';
import { mainMenu } from "./Menus"

export const colors = [
    '#000', // Black
    '#FFF', // White
    '#F00', // Red
    '#0FF', // Cyan
    '#F0F', // Purple
    '#0F0', // Green
    '#00F', // Blue
    '#FF0', // Yellow
    '#FA0', // Orange
    '#A53', // Brown
    '#F88', // Light red
    '#666', // Dark grey
    '#AAA', // Grey
    '#8F8', // Light green
    '#88F', // Light blue
    '#CCC', // Light grey
 ];

export interface IDrawable {
    draw(context: CanvasRenderingContext2D): void,
    drawShadow(context: CanvasRenderingContext2D): void
}

function isDrawable(entity: any): entity is IDrawable{
    return entity.draw !== undefined && entity.drawShadow !== undefined;
}

export class Logic extends EntityBase {

    public menu: Menu;
    private logo: Logo;
    private activeLogic: ILogic;
    private gameLogic: GameLogic; 
    private editorLogic: EditorLogic;
     
	public constructor(engine: Engine){
        super(engine);
        this.gameLogic = new GameLogic(engine);
        this.editorLogic = new EditorLogic(engine);
        this.activeLogic = this.gameLogic;
		this.initialized = false;
        this.name = 'logic';
        this.menu = new Menu(engine, {
            alignment: 'center',
            engine: this.engine,
            font: 'HeavyData',
            mainMenu,
            position: {
                x: 0,
                y: 0
            }
        });
        this.engine.add(this.menu);
        this.menu.setItems(mainMenu);
        this.logo = this.engine.add(new Logo(this.engine));
        document.addEventListener("keydown", this.keyboardDownHandler.bind(this), false);
        document.addEventListener("keyup", this.keyboardUpHandler.bind(this), false);
    }

    public update (time: number){
        if(!this.initialized){
            this.initialize(time);
            this.initialized = true;
        }
        this.activeLogic.update(time);
        this.texts = this.activeLogic.texts;
    }

    public render(context: CanvasRenderingContext2D): void {
        context.fillStyle = '#008';
        context.fillRect(this.engine.renderer.offsetLeft, this.engine.renderer.offsetTop, this.engine.width * this.engine.renderer.scale, this.engine.height * this.engine.renderer.scale);
        for (const e of this.engine.entities) {
            if (isDrawable(e) && !e.finished) {
                e.drawShadow(context);
            }
        }
        for (const e of this.engine.entities) {
            if (isDrawable(e) && !e.finished) {
                e.draw(context);
            }
        }
    }
    
    public startGame(): void {
        this.activeLogic = this.gameLogic;
        this.engine.canvas.requestPointerLock();
        this.engine.reset();
        this.logo.hide();
        this.menu.hide();
    }

    public pauseGame(): void {
        this.initialized = false;
    }

    public resumeGame(): void {
        this.initialized = false;
    }

    public startEditor(): void {
        this.activeLogic = this.editorLogic;
        this.engine.reset();
        this.logo.hide();
        this.menu.hide();
    }

    public toggleMenu(): void {
        this.logo.toggle();
        this.menu.toggle();
    }

    public loadLevel(levelNumber: number) {
        if(typeof localStorage !== 'undefined'){
            const stringFromStore = localStorage.getItem('level' + levelNumber);
            // assume it is an object that has been stringified
            let level = new Level();
            if (stringFromStore) {
                try {
                    level = JSON.parse(stringFromStore) as Level;
                }
                catch(error){
                    // Parse error, corrupt level, implement some notification mechanism
                    level = this.createNewLevel(level);
                }
            }
            else {
                level = this.createNewLevel(level);
            }
            for(const b of level.bricks){
                this.engine.add(new Brick(this.engine, b));
            }
        }
    }

    private createNewLevel(level: Level) {
        level = new Level();
        level.bricks = this.createBorderBricks();
        return level;
    }

    private createBorderBricks(): IBrickDTO[] {
        const borderWidth = 20;
        const borderColor = '#AAA';
        const result: IBrickDTO[] = [];
        result.push({
            kind: 'Border',
            color: borderColor,
            height: borderWidth,
            indestructable: true,
            position: { x: -borderWidth, y: -borderWidth },
            width: this.engine.width + (2 * borderWidth)
        });
        result.push({
            kind: 'Border',
            color: borderColor,
            height: this.engine.height,
            indestructable: true,
            position: { x: -borderWidth, y: 0 },
            width: borderWidth
        });
        result.push({
            kind: 'Border',
            color: borderColor,
            height: this.engine.height,
            indestructable: true,
            position: { x: this.engine.width, y: 0 },
            width: borderWidth
        });
        result.push({
            kind: 'Border',
            color: borderColor,
            height: borderWidth,
            indestructable: true,
            position: { x: -borderWidth, y: this.engine.height },
            width: this.engine.width + (2 * borderWidth)
        });
        return result;
    }

    private initialize(time: number) {
        this.engine.canvasColor = '#000';
        this.engine.entities = [];
        this.engine.add(this);
        this.activeLogic.initialize(time);
    }

    private keyboardDownHandler (evt: KeyboardEvent) : void {
        this.activeLogic.keyboardDownHandler(evt);
	}

    private keyboardUpHandler (evt: KeyboardEvent) : void {
        this.activeLogic.keyboardUpHandler(evt);
	}
}

export interface ILogic {
    texts: IText[],
    initialize(time: number): void,
    update(time: number): void,
    keyboardDownHandler (evt: KeyboardEvent): void,
    keyboardUpHandler (evt: KeyboardEvent): void
};

