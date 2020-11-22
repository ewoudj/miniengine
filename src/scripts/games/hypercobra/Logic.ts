import { Engine } from '../../Engine';
import { EntityBase, IEntity } from '../../Entity';
import { Level } from './Level';
import { Ship } from './Ship';

export class Logic extends EntityBase {
  private startTime: number = 0;
  private lastTimeCalled: number = 0;
  private level?: Level;

  public update(time: number) {
    if (!this.initialized) {
      this.engine.canvasColor = '#A70';
      this.startTime = time;
      this.level = new Level(this.engine);
      this.engine.add(this.level);
      this.engine.add(new Ship(this.engine));
      this.initialized = true;
      this.lastTimeCalled = time;
    }
    const timeDelta = this.lastTimeCalled - time;
    this.lastTimeCalled = time;
    if (this.level) {
      this.level.position.x = this.level.position.x + timeDelta / 5;
    }
  }
}
