export interface IPoint {
  x: number;
  y: number;
}

export interface IRectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rotate(point: IPoint, center: IPoint, angle: number): IPoint {
  // convert angle to radians
  angle = (angle * Math.PI) / 180.0;
  // get coordinates relative to center
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  // calculate angle and distance
  const a = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  // calculate new angle
  const a2 = a + angle;
  // calculate new coordinates
  const dx2 = Math.cos(a2) * dist;
  const dy2 = Math.sin(a2) * dist;
  // return coordinates relative to top left corner
  // return { x: Math.ceil(dx2 + center.x), y: Math.ceil(dy2 + center.y) };
  return { x: dx2 * 1.4 + center.x, y: dy2 + center.y };
}

export function distance(pointA: IPoint, pointB: IPoint): number {
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
  );
}

export function ceilPoint(point: IPoint): IPoint {
  return {
    x: Math.ceil(point.x),
    y: Math.ceil(point.y),
  };
}

export function rectInRect(
  offsetA: IPoint,
  rectA: IRectangle,
  offsetB: IPoint,
  rectB: IRectangle
): boolean {
  if (offsetA && rectA && offsetB && rectB) {
    const tl = { x: rectA.x + offsetA.x, y: rectA.y + offsetA.y };
    const tr = { x: rectA.x + rectA.w + offsetA.x, y: rectA.y + offsetA.y };
    const bl = { x: rectA.x + offsetA.x, y: rectA.y + rectA.h + offsetA.y };
    const br = {
      x: rectA.x + rectA.w + offsetA.x,
      y: rectA.y + rectA.h + offsetA.y,
    };
    return (
      pointInRect(tl, offsetB, rectB) ||
      pointInRect(tr, offsetB, rectB) ||
      pointInRect(bl, offsetB, rectB) ||
      pointInRect(br, offsetB, rectB)
    );
  }
  return false;
}

export function pointInRect(
  point: IPoint,
  offset: IPoint,
  rect: IRectangle
): boolean {
  return (
    point.x >= rect.x + offset.x &&
    point.x <= rect.x + offset.x + rect.w &&
    point.y >= rect.y + offset.y &&
    point.y <= rect.y + offset.y + rect.h
  );
}

export function lineIntersect(a: IPoint[], b: IPoint[]): IPoint | undefined {
  return checkIntersection(
    a[0].x,
    a[0].y,
    a[1].x,
    a[1].y,
    b[0].x,
    b[0].y,
    b[1].x,
    b[1].y
  );
}

function checkIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): IPoint | undefined {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
  if (denom !== 0) {
    const uA = numeA / denom;
    const uB = numeB / denom;

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      const point = {
        x: x1 + uA * (x2 - x1),
        y: y1 + uA * (y2 - y1),
      };
      return point;
    }
  }
}

export function inflateRectangle(
  rectangle: IRectangle,
  amount: number
): IRectangle {
  return {
    h: rectangle.h + amount * 2,
    w: rectangle.w + amount * 2,
    x: rectangle.x - amount,
    y: rectangle.y - amount,
  };
}

export function moveRectangle(
  rectangle: IRectangle,
  direction: IPoint
): IRectangle {
  return {
    h: rectangle.h,
    w: rectangle.w,
    x: rectangle.x + direction.x,
    y: rectangle.y + direction.y,
  };
}
