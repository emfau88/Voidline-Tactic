export const GAME_WIDTH = 844;
export const GAME_HEIGHT = 390;
// Keep the backing buffer close to the actual display density. The previous 2x cap
// made high-density phones upscale the canvas and soften every painted asset.
export const RENDER_DENSITY = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
