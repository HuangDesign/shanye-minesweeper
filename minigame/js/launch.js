'use strict';

/**
 * 启动参数解析：容错读取 scene / query，解析分享码场景。
 * 任何异常都不应中断启动。
 */

function isObject(value) {
  return !!value && typeof value === 'object';
}

function parseSceneValue(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === 'c') return { code: 'c', type: 'classic', level: 0 };
  const match = /^p([1-9])$/.exec(text);
  if (match) {
    return { code: text, type: 'level', level: Number(match[1]) };
  }
  return null;
}

function buildHint(sceneInfo) {
  if (!sceneInfo) return '';
  if (sceneInfo.type === 'classic') return '好友正在山林里扫雷';
  if (sceneInfo.type === 'level') return '好友通过了第 ' + sceneInfo.level + ' 关';
  return '';
}

/**
 * @param {object} launchOptions wx.getLaunchOptionsSync() 的返回值
 * @returns {{hint:string, scene:object|null, previewMode:boolean, query:object, from:string}}
 */
function parseLaunch(launchOptions) {
  const result = {
    hint: '',
    scene: null,
    previewMode: false,
    query: {},
    from: ''
  };
  try {
    const options = isObject(launchOptions) ? launchOptions : {};
    const query = isObject(options.query) ? options.query : {};
    result.query = query;
    result.from = typeof query.from === 'string' ? query.from : '';

    // 朋友圈单页模式（PRD 约定的场景值 1155）
    if (Number(options.scene) === 1155) {
      result.previewMode = true;
    }

    // 小程序码的 scene 会以 query.scene 传递，部分调试场景会直接放在 query 中
    let rawScene = query.scene;
    if (rawScene === undefined && typeof query.scene_id === 'string') rawScene = query.scene_id;
    result.scene = parseSceneValue(rawScene);
    result.hint = buildHint(result.scene);
  } catch (err) {
    // 忽略解析异常
  }
  return result;
}

module.exports = {
  parseLaunch: parseLaunch,
  parseSceneValue: parseSceneValue,
  buildHint: buildHint
};
