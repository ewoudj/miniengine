// import { saveAs } from "file-saver"
import { Engine } from '../../Engine';
import { inflateRectangle, IPoint, pointInRect, rectInRect } from '../../Helpers';
import { Ball } from './Ball';
import { Brick, IBrickDTO } from './Brick';
import { Level } from './Level';
import { colors, ILogic, Logic } from './Logic';

const downloadAnchor = document.createElement('a');

export class EditorLogic implements ILogic {

    private engine: Engine;
    private newBrick: Brick; // New brick acts as the cursor
    private gridSize = 20;
    private brickwidth = 40;
    private brickHeight = 20;
    private buttonDown = false;
    private level = 1;

    public constructor(engine: Engine){
        this.engine = engine;
    }

    public initialize(time: number):void {
        this.buttonDown = false;
        (this.engine.logic as Logic).loadLevel(this.level);
        this.newBrick = new Brick({
            color: '#F00',
            engine: this.engine,
            width: this.brickwidth,
            height: this.brickHeight,
            position: {x: 0, y: 0}
        });
        this.engine.add(this.newBrick);
    }
    
    public update(time: number):void {
        const c = this.engine.controller;
        if(c.absoluteController){
            this.newBrick.position = {
                x: c.mousePosition.x - (c.mousePosition.x % this.gridSize),
                y: c.mousePosition.y - (c.mousePosition.y % this.gridSize)
            };
        }
        let brickOver = this.brickAtPoint(c.mousePosition);
        const overlap = this.brickOverlap(this.newBrick);
        if(brickOver === this.newBrick){
            brickOver = null;
        }
        if(brickOver || overlap){
            this.newBrick.finished = true;
        }
        else {
            if(!this.engine.contains(this.newBrick)){
                this.newBrick.finished = false;
                this.engine.add(this.newBrick);
            }
        }
        if(this.buttonDown && !c.buttonDown){
            if(brickOver){
                brickOver.finished = true;
            }
            else {
                this.newBrick = new Brick({
                    color: this.newBrick.color,
                    engine: this.engine,
                    width: this.newBrick.width,
                    height: this.newBrick.height,
                    position: {x: this.newBrick.position.x, y: this.newBrick.position.x}
                });
                this.engine.add(this.newBrick);
            }
            this.saveLevel();
        }
        this.buttonDown = c.buttonDown;
    }
    
    public keyboardDownHandler (evt: KeyboardEvent) : void {
        evt = evt || window.event;
		const keyCode = evt.keyCode || evt.which;
        // M
        if (keyCode === 77) {
            const l = this.engine.logic as Logic;
            l.toggleMenu();
        }
    }
    
    public keyboardUpHandler (evt: KeyboardEvent) : void {
        evt = evt || window.event;
		const keyCode = evt.keyCode || evt.which;
		// 1-8 (with or without shift) switch color of brick
		if (keyCode >= 49 && keyCode <= 56) { 
            this.newBrick.color = colors[keyCode - 49 + (evt.shiftKey ? 8 : 0)];
            this.newBrick.refresh();
        }
        // v or h toggle brick orientation horizontal / vertical
        else if (keyCode === 86 || keyCode === 72) { 
            const w = this.newBrick.width;
            this.newBrick.width = this.newBrick.height;
            this.newBrick.height = w;
            this.newBrick.refresh();
        }
        // load local file
        else if(evt.key === 'l'){
            const i = document.createElement('input');
            i.type = 'file';
            i.addEventListener('change', (inputChangeEvent) => {
                const fileList = i.files;
                if(fileList && fileList.length){
                    const file = fileList[0];
                    const reader = new FileReader();
                    reader.onload = (loadEvent) => {
                        const contents = reader.result;
                        const levels = JSON.parse(contents);
                        let levelIndex = 0;
                        for( levelIndex = 0; levelIndex < levels.length; levelIndex++){
                            localStorage.setItem('level' + levelIndex + 1, levels[levelIndex]);
                        }
                        while(localStorage.getItem('level' + levelIndex + 1)){
                            localStorage.removeItem('level' + levelIndex + 1);
                            levelIndex++;
                        }
                        this.level = 1;
                        (this.engine.logic as Logic).startEditor();
                    };
                    reader.readAsText(file);
                }
            }, false);
            i.click();
        }
        // save file locally
        else if(evt.key === 's'){
            let level = 1;
            const levels = [];
            while(localStorage.getItem('level' + level)){
                levels.push(localStorage.getItem('level' + level));
                level++;
            }
            this.saveText(JSON.stringify(levels), 'levels.json')
        }
        else if(evt.key === 'PageDown'){
            this.level--;
            if(this.level < 1){
                this.level = 1;
            }
            (this.engine.logic as Logic).startEditor();
        }
        else if(evt.key === 'PageUp'){
            this.level++;
            (this.engine.logic as Logic).startEditor();
        }
        else if(evt.key === 'Delete' && evt.ctrlKey === true){
            this.clearLevel();
            (this.engine.logic as Logic).startEditor();
        }
    }

    private saveText(text: string, filename: string){
        downloadAnchor.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent( text ));
        downloadAnchor.setAttribute('download', filename);
        downloadAnchor.click();
    }

    private brickAtPoint(point:IPoint) : Brick | null {
        let result = null;
        for(const b of this.engine.entities){
            if(b instanceof Brick){
                if(pointInRect(point, b.position, {x: 0, y:0, w: b.width, h: b.height})){
                    result = b;
                    break;
                }
            }
        }
        return result;
    }

    private brickOverlap(brick:Brick) : Brick | null {
        let result = null;
        for(const b of this.engine.entities){
            if(b instanceof Brick){
                if(b !== brick && rectInRect(brick.position, inflateRectangle( { x:0, y:0, w: brick.width, h: brick.height}, -1 ), b.position, {x: 0, y:0, w: b.width, h: b.height})){
                    result = b;
                    break;
                }
            }
        }
        return result;
    }

    private clearLevel() {
        localStorage.setItem('level' + this.level, '');
    }

    private saveLevel() {
        const valueToStore = new Level();
        for(const e of this.engine.entities){
            if(e instanceof Brick && e !== this.newBrick){
                valueToStore.bricks.push(e.toJSON());
            }
        }
        localStorage.setItem('level' + this.level, JSON.stringify(valueToStore));
    }

}