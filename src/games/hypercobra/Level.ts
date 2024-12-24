import { EntityBase } from '../../Entity';

export class Level extends EntityBase {
  private combinedWidth: number = 0;

  public update() {
    if (this.position.x > this.combinedWidth) {
      this.initialized = false;
    }
    if (!this.initialized) {
      this.initialized = true;
      this.model = [];
      this.combinedWidth = 0;
      for (let i = 0, l = 50; i < l; i++) {
        const randomWidth = this.random(1, 8) * 100;
        const randomHeightBlockCount = this.random(1, 6);
        const randomHeight = randomHeightBlockCount * 100;
        let randomTop = this.random(0, 6 - randomHeightBlockCount) * 100;
        // get previous rect
        const previous = this.model[this.model.length - 1];
        if (previous) {
          if (previous.y >= randomHeight + randomTop) {
            randomTop = previous.y - randomHeight + 100;
          } else if (randomTop >= previous.h + previous.y) {
            randomTop = previous.h + previous.y - 100;
          }
        }
        this.model.push({
          x: this.combinedWidth,
          y: randomTop,
          w: randomWidth,
          h: randomHeight,
        });
        this.combinedWidth += randomWidth - 1;
      }
      this.color = '#000';
      this.position = this.position || { x: 0, y: 0 };
    }
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
