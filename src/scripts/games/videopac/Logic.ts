import { Engine } from '../../Engine';
import { EntityBase, IEntity } from '../../Entity';

export class Logic extends EntityBase {
  private startTime: number = 0;

  public update(time: number) {
    if (!this.initialized) {
      this.engine.canvasColor = '#000';
      this.startTime = time;
      // this.engine.add(new TextEntity(this.engine ,[{
      //         alignment: 'start',
      //         color: '#FFF',
      //         font: 'CBM64',
      //         text: 'Ewoud is de beste',
      //         position: {
      //             x: this.engine.width / 2 - 300,
      //             y: this.engine.height / 2
      //         },
      //         size: 50
      //     }]
      // ));
      this.initialized = true;
    }

    // for(const entity of this.engine.entities){
    //     if(entity instanceof TextEntity){
    //         const halfWidthText = halfWidth - 300;
    //         entity.texts[0].position = {
    //             x: halfWidthText + (((halfWidthText / 2) * ((Math.sin( (time + (i * 100)) / 600))) * 6)),
    //             y: halfHeight + (((halfHeight / 13 ) * (Math.sin( (time + (i * 100)) / 900))) * 3),
    //         }
    //     }
    // }
  }
}
