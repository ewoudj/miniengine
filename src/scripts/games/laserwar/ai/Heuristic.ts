import { IEntity } from '../../../Entity'
import { distance, IPoint, rotate } from '../../../Helpers'
import { GameEntity } from '../GameEntity'
import { LaserBeam } from '../LaserBeam'
import { Star } from '../Star'

export interface IControllerState {
	mousePosition: IPoint;
	shoot: boolean;
}

 export function heuristic (gameEntity:GameEntity): IControllerState{
	const previousPosition = gameEntity.position;
	// AI
	// Priority 1: staying alive
	// Avoid collisions
	let nearestEntityDistance = Infinity;
	let nearestEntity: IEntity | null = null;
	let nearestStarDistance = Infinity;
	let nearestStar = null;
	let otherShip = null;
	let evading = false;
	// Determine the nearest object  
	for(const e of gameEntity.engine.entities){
		const ownedLaserBeam = e instanceof LaserBeam ? e.owner === gameEntity : false;
		if(e !== gameEntity && !ownedLaserBeam && e.position){
			const d = distance(gameEntity.position, e.position);
			if(d < nearestEntityDistance ){ 
				nearestEntityDistance = d;
				nearestEntity = e;
			}
			if(e instanceof Star && e.colorIndex !== gameEntity.colorIndex && d < nearestStarDistance){ 
				nearestStarDistance = d;
				nearestStar = e;
			}
			if(e instanceof GameEntity && ( e.type === 'player' || e.type === 'computer' )){
				otherShip = e;
			}
		}
	}
	if( gameEntity.position  && nearestEntityDistance < 50 || gameEntity.evadingTime > 0){
		if(nearestEntity != null) {
			const deltax = nearestEntity.position.x - gameEntity.position.x;
			const deltay = nearestEntity.position.y - gameEntity.position.y;
			gameEntity.targetVector = { 
				x: (deltax) < 0 ? 1 : 1,
				y: (deltay) < 0 ? 1 : 1
				
			};
			if(!gameEntity.evadingTime){
				gameEntity.evadingTime = 3;
			}
			gameEntity.evadingTime--;
			gameEntity.mousePosition = rotate(gameEntity.position, nearestEntity.position, -5);
			evading = true;
		}
	}
	// Priority 2: 
	// Select target
	let target:IEntity | null = null;
	if(otherShip && !otherShip.finished){
		target = otherShip;
	}
	if(!target){
		target = nearestStar;
	}
	if(target){                    
		const deltax = target.position.x - gameEntity.position.x;
		const deltay = target.position.y - gameEntity.position.y;
		gameEntity.targetVector = { 
			x: (deltax) < 0 ? -1 : 1,
			y: (deltay) < 0 ? -1 : 1
			
		};
		if(!evading){
			const movey = !(deltay < 10 && deltay > -10);
			const movex = !(deltax < 80 && deltax > -80);
			const reversex = (deltax < 60 && deltax > -60);
			gameEntity.mousePosition = {
				x: gameEntity.position.x + ( gameEntity.targetVector.x * (movex ? 100 : (reversex ? -100 : 0 ) ) ),
				y: gameEntity.position.y + ( gameEntity.targetVector.y * (movey ? 100 : 0) )
			};
		}
		if(gameEntity.position.x === previousPosition.x && gameEntity.direction !== gameEntity.targetVector.x){
			gameEntity.direction = gameEntity.targetVector.x;
		}
		// Only shoot when
		// - the target is near (y)
		// - the ship is pointed in the right direction
		gameEntity.shoot = ((deltay < 40 && deltay > -40) && (gameEntity.direction === gameEntity.targetVector.x));
	}
	return {
		mousePosition: gameEntity.mousePosition,
		shoot: gameEntity.shoot
	};
};