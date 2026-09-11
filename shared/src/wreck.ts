/** One authored layout drives both collision and the visible modular ship. Y is up. */
export interface WreckPart {
  name: string;
  center: [number, number, number];
  size: [number, number, number];
  yaw: number;
  pitch?: number;
  walkSurface?: boolean;
}

export const WRECK_PARTS: WreckPart[] = [
  { name: 'wreck_lower_deck', center: [0, 0.1, 0], size: [13.6, 0.2, 5.8], yaw: 0, walkSurface: true },
  { name: 'wreck_port_hull', center: [-3.6, 1.2, -3], size: [6.6, 2.4, 0.3], yaw: 0 },
  { name: 'wreck_port_bow', center: [3.5, 1.25, -3], size: [6.8, 2.5, 0.3], yaw: 0 },
  { name: 'wreck_starboard_stern', center: [-4.5, 0.9, 3], size: [4.8, 1.8, 0.3], yaw: 0 },
  { name: 'wreck_starboard_bow', center: [4.5, 1.1, 3], size: [4.8, 2.2, 0.3], yaw: 0 },
  { name: 'wreck_bow_port', center: [7.9, 1.15, -1.5], size: [3.7, 2.3, 0.3], yaw: -0.938 },
  { name: 'wreck_bow_starboard', center: [7.9, 1.15, 1.5], size: [3.7, 2.3, 0.3], yaw: 0.938 },
  { name: 'wreck_stern_left', center: [-7, 0.7, -2.5], size: [0.3, 1.4, 1.1], yaw: 0 },
  { name: 'wreck_stern_right', center: [-7, 0.7, 2.5], size: [0.3, 1.4, 1.1], yaw: 0 },
  { name: 'wreck_upper_deck', center: [4.5, 2.65, 0], size: [4.6, 0.25, 6.3], yaw: 0, walkSurface: true },
  { name: 'wreck_access_ramp', center: [4.5, 1.4, 4.6], size: [2.2, 0.18, 6.2], yaw: 0, pitch: 0.43, walkSurface: true },
  { name: 'wreck_deck_cover', center: [6.65, 3.15, -0.1], size: [0.3, 1.0, 5.8], yaw: 0 },
  { name: 'wreck_deck_port_rail', center: [4.45, 3.12, -3], size: [4.3, 0.95, 0.25], yaw: 0 },
  { name: 'wreck_cargo_stern', center: [-3.4, 0.8, -1.1], size: [1.9, 1.2, 1.3], yaw: 0.12 },
  { name: 'wreck_cargo_mid', center: [0.25, 0.9, -1.5], size: [1.5, 1.4, 1.3], yaw: -0.12 },
  { name: 'wreck_mast', center: [-0.6, 4.3, -2.6], size: [0.4, 8.6, 0.4], yaw: 0 },
];
