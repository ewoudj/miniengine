import { explosionAudio } from '../../Audio';
import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';
import { IPoint, IRectangle, rotate } from '../../Helpers';

const rect: IRectangle = { x: -5, y: -5, w: 10, h: 10 };

export class Explosion extends EntityBase {
  private duration: number = 0;
  private audioDone: boolean = false;

  public constructor(engine: Engine, position: IPoint) {
    super(engine);
    this.color = '#FFF';
    this.position = position;
    this.audioDone = false;
  }

  public render() {
    this.renderExplosion(this.duration, !this.audioDone);
    this.audioDone = true;
  }

  public update() {
    this.duration++;
    if (this.duration > 10) {
      this.finished = true;
    }
  }

  private renderExplosion(duration: number, sound: boolean) {
    if (sound) {
      explosionAudio.play();
    }
    if (duration % 2) {
      const currentPosition = { x: 0 - 4 * duration, y: 0 };
      this.model = [];
      for (let i = 0; i < 4; i++) {
        const rectPos = rotate(currentPosition, { x: 0, y: 0 }, i * 90);
        this.model.push({ x: -5 + rectPos.x, y: -5 + rectPos.y, w: 10, h: 10 });
      }
      this.model.push(rect);
    }
  }
}
