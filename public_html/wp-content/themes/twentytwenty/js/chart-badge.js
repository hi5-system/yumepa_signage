/* =========================================================
   「入浴 :N」バッジ
   Chart.js の凡例は canvas 内に描かれるため CSS で装飾できない。
   そこで凡例を止め、同じ内容を HTML のバッジとしてチャートに重ねる。

   main.js（実サイトのコードそのまま）には手を入れず、
   Chart コンストラクタを包んで描画時にバッジを作る。
   ========================================================= */
(function () {
  'use strict';
  if (!window.Chart) { return; }

  var Base = window.Chart;

  function paint(canvas, config) {
    var wrap = canvas && canvas.parentNode;          // .chart
    if (!wrap || !config || !config.data) { return; }

    var ds     = (config.data.datasets || [])[0] || {};
    var label  = (config.data.labels   || [])[0] || '';
    var value  = (ds.data || [])[0];
    var color  = (ds.backgroundColor || [])[0] || '#3cb371';

    var badge = wrap.querySelector('.chart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'chart-badge';
      badge.innerHTML = '<i class="chart-badge__swatch"></i>' +
                        '<span class="chart-badge__text"></span>';
      wrap.appendChild(badge);
    }
    badge.querySelector('.chart-badge__swatch').style.backgroundColor = color;
    badge.querySelector('.chart-badge__text').textContent =
      label + ' :' + (value == null ? '' : value);
  }

  function Patched(ctx, config) {
    config = config || {};
    config.options = config.options || {};
    config.options.legend = { display: false };      // canvas 内の凡例は止める

    var chart = new Base(ctx, config);
    try {
      paint(ctx && ctx.canvas ? ctx.canvas : ctx, config);
    } catch (e) { /* バッジの失敗でグラフを壊さない */ }
    return chart;
  }

  Patched.prototype = Base.prototype;
  for (var k in Base) { if (Object.prototype.hasOwnProperty.call(Base, k)) { Patched[k] = Base[k]; } }
  window.Chart = Patched;
})();
