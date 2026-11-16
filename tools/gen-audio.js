'use strict';

/**
 * 生成项目内置音效（WAV）。
 * 运行：node tools/gen-audio.js
 * 全部为本地合成的短音效，避免网络加载与首播延迟。
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'minigame', 'audio');

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const scale = peak > 0.95 ? 0.95 / peak : 1;

  for (let i = 0; i < samples.length; i++) {
    let value = Math.max(-1, Math.min(1, samples[i] * scale));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
  console.log(filename, (buffer.length / 1024).toFixed(1) + ' KB');
}

function envelope(t, attack, decay, curve) {
  if (t < attack) return t / attack;
  const x = (t - attack) / Math.max(0.0001, decay);
  return Math.exp(-x * (curve || 4));
}

function noiseBurst(duration, options) {
  const opts = options || {};
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  let lp = 0;
  let prev = 0;
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const white = Math.random() * 2 - 1;
    const cutoff = opts.cutoff || 0.35;
    lp += (white - lp) * cutoff;
    const high = lp - prev;
    prev = lp;
    const env = envelope(t, opts.attack || 0.001, opts.decay || duration * 0.5, opts.curve || 5);
    const tone = opts.tone ? Math.sin(2 * Math.PI * opts.tone * t) * (opts.toneMix || 0.4) : 0;
    out[i] = (high * (opts.noiseMix === undefined ? 1 : opts.noiseMix) + tone) * env;
  }
  return out;
}

function addSamples(target, source, offsetSeconds, gain) {
  const offset = Math.floor(offsetSeconds * SAMPLE_RATE);
  const g = gain === undefined ? 1 : gain;
  for (let i = 0; i < source.length; i++) {
    const index = offset + i;
    if (index < 0 || index >= target.length) continue;
    target[index] += source[i] * g;
  }
}

function synthReveal() {
  const duration = 0.09;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  const noise = noiseBurst(duration, { cutoff: 0.28, decay: 0.035, curve: 6, noiseMix: 0.9 });
  addSamples(out, noise, 0, 0.7);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 40);
    const tone = Math.sin(2 * Math.PI * 320 * t) * 0.35 + Math.sin(2 * Math.PI * 480 * t) * 0.12;
    out[i] += tone * env;
  }
  return out;
}

function synthMark() {
  const duration = 0.12;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 28) * (1 - Math.exp(-t * 900));
    const freq = 740 - 120 * (t / duration);
    const tone = Math.sin(2 * Math.PI * freq * t) * 0.55 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.16;
    out[i] = tone * env;
  }
  const click = noiseBurst(0.02, { cutoff: 0.5, decay: 0.008, curve: 8, noiseMix: 1 });
  addSamples(out, click, 0, 0.25);
  return out;
}

function synthUnmark() {
  const duration = 0.15;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 22) * (1 - Math.exp(-t * 600));
    const freq = 480 - 150 * (t / duration);
    out[i] = Math.sin(2 * Math.PI * freq * t) * 0.5 * env;
  }
  return out;
}

function synthBoom() {
  const duration = 0.7;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  let lp = 0;
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 5.2) * Math.min(1, t / 0.006);
    const rumble = Math.sin(2 * Math.PI * (92 - 45 * (t / duration)) * t);
    const sub = Math.sin(2 * Math.PI * 48 * t) * 0.5;
    const white = Math.random() * 2 - 1;
    lp += (white - lp) * 0.08;
    const grit = Math.tanh((rumble * 1.4 + sub + lp * 1.2) * 1.7) * 0.55;
    out[i] = (rumble * 0.65 + sub * 0.35 + grit * 0.5) * env;
  }
  return out;
}

function synthWin() {
  const duration = 1.15;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  const notes = [
    { f: 523.25, at: 0.0 },
    { f: 659.25, at: 0.14 },
    { f: 783.99, at: 0.28 },
    { f: 1046.5, at: 0.42 }
  ];
  notes.forEach(function (note, index) {
    const noteDuration = duration - note.at;
    const n = Math.floor(SAMPLE_RATE * noteDuration);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * (index === notes.length - 1 ? 2.1 : 3.4)) * Math.min(1, t / 0.01);
      const tone = Math.sin(2 * Math.PI * note.f * t) * 0.5
        + Math.sin(2 * Math.PI * note.f * 2 * t) * 0.12
        + Math.sin(2 * Math.PI * note.f * 0.5 * t) * 0.08;
      const indexOut = Math.floor(note.at * SAMPLE_RATE) + i;
      if (indexOut < out.length) out[indexOut] += tone * env * 0.7;
    }
  });
  // 轻轻的尾音雾气
  const pad = noiseBurst(0.6, { cutoff: 0.06, attack: 0.2, decay: 0.4, curve: 2, noiseMix: 0.4 });
  addSamples(out, pad, 0.4, 0.08);
  return out;
}

function synthTick() {
  const duration = 0.05;
  const count = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);
    out[i] = (Math.sin(2 * Math.PI * 1500 * t) * 0.5 + Math.sin(2 * Math.PI * 2300 * t) * 0.15) * env;
  }
  return out;
}

function synthUnlock() {
  const count = Math.floor(SAMPLE_RATE * 0.012);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = Math.sin(2 * Math.PI * 800 * (i / SAMPLE_RATE)) * 0.0006;
  }
  return out;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  writeWav('reveal.wav', synthReveal());
  writeWav('mark.wav', synthMark());
  writeWav('unmark.wav', synthUnmark());
  writeWav('boom.wav', synthBoom());
  writeWav('win.wav', synthWin());
  writeWav('tick.wav', synthTick());
  writeWav('unlock.wav', synthUnlock());
}

main();
