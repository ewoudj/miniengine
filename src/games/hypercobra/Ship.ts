import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';

export class Ship extends EntityBase {
  public constructor(engine: Engine) {
    super(engine);
    this.model = [
      { x: -20, y: -15, w: 20, h: 10 },
      { x: -10, y: -5, w: 30, h: 10 },
      { x: -20, y: 5, w: 20, h: 10 },
    ];
    this.color = '#F00';
    this.position = { x: 30, y: 30 };
  }
}
