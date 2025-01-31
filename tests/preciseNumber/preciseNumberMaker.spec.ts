import * as assert from 'assert';
import 'mocha';
import { p } from '../../index';
import { DEF_PREC, MAX_PREC, MIN_PREC } from '../../src/consts';
import { Input } from '../types';

interface Test {
  input: Input;
  precision: number;
  value: number;
  integer: bigint;
}

interface InvalidTest {
  input: Input;
  precision: number;
}

const getVals = (
  input: Input,
  precision: number,
  value: number,
  integer: bigint
): Test => ({
  input,
  precision,
  value,
  integer,
});

const getInvalidVals = (input: Input, precision: number): InvalidTest => ({
  input,
  precision,
});

describe('PreciseNumber, Maker', function () {
  context('valid inputs', function () {
    const testThese = [
      getVals(-0, 10, 0, 0n),
      getVals(2.555, 0, 3, 3n),
      getVals(-2.555, 0, -3, -3n),
      getVals(2.555, 2, 2.56, 256n),
      getVals(-2.555, 2, -2.56, -256n),
      getVals(2.555, 11, 2.555, 255500000000n),
      getVals(-2.555, 11, -2.555, -255500000000n),
      getVals('.555', 0, 1, 1n),
      getVals('-.555', 0, -1, -1n),
      getVals('.455', 0, 0, 0n),
      getVals('-.455', 0, 0, 0n),
      getVals('0', 10, 0, 0n),
      getVals('-0', 10, 0, 0n),
      getVals('0.1', 10, 0.1, 1000000000n),
      getVals('2.555', 0, 3, 3n),
      getVals('-2.555', 0, -3, -3n),
      getVals('2.555', 2, 2.56, 256n),
      getVals('-2.555', 2, -2.56, -256n),
      getVals('2.555', 11, 2.555, 255500000000n),
      getVals('-2.555', 11, -2.555, -255500000000n),
      getVals('-0.000001', 20, -0.000001, -100000000000000n),
      getVals('200', 3, 200, 200000n),
      getVals('00200', 3, 200, 200000n),
      getVals('.00200', 3, 0.002, 2n),
      getVals(-0.002, 3, -0.002, -2n),
      getVals('-00.002', 3, -0.002, -2n),
      getVals(
        '200_000_000_000_000.18',
        2,
        200000000000000.16,
        20000000000000018n
      ), // kilo Jeff
      getVals(2n, 3, 0.002, 2n),
    ];

    for (let test of testThese) {
      const { input, precision, value, integer } = test;

      specify(`input: ${input}`, function () {
        const pn = p(input, precision);
        assert.strictEqual(pn.v, value);
        assert.strictEqual(pn.i, integer);
      });
    }
  });

  context('invalid inputs', function () {
    const testThese = [
      getInvalidVals(2.5, MIN_PREC - 1),
      getInvalidVals(2.5, MAX_PREC + 1),
      getInvalidVals('', DEF_PREC),
      getInvalidVals('.', DEF_PREC),
      getInvalidVals('2.555.5', DEF_PREC),
      getInvalidVals('.555.5', DEF_PREC),
      getInvalidVals('1|000|000.000', DEF_PREC),
      getInvalidVals('1-000-000.000', DEF_PREC),
    ];
    for (let test of testThese) {
      const { input, precision } = test;

      specify(`input: ${input}`, function () {
        assert.throws(() => {
          p(input, precision);
        });
      });
    }
  });
});

describe('PreciseNumber, Other functions', function () {
  context('Round', function () {
    const testThese: [number | string, number, string, number][] = [
      [1234.5678, 4, '1235', -1],
      [1234.5678, 4, '1235', 0],
      [1234.5678, 4, '1234.6', 1],
      [1234.5678, 4, '1234.57', 2],
      [1234.5678, 4, '1234.568', 3],
      [1234.5678, 4, '1234.5678', 4],
      [1234.5678, 4, '1234.56780', 5],
      [1234.5678, 4, '1234.567800', 6],
      [-1234.5678, 4, '-1235', -1],
      [-1234.5678, 4, '-1235', 0],
      [-1234.5678, 4, '-1234.6', 1],
      [-1234.5678, 4, '-1234.57', 2],
      [-1234.5678, 4, '-1234.568', 3],
      [-1234.5678, 4, '-1234.5678', 4],
      [-1234.5678, 4, '-1234.56780', 5],
      [-1234.5678, 4, '-1234.567800', 6],
      ['200_000_000_000_000.18', 4, '200000000000000.18', 2],
      ['0.000000031032882086386885', 30, '0.0000000310328820863868850', 25],
    ];

    for (let test of testThese) {
      const [input, precision, expectedOutput, to] = test;
      const output = p(input, precision).round(to);
      specify(`input: ${input}`, function () {
        assert.strictEqual(output, expectedOutput);
      });
    }
  });
});
