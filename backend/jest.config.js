/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["js", "json", "ts"],
  // Finansal testler gerçek bir veritabanına karşı çalışır ve aynı satırları
  // kullanır; paralel worker'lar birbirinin verisini bozar.
  maxWorkers: 1,
  testTimeout: 30000,
};
