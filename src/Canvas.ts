import { Engine } from './Engine';
import { IEntity } from './Entity';
import { IPoint, IRectangle } from './Helpers';

export class CanvasRenderer {
  public offsetLeft: number = 0;
  public offsetTop: number = 0;
  public scale: number = 1;
  private engine: Engine;
  private context: CanvasRenderingContext2D;

  public constructor(engine: Engine) {
    this.engine = engine;
    this.context = this.engine.canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    window.onresize = this.resize.bind(this);
    this.resize();
  }

  public render(): void {
    const canvas = this.engine.canvas;
    if (
      canvas.width !== window.innerWidth ||
      canvas.height !== window.innerHeight
    ) {
      this.resize();
    }
    this.context.fillStyle = this.engine.canvasColor;
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    // Render
    const topMost: IEntity[] = [];
    this.engine.entities.forEach(e => {
      if (e.topMost) {
        topMost.push(e);
      } else {
        this.renderEntity(e);
      }
    });
    topMost.forEach(e => {
      this.renderEntity(e);
    });
    this.engine.controller.render(this.context);
  }

  private resize(): void {
    const canvas = this.engine.canvas;
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Calculate optimum scale
    const scaleh = canvas.width / this.engine.width;
    const scalev = canvas.height / this.engine.height;
    this.scale = scaleh < scalev ? scaleh : scalev;
    this.offsetTop = Math.ceil(
      (canvas.height - this.engine.height * this.scale) / 2
    );
    if (this.engine.touchable && this.offsetTop > 40) {
      this.offsetTop = 40;
    }
    this.offsetLeft = Math.ceil(
      (this.engine.canvas.width - this.engine.width * this.scale) / 2
    );
    this.engine.controller.resize();
  }

  private renderEntity(entity: IEntity): void {
    entity.render(this.context);
    if (entity.model) {
      this.drawRects(
        { x: entity.position.x, y: entity.position.y },
        entity.model,
        entity.color,
        true
      );
    }
    if (entity.texts) {
      for (const t of entity.texts) {
        this.context.font =
          Math.ceil((t.size || 50) * this.scale) + 'px ' + t.font;
        this.context.textAlign = t.alignment;
        this.context.fillStyle = t.color;
        if (t.alignment === 'center') {
          this.context.fillText(
            t.text,
            Math.ceil((this.engine.width / 2) * this.scale) + this.offsetLeft,
            Math.ceil(t.position.y * this.scale) + this.offsetTop
          );
        } else {
          this.context.fillText(
            t.text,
            Math.ceil(t.position.x * this.scale) + this.offsetLeft,
            Math.ceil(t.position.y * this.scale) + this.offsetTop
          );
        }
      }
    }
  }

  private drawRects(
    offset: IPoint,
    rects: IRectangle[],
    color: string,
    fill: boolean
  ): void {
    rects.forEach(r => this.drawRect(offset, r, color, fill));
  }

  private drawRect(
    offset: IPoint,
    rect: IRectangle,
    color: string,
    fill: boolean
  ): void {
    if (fill) {
      this.context.fillStyle = color;
      this.context.fillRect(
        (rect.x + offset.x) * this.scale + this.offsetLeft,
        (rect.y + offset.y) * this.scale + this.offsetTop,
        rect.w * this.scale,
        (rect.h + 2) * this.scale
      );
    } else {
      this.context.strokeStyle = color;
      this.context.strokeRect(
        (rect.x + offset.x) * this.scale,
        (rect.y + offset.y) * this.scale,
        rect.w * this.scale,
        rect.h * this.scale
      );
    }
  }
}
