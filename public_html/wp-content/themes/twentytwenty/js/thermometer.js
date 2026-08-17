/* =========================================================
   湯温の温度計（城崎温泉 混雑状況ページ kinosaki-congestion より移植）

   サーバー出力（sotoyu.html 由来）：
     <div class="hot-spring-temperature hot-spring-temperature--hot">
       <span class="hot-spring-temperature__value">42.0℃</span>
     </div>

   ここで行うのは表示のための組み立てのみ。
     1) 数値から --temp を付与（液面の高さに使う）
     2) ガラス管・液面・目盛り・球のマークアップを差し込む
     3) 「℃」を <small> で包んで小さく見せる

   ★サイネージ版の違い：
     スライドは #slide に AJAX で後から注入されるため、
     ページ読込時の一度きりでは要素が拾えない。
     window.buildThermometers() として公開し、スライド注入後に
     main.js から呼び出す。二重挿入は figure の有無で防ぐ（冪等）。
   ========================================================= */
(function () {
  'use strict';

  var FIGURE =
    '<div class="thermometer__figure" aria-hidden="true">' +
      '<div class="thermometer__tube">' +
        '<div class="thermometer__fill"></div>' +
        '<div class="thermometer__scale">' +
          '<span></span><span></span><span></span><span></span><span></span><span></span><span></span>' +
        '</div>' +
      '</div>' +
      '<div class="thermometer__bulb"></div>' +
    '</div>';

  function build(root) {
    var scope = root || document;
    var items = scope.querySelectorAll('.hot-spring-temperature');

    Array.prototype.forEach.call(items, function (el) {
      var valEl = el.querySelector('.hot-spring-temperature__value');
      if (!valEl || el.querySelector('.thermometer__figure')) { return; }

      var text = valEl.textContent.trim();
      var num  = parseFloat(text);
      if (!isNaN(num)) { el.style.setProperty('--temp', num); }

      /* 温度計の絵を数値の前に差し込む */
      valEl.insertAdjacentHTML('beforebegin', FIGURE);

      /* 「42.0℃」→「42.0<small>℃</small>」 */
      var m = text.match(/^([\d.]+)\s*(℃|°C)$/);
      if (m) {
        valEl.textContent = m[1];
        var unit = document.createElement('small');
        unit.textContent = m[2];
        valEl.appendChild(unit);
      }

      /* 温度計を「サークル（ドーナツ）」の上下中央に合わせる。
         カードの上下中央だと臨時休湯の有無でカード高さが変わりズレるため、
         同カード内の .chart の中心に合わせる。絶対配置 top の基準差
         （border/padding 等）に依存しないよう、実測した中心差だけ top を補正。 */
      var facility = el.closest && el.closest('.facility');
      var chart = facility && facility.querySelector('.chart');
      if (chart && chart.offsetParent) {
        var cr = chart.getBoundingClientRect();
        var tr = el.getBoundingClientRect();
        var delta = (cr.top + cr.height / 2) - (tr.top + tr.height / 2);
        var curTop = parseFloat(window.getComputedStyle(el).top) || 0;
        el.style.top = (curTop + delta) + 'px';
      }
    });
  }

  /* スライド注入後に main.js から呼ぶ */
  window.buildThermometers = build;

  /* 静的表示（AJAX を介さない場合）でも動くよう、読込時にも一度走らせる */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { build(document); });
  } else {
    build(document);
  }
})();
