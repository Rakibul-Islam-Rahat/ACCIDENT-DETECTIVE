import { parseSensorPacket } from '../src/services/BluetoothService';

describe('parseSensorPacket', () => {
  it('parses a well-formed packet', () => {
    expect(parseSensorPacket('SERVO:90,S1:25,S2:30,MOTION:YES')).toMatchObject({
      servoAngle: 90,
      sonar1: 25,
      sonar2: 30,
      motion: true,
    });
  });

  it('parses MOTION:NO as false', () => {
    expect(parseSensorPacket('SERVO:45,S1:18,S2:22,MOTION:NO')).toMatchObject({
      servoAngle: 45,
      sonar1: 18,
      sonar2: 22,
      motion: false,
    });
  });

  it('tolerates surrounding whitespace and newlines', () => {
    expect(parseSensorPacket('  SERVO:60,S1:10,S2:12,MOTION:NO \r\n')).toMatchObject({
      servoAngle: 60,
      sonar1: 10,
      sonar2: 12,
      motion: false,
    });
  });

  it('returns null for an empty string', () => {
    expect(parseSensorPacket('')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(parseSensorPacket('not a real packet')).toBeNull();
  });

  it('returns null when numeric fields are non-numeric', () => {
    expect(parseSensorPacket('SERVO:oops,S1:25,S2:30,MOTION:YES')).toBeNull();
  });

  it('handles a partial packet gracefully', () => {
    expect(parseSensorPacket('SERVO:90')).toMatchObject({
      servoAngle: 90,
      sonar1: null,
      sonar2: null,
      motion: null,
    });
  });
});
