import { IEntity } from './Entity'
import { IPoint, IRectangle, rectInRect } from './Helpers'

export interface ICollidable {
    position: IPoint;
    collisions: ICollidable[];
    collisionRect: IRectangle
}

export function calculateCollisions(entities: IEntity[]) {
    const collidables = getCollidables(entities);
    for(const e1 of collidables){
        e1.collisions = [];
        for(const e2 of collidables){
            if(e1 !== e2 && collidesWith(e1, e2)){
                e1.collisions.push(e2);
                if(!e2.collisions){
                    e2.collisions = [];
                }
                e2.collisions.push(e1);
            }
        }
    }
}

function getCollidables(entities: IEntity[]): ICollidable[] {
    const collidables: ICollidable[] = [];
    for (const e of entities) {
        if (isCollidable(e)) {
            collidables.push(e);
        }
    }
    return collidables;
}

function isCollidable(entity: any): entity is ICollidable{
    return entity.position !== undefined && entity.collisions !== undefined && entity.collisionRect !== undefined; 
}

function collidesWith(entity1: ICollidable, entity2: ICollidable): boolean{
    return rectInRect(entity1.position, entity1.collisionRect, entity2.position, entity2.collisionRect);
}