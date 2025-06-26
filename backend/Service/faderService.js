// services/faderService.js

const NS_PER_SEC = 1e9;
const faderTime = Array(128).fill(process.hrtime());
const faderValueMem = Array(128).fill(0);

const faderValue = Array.from({ length: 128 }, (_, i) => i / 127);

function shouldSendFader(controllerNumber, value) {
  const now = process.hrtime();
  const diff = process.hrtime(faderTime[controllerNumber]);
  const diffNs = diff[0] * NS_PER_SEC + diff[1];
  if (diffNs >= 50000000 || value === 0 || value === 127) {
    faderTime[controllerNumber] = now;
    return true;
  }
  return false;
}

function mapFaderValue(value) {
  return faderValue[value];
}

function memorizeFaderValue(controllerNumber, value) {
  faderValueMem[controllerNumber] = value;
}

export default {
  shouldSendFader,
  mapFaderValue,
  memorizeFaderValue
};
