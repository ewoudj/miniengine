// import { saveAs } from "file-saver"
import { Engine } from '../../Engine';
import { IText } from '../../Entity';
import {
  inflateRectangle,
  IPoint,
  pointInRect,
  rectInRect,
} from '../../Helpers';
import { Ball } from './Ball';
import { Brick, IBrickDTO } from './Brick';
import { Level } from './Level';
import { colors, ILogic, Logic } from './Logic';

const downloadAnchor = document.createElement('a');

export class EditorLogic implements ILogic {
  public texts: IText[] = [];
  private engine: Engine;
  private gridSize = 20;
  private brickwidth = 40;
  private brickHeight = 20;
  private batWidth = 100;
  private batColor = '#FFF';
  private buttonDown = false;
  private level = 0;
  private newBrick: Brick; // New brick acts as the cursor

  public constructor(engine: Engine) {
    this.engine = engine;
    this.newBrick = new Brick(this.engine, {
      color: '#F00',
      engine: this.engine,
      width: this.brickwidth,
      height: this.brickHeight,
      position: { x: 0, y: 0 },
    });
  }

  public initialize(time: number): void {
    this.buttonDown = false;
    (this.engine.logic as Logic).loadLevel(this.level);
    this.newBrick = new Brick(this.engine, {
      color: '#F00',
      engine: this.engine,
      width: this.brickwidth,
      height: this.brickHeight,
      position: { x: 0, y: 0 },
    });
    this.engine.add(this.newBrick);
  }

  public update(time: number): void {
    const c = this.engine.controller;
    if (c.absoluteController) {
      this.newBrick.position = {
        x: c.mousePosition.x - (c.mousePosition.x % this.gridSize),
        y: c.mousePosition.y - (c.mousePosition.y % this.gridSize),
      };
    }
    let brickOver = this.brickAtPoint(c.mousePosition);
    const overlap = this.brickOverlap(this.newBrick);
    if (brickOver === this.newBrick) {
      brickOver = null;
    }
    if (brickOver || overlap) {
      this.newBrick.finished = true;
    } else {
      if (!this.engine.contains(this.newBrick)) {
        this.newBrick.finished = false;
        this.engine.add(this.newBrick);
      }
    }
    if (this.buttonDown && !c.buttonDown) {
      if (brickOver) {
        brickOver.finished = true;
      } else {
        this.newBrick = new Brick(this.engine, {
          kind: this.newBrick.kind,
          color: this.newBrick.color,
          engine: this.engine,
          width: this.newBrick.width,
          height: this.newBrick.height,
          indestructable: this.newBrick.indestructable,
          position: {
            x: this.newBrick.position.x,
            y: this.newBrick.position.x,
          },
        });
        this.engine.add(this.newBrick);
      }
      this.saveLevel();
    }
    this.buttonDown = c.buttonDown;
  }

  public keyboardDownHandler(evt: KeyboardEvent): void {
    evt = evt || window.event;
    const keyCode = evt.keyCode || evt.which;
    // M
    if (keyCode === 77) {
      const l = this.engine.logic as Logic;
      l.toggleMenu();
    }
  }

  public keyboardUpHandler(evt: KeyboardEvent): void {
    evt = evt || window.event;
    const keyCode = evt.keyCode || evt.which;
    // 1-8 (with or without shift) switch color of brick
    if (keyCode >= 49 && keyCode <= 56) {
      this.newBrick.kind = 'Brick';
      this.newBrick.indestructable = false;
      this.newBrick.color = colors[keyCode - 49 + (evt.shiftKey ? 8 : 0)];
      this.newBrick.width = this.brickwidth;
      this.newBrick.height = this.brickHeight;
      this.newBrick.refresh();
    }
    // 9 brick of death
    if (keyCode === 57) {
      this.newBrick.kind = 'Death';
      this.newBrick.indestructable = true;
      this.newBrick.width = this.brickwidth;
      this.newBrick.height = this.brickHeight;
      this.newBrick.refresh();
    } else if (evt.key === 'b') {
      // load local file
      this.newBrick.kind = 'Bat';
      this.newBrick.indestructable = true;
      this.newBrick.color = this.batColor;
      this.newBrick.width = this.batWidth;
      this.newBrick.height = this.brickHeight;
      this.newBrick.refresh();
    } else if (keyCode === 86 || keyCode === 72) {
      // v or h toggle brick orientation horizontal / vertical
      const w = this.newBrick.width;
      this.newBrick.width = this.newBrick.height;
      this.newBrick.height = w;
      this.newBrick.refresh();
    } else if (evt.key === 'l') {
      // load local file
      this.loadLevels();
    } else if (evt.key === 's') {
      // save file locally
      let level = 0;
      const levels = [];
      while (localStorage.getItem('level' + level)) {
        levels.push(localStorage.getItem('level' + level));
        level++;
      }
      this.saveText(JSON.stringify(levels), 'levels.json');
    } else if (evt.key === 'PageUp') {
      this.level--;
      if (this.level < 0) {
        this.level = 0;
      }
      (this.engine.logic as Logic).startEditor();
    } else if (evt.key === 'PageDown') {
      this.level++;
      (this.engine.logic as Logic).startEditor();
    } else if (evt.key === 'Delete' && evt.ctrlKey === true) {
      this.clearLevel();
      (this.engine.logic as Logic).startEditor();
    }
  }

  private loadLevels() {
    const updateElement = document.createElement('input');
    updateElement.type = 'file';
    updateElement.addEventListener(
      'change',
      inputChangeEvent => {
        const fileList = updateElement.files;
        if (fileList && fileList.length) {
          const file = fileList[0];
          const reader = new FileReader();
          reader.onload = loadEvent => {
            const contents = reader.result;
            const levels = JSON.parse((contents || '').toString());
            let levelIndex = 0;
            for (levelIndex = 0; levelIndex < levels.length; levelIndex++) {
              localStorage.setItem(
                'level' + levelIndex.toString(),
                levels[levelIndex]
              );
            }
            while (localStorage.getItem('level' + levelIndex.toString())) {
              localStorage.removeItem('level' + levelIndex.toString());
              levelIndex++;
            }
            this.level = 0;
            (this.engine.logic as Logic).startEditor();
          };
          reader.readAsText(file);
        }
      },
      false
    );
    updateElement.click();
  }

  private saveText(text: string, filename: string) {
    downloadAnchor.setAttribute(
      'href',
      'data:text/plain;charset=utf-u,' + encodeURIComponent(text)
    );
    downloadAnchor.setAttribute('download', filename);
    downloadAnchor.click();
  }

  private brickAtPoint(point: IPoint): Brick | null {
    let result = null;
    for (const b of this.engine.entities) {
      if (b instanceof Brick) {
        if (
          pointInRect(point, b.position, {
            x: 0,
            y: 0,
            w: b.width,
            h: b.height,
          })
        ) {
          result = b;
          break;
        }
      }
    }
    return result;
  }

  private brickOverlap(brick: Brick): Brick | null {
    let result = null;
    for (const b of this.engine.entities) {
      if (b instanceof Brick) {
        if (
          b !== brick &&
          rectInRect(
            brick.position,
            inflateRectangle(
              { x: 0, y: 0, w: brick.width, h: brick.height },
              -1
            ),
            b.position,
            { x: 0, y: 0, w: b.width, h: b.height }
          )
        ) {
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
    for (const e of this.engine.entities) {
      if (e instanceof Brick && e !== this.newBrick && !e.finished) {
        valueToStore.bricks.push(e.toJSON());
      }
    }
    localStorage.setItem('level' + this.level, JSON.stringify(valueToStore));
  }
}
