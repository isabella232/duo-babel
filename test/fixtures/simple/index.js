
// imports
const PI = 3.14;
let { pow } = Math;

/**
 * calculate area for a circle
 *
 * @param {Number} radius
 * @return {Number}
 */
export function area(radius) {
  return pow(PI * radius, 2);
}
