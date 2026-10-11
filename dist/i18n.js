/* ============================================================
 * Dead Cells Interactive Map - 中英双语叠加层 (i18n overlay)
 * 不改动原站点任何逻辑/样式，仅在 DOM 文本层做英文->中文替换。
 * 英文为站点原生渲染结果；切换到中文时按下表替换；切回英文时反向还原。
 * 动态 tooltip 通过 MutationObserver 自动翻译。
 * ============================================================ */
(function () {
  "use strict";

  /* 英文 -> 中文 字典（覆盖所有可见文案） */
  var ZH = {
    // 群系名
    "Prisoners Quarters": "囚徒牢房",
    "Dilapidated Arboretum": "破败植物园",
    "Promenade of the Condemned": "罪人林荫道",
    "Toxic Sewers": "有毒下水道",
    "Castle Outskirts": "城堡外围",
    "Prison Depths": "监狱深处",
    "Corrupted Prison": "腐化牢房",
    "Morass of the Banished": "放逐者沼泽",
    "Ossuary": "藏骨堂",
    "Ancient Sewers": "古代下水道",
    "Ramparts": "城墙壁垒",
    "Bank": "银行",
    "Draculas Castle": "德古拉城堡",
    "Nest": "巢穴",
    "Insufferable Crypt": "苦痛地穴",
    "Black Bridge": "黑色大桥",
    "Defiled Necropolis": "亵渎墓地",
    "Graveyard": "遗忘墓地",
    "Slumbering Sanctuary": "沉睡圣所",
    "Stilt Village": "架高村落",
    "Fractured Shrines": "破碎神殿",
    "Cavern": "巨洞",
    "Forgotten Sepulcher": "遗忘陵寝",
    "Clock Tower": "时钟塔",
    "Undying Shores": "不朽海岸",
    "Guardians Haven": "守护者港湾",
    "Clock Room": "时钟室",
    "Mausoleum": "陵墓",
    "Infested Shipwreck": "腐坏沉船",
    "Derelict Distillery": "废弃酿酒厂",
    "High Peak Castle": "峰巅城堡",
    "Lighthouse": "灯塔",
    "Throne Room": "王座之间",
    "The Crown": "王冠",
    "Astrolab": "星盘台",
    "Masters Keep": "大师据点",
    "Observatory": "观象台",

    // 符文 / 道具名
    "Explorers Rune": "探险家符文",
    "Ram Rune": "公羊符文",
    "Spider Rune": "蜘蛛符文",
    "Teleportation Rune": "传送符文",
    "Vine Rune": "藤蔓符文",
    "Homunculus Rune": "傀儡符文",
    "Crown Key": "王冠钥匙",
    "Cultist Outfit": "邪教徒装束",
    "Cavern Key": "巨洞钥匙",

    // DLC 名
    "Bad Seed": "坏种",
    "Fatal Falls": "致命坠落",
    "Rise of the Giant": "巨人崛起",
    "Queen of the sea": "海之女王",
    "Return to Castlevania": "重返恶魔城",

    // UI 标签
    "Interactive Map": "交互地图",
    "DLCS:": "DLC：",
    "Feedback": "反馈",
    "Filter DLC ": "筛选 DLC ",
    "Fitler DLC ": "筛选 DLC ",
    "close": "关闭",
    "Optional": "可选",
    "BOSS FIGHT": "BOSS 战",

    // 阶段徽章
    "Stage 1": "第1阶段",
    "Stage 2": "第2阶段",
    "Stage 3": "第3阶段",
    "Stage 4": "第4阶段",
    "Stage 5": "第5阶段",
    "Stage 6": "第6阶段",
    "Stage 7": "第7阶段",

    // Tooltip 模板片段
    "Requires the ": "需要",
    " rune to enter ": "符文才能进入",
    "Requires ": "需要",
    " boss ": " 个 Boss 细胞",
    "cell": "",
    "cells": "",
    " to enter ": "才能进入",
    "This stage is Optional": "此为可选阶段",
    "Stage: ": "阶段：",
    "Stage: 1": "阶段：1",
    "Stage: 2": "阶段：2",
    "Stage: 3": "阶段：3",
    "Stage: 4": "阶段：4",
    "Stage: 5": "阶段：5",
    "Stage: 6": "阶段：6",
    "Stage: 7": "阶段：7",
    " can be unlocked here": "可在此解锁",
    "Path to ": "通往",
    "Path to:": "通往：",

    // 锁定说明
    "Routes locked until Return to Castlevania DLC quest is complete":
      "路径已锁定：需完成「重返恶魔城」DLC 任务",
    "Routes locked until connected biome has been visited":
      "路径已锁定：需先造访相连的群系",
    "Routes locked until connected biomes boss is defeated":
      "路径已锁定：需击败相连群系的 Boss",
    "Routes locked until the Cavern Key is discovered":
      "路径已锁定：需先找到「巨洞钥匙」"
  };

  // 反向表：中文 -> 英文（用于切回英文）
  var REV = {};
  Object.keys(ZH).forEach(function (k) {
    if (ZH[k] !== "") REV[ZH[k]] = k;
  });

  var KEY = "dcmap_lang";
  var current = null;

  function getLang() {
    try { return localStorage.getItem(KEY) || "zh"; }
    catch (e) { return "zh"; }
  }
  function setLang(l) {
    current = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }

  /* 翻译单个文本节点 */
  function translateNode(node) {
    var t = node.nodeValue;
    if (t == null) return;
    var dict = current === "zh" ? ZH : REV;
    if (dict[t] !== undefined) { node.nodeValue = dict[t]; return; }
    // 带首尾空白的片段（如 " rune to enter "、"Filter DLC "）
    var trimmed = t.trim();
    if (trimmed && dict[trimmed] !== undefined) {
      node.nodeValue = t.replace(trimmed, dict[trimmed]);
    }
  }

  function walk(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    for (var i = 0; i < nodes.length; i++) translateNode(nodes[i]);
  }

  function apply() {
    walk(document.body);
    // 文档标题
    if (current === "zh") {
      document.title = "死亡细胞交互地图";
    } else {
      document.title = "Dead Cells Interactive Map";
    }
  }

  /* 语言切换按钮 */
  function makeButton() {
    if (document.getElementById("dcmap-lang-btn")) return;
    var b = document.createElement("button");
    b.id = "dcmap-lang-btn";
    b.textContent = current === "zh" ? "EN" : "中文";
    b.setAttribute("aria-label", "切换语言 / Toggle language");
    b.style.cssText = [
      "position:fixed", "top:12px", "right:12px", "z-index:9999",
      "background:#fff", "color:#000", "font-weight:700", "text-transform:uppercase",
      "font-size:13px", "padding:8px 16px", "border-radius:4px", "cursor:pointer",
      "box-shadow:0 2px 6px rgba(0,0,0,.35)", "border:none", "letter-spacing:.5px"
    ].join(";");
    b.addEventListener("click", function () {
      setLang(current === "zh" ? "en" : "zh");
      b.textContent = current === "zh" ? "EN" : "中文";
      apply();
    });
    document.body.appendChild(b);
  }

  /* 动态内容（tooltip / DLC 切换重渲染）自动翻译 */
  var observer = new MutationObserver(function (mutations) {
    if (current !== "zh") return; // 英文为原生态，无需处理
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var n = added[j];
        if (n.nodeType === 3) translateNode(n);
        else if (n.nodeType === 1) walk(n);
      }
    }
  });

  function init() {
    current = getLang();
    makeButton();
    apply();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, characterData: false });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
