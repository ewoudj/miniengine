import { EntityBase} from '../../Entity';

export class Logic extends EntityBase {

  public update() {
    if (!this.initialized) {
      this.engine.canvasColor = '#000';
      // this.engine.add(new TextEntity(this.engine ,[{
      //         alignment: 'start',
      //         color: '#FFF',
      //         font: SystemFont,
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
