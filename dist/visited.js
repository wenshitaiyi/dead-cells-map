(function () {
  "use strict";
  var key = "dcmap_visited_v1";
  var visited = {};
  try {
    var stored = JSON.parse(localStorage.getItem(key) || "{}");
    if (stored && typeof stored === "object" && !Array.isArray(stored)) visited = stored;
  } catch (_) {}
  var style = document.createElement("style");
  style.textContent = ".dc-visit{display:block;position:relative;z-index:10;margin:4px auto;padding:5px 9px;border:1px solid #9ca3af;border-radius:5px;background:#10253d;color:white;font-size:12px;cursor:pointer}.dc-visit[aria-pressed=true]{background:#166534;border-color:#86efac}.biome-item.dc-visited{outline:3px solid #4ade80;outline-offset:2px}";
  document.head.appendChild(style);
  var notice = document.createElement("div");
  notice.setAttribute("role", "status");
  notice.style.cssText = "text-align:center;color:white;padding:8px;font-size:13px";
  function refresh() {
    document.querySelectorAll(".biome-item[id]").forEach(function (card) {
      var id = card.id;
      var button = card.parentElement.querySelector(".dc-visit");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "dc-visit";
        card.insertAdjacentElement("afterend", button);
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          var next = Object.assign({}, visited);
          if (next[id]) delete next[id]; else next[id] = true;
          try {
            localStorage.setItem(key, JSON.stringify(next));
            visited = next;
            notice.textContent = "标记已保存在当前浏览器";
            refresh();
          } catch (_) {
            notice.textContent = "保存失败，请允许浏览器存储后重试";
          }
        });
      }
      var done = visited[id] === true;
      card.classList.toggle("dc-visited", done);
      var pressed = String(done);
      if (button.getAttribute("aria-pressed") !== pressed) button.setAttribute("aria-pressed", pressed);
      var label = done ? "✓ 已走过" : "○ 未走过";
      if (button.textContent !== label) button.textContent = label;
    });
  }
  function start() {
    var tree = document.querySelector(".biomes-tree");
    if (!tree) return;
    tree.insertAdjacentElement("beforebegin", notice);
    notice.textContent = "点击副本下方按钮标记是否走过 · 记录保存在当前浏览器";
    refresh();
    new MutationObserver(refresh).observe(tree, { childList: true, subtree: true });
    window.addEventListener("storage", function (event) {
      if (event.key !== key && event.key !== null) return;
      try { var value = JSON.parse(event.newValue || "{}"); visited = value && typeof value === "object" && !Array.isArray(value) ? value : {}; refresh(); } catch (_) {}
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
