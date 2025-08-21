/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.tsx'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
