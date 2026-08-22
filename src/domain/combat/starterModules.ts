import type { StarterModuleId } from './types';

export interface StarterModuleDefinition {
  readonly id: StarterModuleId;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly effect: string;
  readonly texture: string;
  readonly assetPath: string;
}

export const STARTER_MODULES: Readonly<Record<StarterModuleId, StarterModuleDefinition>> = {
  'aegis-emitter': {
    id: 'aegis-emitter',
    name: 'Aegis-Emitter',
    category: 'DEFENSIVMODUL',
    description: 'Verzeiht den ersten Fehler und macht Schildtreffer deutlich sichtbar.',
    effect: '+12 Schild',
    texture: 'module-aegis-emitter-v1',
    assetPath: 'assets/modules/aegis-emitter-v1.svg',
  },
  'vector-drive': {
    id: 'vector-drive',
    name: 'Vector-Drive',
    category: 'ANTRIEBSMODUL',
    description: 'Reagiert schneller auf den Steuerstick und verstärkt die Hecktriebwerke.',
    effect: '+10 Tempo · +12 % Drehen',
    texture: 'module-vector-drive-v1',
    assetPath: 'assets/modules/vector-drive-v1.svg',
  },
};
