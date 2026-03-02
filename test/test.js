/**
 * A sample module for testing JSDoc generation.
 * @module Math
 */

/**
 * Calculates the area of a rectangle.
 * 
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @returns {number} The total area.
 * 
 * @example
 * // returns 20
 * const area = calculateArea(4, 5);
 */
function calculateArea(width, height) {
  return width * height;
}

/**
 * A class representing a simple User.
 */
class User {
  /**
   * Create a user.
   * @param {string} name - The name of the user.
   * @param {number} age - The age of the user.
   */
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  /**
   * Get a greeting message.
   * @returns {string} A personalized greeting.
   */
  sayHello() {
    return `Hello, my name is ${this.name}!`;
  }
}
