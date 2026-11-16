'use strict';

/**
 * 云函数：生成小游戏码（wxacode.getUnlimited）。
 * 前端通过 wx.cloud.callFunction({ name: 'getQrCode', data: { scene } }) 调用。
 * 返回 { ok, base64, scene } 或 { ok:false, error }。
 */

const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async function (event) {
  const raw = event && event.scene ? String(event.scene) : 'c';
  const scene = raw.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 32) || 'c';
  const requested = event && event.envVersion;
  const envVersion = requested === 'trial' || requested === 'develop' ? requested : 'release';

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: scene,
      width: 300,
      checkPath: false,
      isHyaline: false,
      envVersion: envVersion
    });
    return {
      ok: true,
      scene: scene,
      envVersion: envVersion,
      contentType: result.contentType || 'image/png',
      base64: result.buffer.toString('base64')
    };
  } catch (err) {
    return {
      ok: false,
      scene: scene,
      code: err && err.errCode,
      error: (err && (err.errMsg || err.message)) || 'getUnlimited failed'
    };
  }
};
