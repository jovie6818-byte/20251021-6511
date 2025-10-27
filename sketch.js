/*
By Okazz
*/
let palette = ['#FEA863', '#05B4BF', '#4176DD', '#FFD853', '#FF4D89', '#f0f0f0'];
let ctx;
let centerX, centerY;
let shapes = [];

// 新增選單狀態變數
let menuWidth = 200;
let menuX = -menuWidth;
let menuTargetX = -menuWidth;
// 更新選單項目名稱
let menuItems = ['作品一', '筆記', '自我介紹'];
let itemHeight = 48;
let menuPadding = 16;
// 定義連結和自我介紹內容
const links = [
    'https://jovie6818-byte.github.io/20251014-414736511/', // 作品一
    'https://hackmd.io/@d71AYvUoQBuzbz__xVYdrw/r1ergYuknee', // 筆記
    '淡江大學教育科技學系 414736511 張又瑄' // 自我介紹內容 (非連結)
];

// 新增：覆蓋層與 iframe/內容容器變數
let overlayDiv = null;
let iframeEl = null;
let contentDiv = null;
let closeBtn = null;


function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    rectMode(CENTER);
    colorMode(HSB, 360, 100, 100, 100);
    ctx = drawingContext;
    centerX = width / 2;
    centerY = height / 2;
    divideRect(centerX, centerY, width * 0.9, height * 0.9, 70);
    strokeWeight(width / 700);
    // 將初次繪製移到 draw() 中，以支援每幀重畫（避免選單滑動殘影）
    noStroke();
}

function draw() {
    // 重新繪製背景與畫面（確保選單滑動不會留痕）
    background(255);
    drawGrid(centerX, centerY, width, 300);
    stroke('#112658');
    let margin = width * 0.01;
    for (let i of shapes) {
        let clrs = palette.slice();
        shuffle(clrs, '🛸');
        drawWindow(i.x, i.y, i.w - margin, i.h - margin, clrs);
    }

    // 判斷滑鼠是否靠近左側（小於 100px）
    if (mouseX >= 0 && mouseX < 100) {
        menuTargetX = 0;
    } else {
        menuTargetX = -menuWidth;
    }
    // 平滑動畫
    menuX = lerp(menuX, menuTargetX, 0.18);

    // 畫選單（半透明白）
    push();
    // 臨時切回 RGB 方便設定 alpha（避免受 HSB 設定影響）
    colorMode(RGB, 255);
    noStroke();
    fill(255, 127); // 白色，alpha 127 ~ 50%
    // rectangle 是以中心為基準（rectMode CENTER），計算中心點
    let menuHeight = menuPadding * 2 + menuItems.length * itemHeight + (menuItems.length - 1) * 8;
    rect(menuX + menuWidth / 2, height / 2, menuWidth, menuHeight, 6);
    pop();

    // 畫子選單文字（黑字，滑鼠靠近變紅）
    push();
    // 預設字體大小
    textAlign(LEFT, CENTER);
    // 使用 RGB 模式畫字
    colorMode(RGB, 255);
    for (let i = 0; i < menuItems.length; i++) {
        let itemY = height / 2 - menuHeight / 2 + menuPadding + itemHeight / 2 + i * (itemHeight + 8);
        let itemX = menuX + 16; // menuPadding 左邊距

        // 設置字體大小
        if (menuItems[i] === '自我介紹') {
            textSize(24); // 自我介紹使用 24pt
        } else {
            textSize(20); // 其他使用 20pt
        }

        // 判斷滑鼠是否在該子選單上（只有在選單露出時才檢查）
        let hovered = mouseX > menuX && mouseX < menuX + menuWidth && mouseY > (itemY - itemHeight / 2) && mouseY < (itemY + itemHeight / 2);
        if (hovered && menuX > -menuWidth + 1) { // 增加條件：選單需已展開
            fill(255, 0, 0); // 紅色
        } else {
            fill(0); // 黑色
        }

        // 顯示文字
        text(menuItems[i], itemX, itemY);
    }
    pop();
}

// 處理選單點擊事件
function mouseClicked() {
    // 只有在選單完全展開時（或接近完全展開，為了點擊順暢）才處理點擊
    if (menuX > -menuWidth + 1) {
        let menuHeight = menuPadding * 2 + menuItems.length * itemHeight + (menuItems.length - 1) * 8;

        for (let i = 0; i < menuItems.length; i++) {
            let itemY = height / 2 - menuHeight / 2 + menuPadding + itemHeight / 2 + i * (itemHeight + 8);
            let itemX = menuX;

            // 檢查點擊位置是否在選單項目區域
            let clicked = mouseX > itemX && mouseX < itemX + menuWidth && mouseY > (itemY - itemHeight / 2) && mouseY < (itemY + itemHeight / 2);

            if (clicked) {
                if (menuItems[i] === '自我介紹') {
                    // 在覆蓋層顯示自我介紹內容（非連結）
                    showOverlay(links[i], false);
                } else {
                    // 在同一頁面內以 iframe 顯示連結
                    showOverlay(links[i], true);
                }
                // 點擊後隱藏選單（可選）
                menuTargetX = -menuWidth;
                break;
            }
        }
    }
}

