/** @type {import('ts-jest').JestConfigWithTsJest} **/
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '@/(.*)': ['<rootDir>/src/$1'],
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  prettierPath: require.resolve('prettier-2'),
};

export default config;
