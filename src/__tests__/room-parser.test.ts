import { describe, it, expect } from 'vitest';
import { parseRoomCode, formatParsedRoom } from '@/lib/utils/room-parser';

describe('parseRoomCode', () => {
  it('parses TULT 0701 correctly', () => {
    const result = parseRoomCode('TULT 0701');
    expect(result.parsed).toBe(true);
    expect(result.building).toBe('TULT');
    expect(result.buildingAlias).toBe('TULT');
    expect(result.floor).toBe(7);
    expect(result.room).toBe(1);
    expect(result.raw).toBe('TULT 0701');
  });

  it('parses KU1 0701 correctly', () => {
    const result = parseRoomCode('KU1 0701');
    expect(result.parsed).toBe(true);
    expect(result.building).toBe('KU1');
    expect(result.buildingAlias).toBe('Cacuk');
    expect(result.floor).toBe(7);
    expect(result.room).toBe(1);
  });

  it('parses KU3 0701 correctly', () => {
    const result = parseRoomCode('KU3 0701');
    expect(result.parsed).toBe(true);
    expect(result.building).toBe('KU3');
    expect(result.buildingAlias).toBe('GKU');
    expect(result.floor).toBe(7);
    expect(result.room).toBe(1);
  });

  it('is case-insensitive for building codes', () => {
    const result = parseRoomCode('tult 0701');
    expect(result.parsed).toBe(true);
    expect(result.building).toBe('TULT');
  });

  it('handles extra whitespace', () => {
    const result = parseRoomCode('  TULT   0701  ');
    expect(result.parsed).toBe(true);
    expect(result.floor).toBe(7);
  });

  it('returns unparsed for empty input', () => {
    expect(parseRoomCode('').parsed).toBe(false);
  });

  it('returns unparsed for null-like input', () => {
    expect(parseRoomCode(null as unknown as string).parsed).toBe(false);
    expect(parseRoomCode(undefined as unknown as string).parsed).toBe(false);
  });

  it('returns unparsed for unknown building code', () => {
    const result = parseRoomCode('XYZ 0701');
    expect(result.parsed).toBe(false);
    expect(result.raw).toBe('XYZ 0701');
  });

  it('returns unparsed for less than 4 digits', () => {
    expect(parseRoomCode('TULT 07').parsed).toBe(false);
    expect(parseRoomCode('TULT 071').parsed).toBe(false);
  });

  it('returns unparsed for more than 4 digits', () => {
    expect(parseRoomCode('TULT 07011').parsed).toBe(false);
  });

  it('returns unparsed for non-digit room numbers', () => {
    expect(parseRoomCode('TULT ABCD').parsed).toBe(false);
  });

  it('returns unparsed for special characters in building code', () => {
    expect(parseRoomCode('TU@LT 0701').parsed).toBe(false);
  });

  it('returns unparsed for single part without space', () => {
    expect(parseRoomCode('TULT0701').parsed).toBe(false);
  });

  it('returns unparsed for three parts', () => {
    expect(parseRoomCode('TULT 07 01').parsed).toBe(false);
  });

  it('parses ground floor correctly', () => {
    const result = parseRoomCode('TULT 0101');
    expect(result.parsed).toBe(true);
    expect(result.floor).toBe(1);
    expect(result.room).toBe(1);
  });

  it('parses floor 0 correctly', () => {
    const result = parseRoomCode('TULT 0001');
    expect(result.parsed).toBe(true);
    expect(result.floor).toBe(0);
    expect(result.room).toBe(1);
  });
});

describe('formatParsedRoom', () => {
  it('formats a parsed room correctly', () => {
    const parsed = parseRoomCode('TULT 0701');
    expect(formatParsedRoom(parsed)).toBe('Gedung TULT, Lantai 7, Ruangan 01');
  });

  it('formats KU1 with alias', () => {
    const parsed = parseRoomCode('KU1 0301');
    expect(formatParsedRoom(parsed)).toBe('Gedung Cacuk, Lantai 3, Ruangan 01');
  });

  it('returns raw string for unparsed room', () => {
    const parsed = parseRoomCode('UNKNOWN 1234');
    expect(formatParsedRoom(parsed)).toBe('UNKNOWN 1234');
  });

  it('returns dash for empty unparsed room', () => {
    const parsed = parseRoomCode('');
    expect(formatParsedRoom(parsed)).toBe('-');
  });
});
