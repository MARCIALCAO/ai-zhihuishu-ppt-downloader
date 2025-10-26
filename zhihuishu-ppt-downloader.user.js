// ==UserScript==
// @name         智慧树 PPT/PPTX 下载（仅URL）
// @namespace    MacroHelper
// @version      1.0
// @description  自动扫描网页中 .ppt 和 .pptx 文件，仅使用URL生成下载链接
// @match        *://ai-smart-course-student-pro.zhihuishu.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // 只在主页面运行
  if (window.top !== window.self) return;

  const scanned = new Set();

  // 创建按钮
  const btn = document.createElement('button');
  btn.textContent = '📄 扫描PPT';
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
    cursor: pointer;
  `;
  document.body.appendChild(btn);

  // 创建结果面板
  const box = document.createElement('div');
  box.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 30px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    max-height: 350px;
    overflow-y: auto;
    font-size: 13px;
    display: none;
    z-index: 99999;
  `;
  document.body.appendChild(box);

  // 按钮点击展开/收起面板
  btn.onclick = () => {
    if (box.style.display === 'none') {
      box.style.display = 'block';
      scanForFiles();
    } else {
      box.style.display = 'none';
    }
  };

  function scanForFiles() {
    const html = document.documentElement.outerHTML;

    // 匹配 PPT 和 PPTX 下载链接
    const fileRegex = /(https?:\/\/[^\s"'<>]+?\.(ppt|pptx)(?:\?[^\s"'<>]*)?)/gi;
    const found = [...new Set(html.match(fileRegex) || [])];

    box.innerHTML = '';

    if (found.length === 0) {
      box.textContent = '未发现 PPT/PPTX 文件';
      return;
    }

    found.forEach(url => {
      if (!scanned.has(url)) scanned.add(url);

      // 直接使用 URL 最后部分作为文件名
      const name = decodeURIComponent(url.split('/').pop());

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.textContent = name;
      link.target = '_blank';
      link.download = name;
      link.style.display = 'block';
      link.style.margin = '4px 0';
      box.appendChild(link);
    });
  }

  // 延迟扫描，避免动态加载遗漏
  setTimeout(scanForFiles, 3000);
  setInterval(scanForFiles, 5000);
})();
