import { Engine } from "../../Engine"
import { EntityBase, IEntity } from "../../Entity"
import { IRectangle } from '../../Helpers'

export class Ship extends EntityBase { 
	
	public constructor(init?:Partial<Ship>) {
		super(init);
		this.model = [
			{x: -20, y: -15, w: 20, h: 10},
			{x: -10, y: -5, w: 30, h: 10},
			{x: -20, y: 5, w: 20, h: 10}
		];
		this.color = '#F00';
		this.position = {x:30, y:30};
	}
}

