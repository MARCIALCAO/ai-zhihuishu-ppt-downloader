// ==UserScript==
// @name         智慧树 PPTX 下载（可拖动按钮+面板跟随）
// @namespace    MARCIALCAO
// @version      1.2
// @description  扫描智慧树网页中 .pptx 文件并生成下载链接；按钮可拖动但刷新后重置位置
// @match        *://ai-smart-course-student-pro.zhihuishu.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const scanned = new Set();

  // ===== 创建按钮 =====
  const btn = document.createElement('button');
  btn.textContent = '📄 扫描 PPT';
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 99999;
    background: #f9d342;
    color: #000;
    border: none;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 6px;
    cursor: move;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: background 0.2s ease;
  `;
  document.body.appendChild(btn);

  btn.onmouseenter = () => (btn.style.background = '#ffcc00');
  btn.onmouseleave = () => (btn.style.background = '#f9d342');

  // ===== 创建结果面板 =====
  const box = document.createElement('div');
  box.style.cssText = `
    position: fixed;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    max-height: 350px;
    overflow-y: auto;
    font-size: 13px;
    display: none;
    z-index: 99999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(box);

  // ===== 拖动逻辑 =====
  let isDragging = false;
  let offsetX, offsetY;

  btn.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.clientX - btn.getBoundingClientRect().left;
    offsetY = e.clientY - btn.getBoundingClientRect().top;
    btn.style.transition = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    const maxX = window.innerWidth - btn.offsetWidth;
    const maxY = window.innerHeight - btn.offsetHeight;
    btn.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    btn.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
    btn.style.position = 'fixed';
    positionBox();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      btn.style.transition = 'background 0.2s ease';
    }
  });

  // ===== 让面板跟随按钮 =====
  function positionBox() {
    const rect = btn.getBoundingClientRect();
    box.style.left = rect.left + 'px';
    box.style.top = rect.top - box.offsetHeight - 10 + 'px';
    box.style.right = 'auto';
    box.style.bottom = 'auto';
  }

  // ===== 点击按钮展开或隐藏面板 =====
  btn.addEventListener('click', e => {
    if (isDragging) return; // 防止拖动触发点击
    if (box.style.display === 'none') {
      box.style.display = 'block';
      scanForFiles();
      positionBox();
    } else {
      box.style.display = 'none';
    }
  });

  // ===== 文件扫描逻辑 =====
  function scanForFiles() {
    const html = document.documentElement.outerHTML;
    const fileRegex = /(https?:\/\/[^\s"'<>]+?\.(pptx?|PPTX?)(?:\?[^\s"'<>]*)?)/gi;
    const found = [...new Set(html.match(fileRegex) || [])];
    box.innerHTML = '';

    if (found.length === 0) {
      box.textContent = '未发现 PPT 文件';
      return;
    }

    found.forEach(url => {
      if (!scanned.has(url)) scanned.add(url);
      const name = decodeURIComponent(url.split('/').pop());
      const link = document.createElement('a');
      link.href = url;
      link.textContent = name;
      link.target = '_blank';
      link.download = name;
      link.style.display = 'block';
      link.style.margin = '4px 0';
      link.style.color = '#007bff';
      link.style.textDecoration = 'none';
      link.onmouseenter = () => (link.style.textDecoration = 'underline');
      link.onmouseleave = () => (link.style.textDecoration = 'none');
      box.appendChild(link);
    });
  }

  // ===== 自动扫描一次 =====
  setTimeout(scanForFiles, 3000);
  setInterval(scanForFiles, 5000);
})();
