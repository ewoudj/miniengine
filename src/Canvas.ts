import { Engine } from './Engine';
import { IEntity } from './Entity';
import { IPoint, IRectangle } from './Helpers';
import { renderText } from './Text';

const image = new Image();
image.src = 'art.png';
image.onload = () => {
  imageLoaded = true;
};
let imageLoaded: boolean = false;

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
    this.offsetLeft = ((this.engine.canvas.width / this.scale) - (this.engine.width )) / 2;
    this.engine.controller.resize();
  }

  private renderEntity(entity: IEntity): void {
    entity.render(this.context);
    if (entity.model ) {
      this.drawRects(
        { x: entity.position.x, y: entity.position.y },
        entity.model,
        entity.color,
        true
      );
    }
    // if(entity.collisionRect){
    //   this.drawRects(
    //     { x: entity.position.x, y: entity.position.y },
    //     [entity.collisionRect],
    //     '#FF0000',
    //     false
    //   );
    // }
    if(entity.sprites) {
      // Render sprites
      for (const sprite of entity.sprites) {
        if(imageLoaded) {
          this.context.save();
          this.context.imageSmoothingEnabled = false;
          
          const correctX = (sprite.width * 5) / 2;
          const correctY = (sprite.height * 5) / 2;

          this.context.translate(
            (entity.position.x + this.offsetLeft - correctX) * this.scale,
            (entity.position.y + this.offsetTop - correctY) * this.scale
          );
          this.context.scale(5 * this.scale, 5 * this.scale);
          if (sprite.mirroring === 1) {
            this.context.scale(-1, 1);
            this.context.drawImage(
              image,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              -sprite.width,
              0,
              sprite.width,
              sprite.height
            );
          } else if (sprite.mirroring === 2) {
            this.context.scale(1, -1);
            this.context.drawImage(
              image,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              0,
              -sprite.height,
              sprite.width,
              sprite.height
            );
          } else if (sprite.mirroring === 3) {
            this.context.scale(-1, -1);
            this.context.drawImage(
              image,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              -sprite.width,
              -sprite.height,
              sprite.width,
              sprite.height
            );
          } else {
            this.context.drawImage(
              image,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              0,
              0,
              sprite.width,
              sprite.height
            );
          }
          this.context.restore();
        };
      }
    }
    if (entity.texts) {
      for (const t of entity.texts) {
        this.context.font =
          Math.ceil((t.size || 50) * this.scale) + 'px ' + t.font;
        this.context.textAlign = t.alignment;
        this.context.fillStyle = t.color;
        if (t.alignment === 'center') {
          if(t.font === 'SystemFont') {
            renderText(
              t.text.toLocaleLowerCase(), 
              t.color, 
              (t.size / 10) * this.scale, 
              this.context, 
              [ 
                ((this.engine.width / 2) + this.offsetLeft) * this.scale, 
                100 ]// ((t.position.y + this.offsetTop) * this.scale) + ((t.size / 10) * this.scale) ]
              );
          }
          else{
            this.context.fillText(
              t.text,
              Math.ceil((this.engine.width / 2) * this.scale) + this.offsetLeft,
              Math.ceil(t.position.y * this.scale) + this.offsetTop
            );
          }
        } else {
          if(t.font === 'SystemFont') {
          renderText(
            t.text.toLocaleLowerCase(), 
            t.color, 
            (t.size / 10) * this.scale, 
            this.context, 
            [ 
              (t.position.x + this.offsetLeft) * this.scale, 
              ((t.position.y - 40) + this.offsetTop ) * this.scale ]
            );
          }
          else {
            this.context.fillText(
              t.text,
              Math.ceil(t.position.x * this.scale) + this.offsetLeft,
              Math.ceil(t.position.y * this.scale) + this.offsetTop
            );
          }
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
    this.context.save();
    if(fill) {
      this.context.fillStyle = color;
    }
    else {
      this.context.strokeStyle = color;
    }
    this.context.scale(this.scale, this.scale);
    this.context.translate(offset.x + this.offsetLeft, offset.y + this.offsetTop);
    rects.forEach(r => this.drawRect(r, fill));
    this.context.restore();
  }

  private drawRect(
    rect: IRectangle,
    fill: boolean
  ): void {
    if (fill) {
      this.context.fillRect(
        rect.x,
        rect.y,
        rect.w,
        rect.h
      );
      this.context.fillRect(
        rect.x,
        rect.y,
        rect.w,
        rect.h
      );
    } else {
      this.context.strokeRect(
        rect.x ,
        rect.y,
        rect.w,
        rect.h
      );

    }
  }
}