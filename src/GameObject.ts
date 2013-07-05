/*
 * Game Objects
 * ============
 *
 * interface GameObject
 * --------------------
 *
 * A unit in the game that is updated every frame
 *
 */
interface GameObject {
    update(timeSinceLastFrame: number): void;
}

