import { EntityBase } from '../../Entity';
import { Ship } from './Ship';
import { TextEntity } from './Text';

export class Logic extends EntityBase {

  public update(time: number) {
    if (!this.initialized) {
      this.engine.canvasColor = '#000';
      for (let c = 0, l = 100; c < l; c++) {
        this.engine.add(
          new Ship(this.engine, {
            x: this.engine.width / 2,
            y: this.engine.height / 2,
          })
        );
      }
      this.engine.add(
        new TextEntity(this.engine, [
          {
            alignment: 'start',
            color: '#FFF',
            font: 'CBM64',
            text: 'Ewoud is de beste',
            position: {
              x: this.engine.width / 2 - 300,
              y: this.engine.height / 2,
            },
            size: 50,
          },
        ])
      );
      this.initialized = true;
    }
    let i = 0;
    const halfWidth = this.engine.width / 2;
    const halfHeight = this.engine.height / 2;
    for (const entity of this.engine.entities) {
      if (entity instanceof Ship) {
        const lightnessRed = Math.floor(
          128 + 127 * Math.sin((time + i * 300) / 800)
        );
        const lightnessGreen = Math.floor(
          128 + 127 * Math.cos((time + i * 300) / 800)
        );
        const lightnessBlue = Math.floor(
          128 + 127 * Math.cos((time + i * 250) / 400)
        );
        entity.color = `rgb(${lightnessRed}, ${lightnessGreen}, ${lightnessBlue})`;
        entity.position = {
          x: halfWidth + halfWidth * Math.sin((time + i * 300) / 800) * 0.8,
          y: halfHeight + halfHeight * Math.sin((time + i * 200) / 1000) * 0.8,
        };
        i++;
      }
      if (entity instanceof TextEntity) {
        const halfWidthText = halfWidth - 300;
        entity.texts[0].position = {
          x:
            halfWidthText +
            (halfWidthText / 2) * Math.sin((time + i * 100) / 600) * 6,
          y:
            halfHeight +
            (halfHeight / 13) * Math.sin((time + i * 100) / 900) * 3,
        };
      }
    }
  }
}
