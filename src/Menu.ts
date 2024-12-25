import { afterInput } from './Audio';
import { Engine } from './Engine';
import { EntityBase, IText, TextAlignment } from './Entity';
import { SystemFont } from './text';

export interface IMenuItem {
  text: string;
  getText?: () => string;
  onClick?: (engine: Engine) => void;
}

export class Menu extends EntityBase {
  public alignment: TextAlignment = 'start';
  public color: string = '#AAA';
  public font: string = SystemFont;
  public fontSize: number = 50;
  public lineSpacing: number = 10;
  public topMost: boolean = true;
  public mainMenu: IMenuItem[] = [];

  private selectedColor: string = '#FFF';
  private ignoreNextButtonUp: boolean = false;
  private selected: IText | null = null;

  public constructor(engine: Engine, init: Partial<Menu>) {
    super(engine);
    Object.assign(this, init);
    this.setItems(this.mainMenu);

    window.addEventListener('touchend', ev => {
      for (let i = 0; i < ev.changedTouches.length; i++) {
        let t = this.getItem(
          (ev.changedTouches[i].clientY - engine.renderer.offsetTop) /
            engine.renderer.scale
        );
        if (t && t.onClick) {
          afterInput();
          t.onClick(this.engine);
        }
      }
    });
  }

  public onMouseUp(): void {
    if (this.ignoreNextButtonUp) {
      this.ignoreNextButtonUp = false;
    } else {
      if (this.selected && this.selected.onClick) {
        this.selected.onClick(this.engine);
      }
    }
  }

  public setItems(items: IMenuItem[]) {
    if (this.engine.controller.buttonDown) {
      this.ignoreNextButtonUp = true;
    }
    this.texts = [];
    let i = 0;
    for (const item of items) {
      let text = item.text;
      if (item.getText) {
        text = item.getText();
      }
      this.texts.push({
        alignment: this.alignment,
        font: this.font,
        color: this.color,
        size: this.fontSize,
        text,
        onClick: item.onClick,
        position: {
          x: 0,
          y: this.engine.height / 3 + i * (this.fontSize + this.lineSpacing),
        },
      });
      i++;
    }
  }

  public show(items: IMenuItem[]) {
    if (this.finished) {
      this.finished = false;
      if (!this.engine.contains(this)) {
        this.engine.add(this);
      }
      this.gotoRoot();
    }
    if (items) {
      this.setItems(items);
    }
  }

  public toggle() {
    if (this.finished) {
      this.finished = false;
      if (!this.engine.contains(this)) {
        this.engine.add(this);
      }
      this.gotoRoot();
    } else {
      this.finished = true;
    }
  }

  public hide() {
    this.finished = true;
  }

  public update() {
    if (this.mousePosition && this.texts) {
      // Calculate item on the same height as the mouse
      this.select(this.getItem(this.mousePosition.y));
    }
  }

  public getItem(y: number): IText | null {
    let result = null;
    const index =
      Math.floor(
        (y - this.engine.height / 3) / (this.fontSize + this.lineSpacing)
      ) + 1;
    if (index > -1 && index < this.texts.length && this.texts[index].onClick) {
      result = this.texts[index];
    }
    return result;
  }

  private select(entity: IText | null) {
    if (this.selected !== entity) {
      if (this.selected) {
        this.selected.color = this.color;
      }
      this.selected = entity;
      if (this.selected) {
        this.selected.color = this.selectedColor;
      }
    }
  }

  private gotoRoot() {
    this.setItems(this.mainMenu);
  }
}