// 新增：顯示覆蓋層（urlOrText 為字串；isUrl 決定使用 iframe 還是純文字）
function showOverlay(urlOrText, isUrl) {
    // 若已存在覆蓋層，先移除
    closeOverlay();

    // 建立遮罩容器
    overlayDiv = createDiv();
    overlayDiv.position(0, 0);
    overlayDiv.size(windowWidth, windowHeight);
    overlayDiv.style('background', 'rgba(0,0,0,0.6)');
    overlayDiv.style('z-index', '9999');

    // 建立內容框（置中）
    let box = createDiv();
    let boxW = min(windowWidth * 0.9, 1000);
    let boxH = min(windowHeight * 0.85, 800);
    box.parent(overlayDiv);
    box.style('position', 'absolute');
    box.style('left', `${(windowWidth - boxW) / 2}px`);
    box.style('top', `${(windowHeight - boxH) / 2}px`);
    box.style('width', `${boxW}px`);
    box.style('height', `${boxH}px`);
    box.style('background', '#fff');
    box.style('border-radius', '8px');
    box.style('padding', '8px');
    box.style('box-shadow', '0 8px 30px rgba(0,0,0,0.4)');
    box.style('overflow', 'hidden');

    // 關閉按鈕
    closeBtn = createButton('關閉');
    closeBtn.parent(box);
    closeBtn.position(boxW - 70, 8);
    closeBtn.style('z-index', '10000');
    closeBtn.style('padding', '6px 10px');
    closeBtn.mousePressed(closeOverlay);

    if (isUrl) {
        // 建立 iframe 並設定 src
        iframeEl = createElement('iframe');
        iframeEl.parent(box);
        iframeEl.attribute('src', urlOrText);
        iframeEl.attribute('frameborder', '0');
        iframeEl.style('width', '100%');
        iframeEl.style('height', `${boxH - 40}px`);
        iframeEl.style('border', 'none');
    } else {
        // 顯示純文字內容
        contentDiv = createDiv(urlOrText);
        contentDiv.parent(box);
        contentDiv.style('padding', '12px');
        contentDiv.style('white-space', 'pre-wrap');
        contentDiv.style('font-size', '18px');
        contentDiv.style('color', '#111');
    }
}

// 新增：關閉並移除覆蓋層
function closeOverlay() {
    if (iframeEl) {
        iframeEl.remove();
        iframeEl = null;
    }
    if (contentDiv) {
        contentDiv.remove();
        contentDiv = null;
    }
    if (closeBtn) {
        closeBtn.remove();
        closeBtn = null;
    }
    if (overlayDiv) {
        overlayDiv.remove();
        overlayDiv = null;
    }
}

function drawWindow(x, y, w, h, clrs) {
    let corner = 5;
    let bar = 25;
    let iconSize = 15;
    push();
    translate(x, y);
    fill('#000000');
    rect(3, 3, w, h, corner);

    fill('#F9F4E7');
    rect(0, 0, w, h, corner);
    fill(clrs[0]);
    rect(0, -(h / 2) + bar / 2, w, bar, corner, corner, 0, 0);
    fill(clrs[1]);
    icon_01((w / 2) - (bar / 2), -(h / 2) + (bar / 2), iconSize, iconSize / 10);
    icon_02((w / 2) - (bar * 1.25), -(h / 2) + (bar / 2), iconSize, iconSize / 10);
    icon_03((w / 2) - (bar * 2), -(h / 2) + (bar / 2), iconSize, iconSize / 10);
    pop();
}

function divideRect(x, y, w, h, minSize) {
    let ww = random(0.25, 0.75) * w;
    let hh = random(0.25, 0.75) * h;
    let xx = x - (w / 2) + ww;
    let yy = y - (h / 2) + hh;

    if (minSize < min(ww, w - ww) && minSize < min(hh, h - hh)) {
        if (h < w) {
            divideRect(xx - ww / 2, y, ww, h, minSize);
            divideRect(xx + (w - ww) / 2, y, (w - ww), h, minSize);
        } else {
            divideRect(x, yy - hh / 2, w, hh, minSize);
            divideRect(x, yy + (h - hh) / 2, w, h - hh, minSize);
        }
    } else {
        shapes.push({ x: x, y: y, w: w, h: h });
    }
}

function icon_01(x, y, w) {
    push();
    translate(x, y);
    square(0, 0, w, w * 0.25);
    drawCross(0, 0, w * 0.5);
    pop();
}
function icon_02(x, y, w) {
    push();
    translate(x, y);
    square(0, 0, w, w * 0.25);
    square(0, 0, w * 0.5);
    line(-w * 0.25, -w * 0.175, w * 0.25, -w * 0.175);
    pop();
}
function icon_03(x, y, w) {
    push();
    translate(x, y);
    square(0, 0, w, w * 0.1);
    line(-w * 0.25, w * 0.175, w * 0.25, w * 0.175);
    pop();
}

function drawCross(x, y, w) {
    push();
    line(x - w / 2, y - w / 2, x + w / 2, y + w / 2);
    line(x - w / 2, y + w / 2, x + w / 2, y - w / 2);
    pop();
}

function drawGrid(x, y, w, cellCount) {
    let cellW = w / cellCount;
    for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
            let cellX = j * cellW + cellW / 2 + x - (w / 2);
            let cellY = i * cellW + cellW / 2 + y - (w / 2);
            let clr = '#343434'
            if ((i + j) % 2 == 0) {
                clr = '#9a9a9a'
            }
            fill(clr);
            rect(cellX, cellY, cellW);
        }
    }
}