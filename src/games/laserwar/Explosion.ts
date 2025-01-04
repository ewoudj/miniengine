import { explosionAudio } from '../../Audio';
import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';
import { IPoint, IRectangle, rotate } from '../../Helpers';

const rect: IRectangle = { x: -2.5, y: -2.5, w: 5, h: 5 };

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
        this.model.push({ x: -2.5 + rectPos.x, y: -2.5 + rectPos.y, w: 5, h: 5 });
      }
      this.model.push(rect);
    }
  }
}
