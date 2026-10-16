import type { ParsedRoom } from '@/types';

interface BuildingConfig {
  code: string;
  alias: string;
  digitFormat: 'four';
}

const BUILDING_MAP: BuildingConfig[] = [
  { code: 'TULT', alias: 'TULT', digitFormat: 'four' },
  { code: 'KU1', alias: 'Cacuk', digitFormat: 'four' },
  { code: 'KU3', alias: 'GKU', digitFormat: 'four' },
];

export function parseRoomCode(raw: string): ParsedRoom {
  const fallback: ParsedRoom = {
    building: '',
    buildingAlias: null,
    floor: 0,
    room: 0,
    raw,
    parsed: false,
  };

  if (!raw || typeof raw !== 'string') return fallback;

  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return fallback;

  const parts = trimmed.split(' ');
  if (parts.length !== 2) return fallback;

  const [buildingCode, digits] = parts;

  if (!/^[A-Za-z0-9]+$/.test(buildingCode)) return fallback;
  if (!/^\d{4}$/.test(digits)) return fallback;

  const config = BUILDING_MAP.find(
    (b) => b.code.toLowerCase() === buildingCode.toLowerCase()
  );

  if (!config) return fallback;

  const floor = parseInt(digits.substring(0, 2), 10);
  const room = parseInt(digits.substring(2, 4), 10);

  if (floor < 0 || room < 0) return fallback;

  return {
    building: config.code,
    buildingAlias: config.alias,
    floor,
    room,
    raw: trimmed,
    parsed: true,
  };
}

export function formatParsedRoom(parsed: ParsedRoom): string {
  if (!parsed.parsed) return parsed.raw || '-';
  const alias = parsed.buildingAlias || parsed.building;
  return `Gedung ${alias}, Lantai ${parsed.floor}, Ruangan ${String(parsed.room).padStart(2, '0')}`;
}

export function addBuildingConfig(config: BuildingConfig): void {
  const exists = BUILDING_MAP.find(
    (b) => b.code.toLowerCase() === config.code.toLowerCase()
  );
  if (!exists) {
    BUILDING_MAP.push(config);
  }
}

export function getBuildingConfigs(): BuildingConfig[] {
  return [...BUILDING_MAP];
}
