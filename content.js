let baseSkuName = "";
// 灯种类、灯颜色、灯开关类型的关键字
const lightTypes = ["5050", "2835", "霓虹灯", "cob"];
const lightColors = ["红", "橙", "黄", "绿", "粉", "蓝", "紫", "白","暖白", "rgb"];
const switchTypes = [
  "三键",
  "按键",
  "电池盒",
  "触控",
  "501",
  "24键遥控",
  "24键蓝牙",
  "44键红外",
  "44键蓝牙",
  "20键红外",
  "20键蓝牙",
];
let tableData =[]
// 注入悬浮侧边栏
function injectSidebar() {
  // 防止重复注入
  if (document.getElementById("my-extension-sidebar")) return;
  const script2 = document.createElement("script");
  script2.src = chrome.runtime.getURL("libs/xlsx.bundle.js");
  document.head.appendChild(script2);
  // 创建侧边栏容器
  const sidebar = document.createElement("div");
  sidebar.id = "my-extension-sidebar";
  sidebar.style.position = "fixed";
  sidebar.style.top = "50px";
  sidebar.style.right = "0";
  sidebar.style.width = "200px";
  sidebar.style.height = "250px";
  sidebar.style.backgroundColor = "#fff";
  sidebar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
  sidebar.style.zIndex = "10000";
  sidebar.style.borderRadius = "8px 0 0 8px";
  sidebar.style.fontFamily = "Arial, sans-serif";
  sidebar.style.transition = "width 0.3s, height 0.3s"; // 添加平滑过渡效果
  sidebar.style.opacity = 0.85;
  // 创建一个容器来包装按钮和内容
  const sidebarContent = document.createElement("div");
  sidebarContent.style.display = "flex";
  sidebarContent.style.flexDirection = "column";
  sidebarContent.style.height = "100%";
  sidebarContent.style.padding = "10px";
  sidebarContent.style.overflowY = "auto";
  sidebarContent.style.marginTop = "50px";

  // 添加关闭按钮
  const closeButton = document.createElement("button");
  closeButton.innerText = "×";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.left = "-30px";
  closeButton.style.width = "25px";
  closeButton.style.height = "25px";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "50%";
  closeButton.style.backgroundColor = "#ff5c5c";
  closeButton.style.color = "white";
  closeButton.style.fontSize = "18px";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = () => sidebar.remove();

  // 添加功能按钮
  const feature1Button = document.createElement("button");
  feature1Button.innerText = "获取物流 sku 条码名";
  feature1Button.style.marginBottom = "10px";
  feature1Button.style.padding = "10px";
  feature1Button.style.cursor = "pointer";
  feature1Button.onclick = extractTableData; // 绑定功能1按钮事件

  // 文件上传输入框
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.marginBottom = "10px";

  // 获取发单信息按钮
  const parsePdfButton = document.createElement("button");
  parsePdfButton.innerText = "获取发单信息";
  parsePdfButton.style.marginBottom = "10px";
  parsePdfButton.style.padding = "10px";
  parsePdfButton.style.cursor = "pointer";
  parsePdfButton.onclick = () => parseXlsxFile(fileInput.files[0]);

  const pdfToExel = document.createElement("a");
  pdfToExel.href = "https://smallpdf.com/cn/pdf-to-excel#r=convert-to-excel";
  pdfToExel.textContent = "请先将 pdf 在线转化为 excel 格式";
  pdfToExel.style.marginBottom = "10px";
  pdfToExel.target = "_blank";

  // 创建收缩/展开按钮
  const toggleButton = document.createElement("button");
  toggleButton.innerText = "收缩";
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "0";
  toggleButton.style.left = "0";
  toggleButton.style.width = "100%";
  toggleButton.style.height = "15%"; // 高度为侧边栏的 1/4
  toggleButton.style.border = "none";
  toggleButton.style.backgroundColor = "#1890ff";
  toggleButton.style.color = "white";
  toggleButton.style.fontSize = "16px";
  toggleButton.style.cursor = "pointer";
  toggleButton.onclick = () =>
    toggleSidebar(sidebar, toggleButton, sidebarContent);

  // 将按钮放入内容区域
  sidebarContent.appendChild(pdfToExel);
  sidebarContent.appendChild(fileInput);
  sidebarContent.appendChild(parsePdfButton);
  sidebarContent.appendChild(toggleButton);
  sidebarContent.appendChild(feature1Button);
  //   sidebarContent.appendChild(feature2Button);
  sidebarContent.appendChild(closeButton); // 关闭按钮放在内容区域内
  sidebar.appendChild(sidebarContent);
  document.body.appendChild(sidebar);
}

// 收缩/展开侧边栏
function toggleSidebar(sidebar, toggleButton, sidebarContent) {
  const isCollapsed = sidebar.style.width === "50px"; // 判断当前状态
  if (isCollapsed) {
    sidebar.style.width = "200px"; // 展开
    sidebar.style.height = "250px";
    toggleButton.innerText = "收缩"; // 更新按钮文本
    sidebarContent.style.display = "flex"; // 恢复内容显示
  } else {
    sidebar.style.width = "50px"; // 收缩至只显示按钮
    sidebar.style.height = "200px"; // 保持原有高度
    toggleButton.innerText = "展开"; // 更新按钮文本
    sidebarContent.style.display = "flex"; // 确保按钮可见，但不显示内容
  }
}

// 解析每一个 table
function extractSKCData(table) {
  const result = [];
  let currentSKC = null;
  let stockNumber = null;
  let skuList = [];
  let pendingVal = null;

  table.forEach((row, index) => {
    // 检查当前行是否为 SKC 行
    if (row[1] && row[1].startsWith("SKC：")) {
      // 如果存在当前 SKC，保存其数据
      if (currentSKC) {
        result.push({ skc: currentSKC, stockNumber, sku: skuList });
      }

      // 更新当前 SKC 和 SKU 数据
      currentSKC = row[1].replace("SKC：", "").split("\n")[0].trim(); // 取 SKC 后的第一部分，并去掉换行符及多余空格
      stockNumber = null; // 重置 stockNumber
      skuList = [];

      // 添加第一个 SKU
      if (row[2]) {
        const firstSkuKey = row[2];
        const firstSkuVal = row[5] || pendingVal || 0;
        skuList.push({ key: firstSkuKey, val: firstSkuVal });
        pendingVal = null; // 清除挂起值
      }
      if (row[1] && row[1].includes("备货单号：")) {
        stockNumber = row[1].match(/备货单号：(WB\d+)/)?.[1] || null;
      }
    }
    // 检查是否为备货单号行
    else if (row[1] && row[1].includes("备货单号：")) {
      stockNumber = row[1].match(/备货单号：(WB\d+)/)?.[1] || null;
      if (row[2] && row[2] !== "合计") {
        const key = row[2];
        const val = pendingVal !== null ? pendingVal : row[5] || 0;
        skuList.push({ key, val });
        pendingVal = null; // 清除挂起值
      }
    }
    // 处理 SKU 数据行（非"合计"行）
    else if (row[2] && row[2] !== "合计") {
      const key = row[2];
      const val = pendingVal !== null ? pendingVal : row[5] || 0;
      skuList.push({ key, val });
      pendingVal = null; // 清除挂起值
    }
    // 处理特殊情况：数量在单独一行
    else if (row.filter((item) => item).length === 1 && row[5]) {
      pendingVal = row[5];
    }
  });

  // 最后一个 SKC 数据的处理
  if (currentSKC) {
    result.push({ skc: currentSKC, stockNumber, sku: skuList });
  }

  return result;
}

function setSkcName(data) {
  data.forEach((item) => {
    const dataItem = tableData.find(
      (data) => data.stockNumber === item.stockNumber
    );
    if (dataItem) {
      item.name = dataItem.name;
    }
  });
}

function setShippingNumber(data) {
  data.forEach((item) => {
    const dataItem = tableData.find(
      (data) => data.stockNumber === item.stockNumber
    );
    if (dataItem) {
      item.shippingNumber = dataItem.shippingNumber;
    }
  });
}

// 解析 PDF 文件
// 改进后的解析 PDF 文件函数
async function parseXlsxFile(file) {
  if (!file) {
    alert("请先上传一个 .xlsx 文件！");
    return;
  }

  const reader = new FileReader();
  // 提取所有的 table 关键信息
  let tablesData = [];
  console.log(2)
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    // 创建一个对象来存储所有工作表的数据
    const allSheetsData = {};

    // 遍历每个工作表
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 将工作表转换为数组
      allSheetsData[sheetName] = sheetData; // 存储工作表数据
    });

    for (let key in allSheetsData) {
      const table = allSheetsData[key];
      const tableData = extractSKCData(table);
      setSkcName(tableData);
      setShippingNumber(tableData);
      tablesData.push(tableData);
    }

    generateXlsFile(tablesData);
  };
  reader.readAsArrayBuffer(file);
}

// 格式化行数据，根据列数对齐
function formatRowData(rowCells, columnCount) {
  const row = new Array(columnCount).fill(""); // 创建固定长度的行
  rowCells.sort((a, b) => a.x - b.x); // 按 x 坐标排序，确保列顺序正确

  // 填充行数据
  rowCells.forEach((cell, index) => {
    if (index < columnCount) {
      row[index] = cell.text;
    }
  });

  return row;
}

function updateBoxCount(data) {
  // 创建一个 Map 来存储每个"物流单号"的箱数总和
  const boxCountMap = new Map();

  // 遍历数据，统计每个"物流单号"的总"箱数"
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const trackingNumber = row[0]; // 物流单号
    const boxCount = row[6]; // 箱数

    // 如果"箱数"为空或非数字，则跳过此行
    if (boxCount === "" || isNaN(boxCount)) {
      continue;
    }

    // 如果 Map 中没有该物流单号，则添加
    if (!boxCountMap.has(trackingNumber)) {
      boxCountMap.set(trackingNumber, 0);
    }

    // 累加"箱数"
    boxCountMap.set(trackingNumber, boxCountMap.get(trackingNumber) + boxCount);
  }

  // 更新数据
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const trackingNumber = row[0];

    // 获取当前物流单号的总箱数
    const totalBoxCount = boxCountMap.get(trackingNumber);

    // 只更新第一次出现的"物流单号"行，设置"箱数"列为总箱数
    if (i === data.findIndex(row => row[0] === trackingNumber)) {
      row[6] = totalBoxCount; // 更新"箱数"列
    } else {
      // 清空已统计的"箱数"列
      row[6] = "";
    }
  }
}


// 生成并下载 Excel 文件
function generateXlsFile(data) {
  let rows = [["物流单号", "品名", "颜色", "款式", "米数", "数量", "箱数"]];
  let boxNumberRanges = []; // 用于存储需要合并的箱数范围

  data.forEach((page) => {
    const shippingMap = new Map();
    page.forEach((item) => {
      const { shippingNumber, skc, sku, name } = item;

      // 获取商品类别
      const productType = getProductType(
        (name || "").replace(/\s+/g, ""),
        lightTypes,
        lightColors,
        switchTypes
      );
      let totalQuantity = 0;

      sku.forEach(({ key, val }) => {
        const match = key.match(/(\d+(?:\.\d+)?)/);
        const length = match ? match[1] : "";
        totalQuantity += val;
        rows.push([
          shippingNumber,
          productType[0],
          productType[1],
          productType[2],
          length,
          val,
          "", // "箱数"列初始化为空
        ]);
      });

      if (!shippingMap.has(shippingNumber)) {
        shippingMap.set(shippingNumber, new Map());
      }
      const skcMap = shippingMap.get(shippingNumber);
      if (!skcMap.has(skc)) {
        skcMap.set(skc, 0);
      }
      skcMap.set(skc, skcMap.get(skc) + Math.ceil(totalQuantity / 80));
    });

    let currentIndex =
      rows.length - page.reduce((sum, item) => sum + item.sku.length, 0);
    shippingMap.forEach((skcMap) => {
      skcMap.forEach((boxCount) => {
        rows.slice(currentIndex, currentIndex + boxCount).forEach((row) => {
          row[6] = boxCount; // 填充箱数
        });

        // 记录箱数合并的范围
        const startRow = currentIndex;
        const endRow = currentIndex + boxCount - 1;
        boxNumberRanges.push({ startRow, endRow });

        currentIndex += boxCount;
      });
    });
  });

  updateBoxCount(rows)

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // 设置单元格的样式：水平和垂直居中，以及边框
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell_address]) continue;

      // 设置单元格的样式：水平和垂直居中，以及边框
      worksheet[cell_address].s = {
        alignment: {
          horizontal: "center", // 水平居中
          vertical: "center", // 垂直居中
          wrapText: true, // 自动换行
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" }, // 这里确保左边框存在
          right: { style: "thin" },
        },
      };

      // 设置表头字体加粗并变红
      if (R === 0) {
        worksheet[cell_address].s.font = {
          bold: true,
          color: { rgb: "FF0000" },
        };
      }
    }
  }

  // 合并"箱数"列，和"物流单号"列逻辑保持一致
  let startRow1 = 1;
  let lastShippingNumber1 = "";
  rows.forEach((row, index) => {
    if (index === 0) return;
    if (row[0] !== lastShippingNumber1) {
      if (index > startRow1 + 1) {
        worksheet["!merges"] = worksheet["!merges"] || [];
        worksheet["!merges"].push({
          s: { r: startRow1, c: 6 }, // 合并"箱数"列
          e: { r: index - 1, c: 6 },
        });
      }
      lastShippingNumber1 = row[0];
      startRow1 = index;
    }
  });

  if (rows.length > startRow1 + 1) {
    worksheet["!merges"] = worksheet["!merges"] || [];
    worksheet["!merges"].push({
      s: { r: startRow1, c: 6 },
      e: { r: rows.length - 1, c: 6 },
    });
  }


  // 合并物流单号列
  let lastShippingNumber = "";
  let startRow = 1;
  rows.forEach((row, index) => {
    if (index === 0) return;
    if (row[0] !== lastShippingNumber) {
      if (index > startRow + 1) {
        worksheet["!merges"] = worksheet["!merges"] || [];
        worksheet["!merges"].push({
          s: { r: startRow, c: 0 },
          e: { r: index - 1, c: 0 },
        });
      }
      lastShippingNumber = row[0];
      startRow = index;
    }
  });

  if (rows.length > startRow + 1) {
    worksheet["!merges"] = worksheet["!merges"] || [];
    worksheet["!merges"].push({
      s: { r: startRow, c: 0 },
      e: { r: rows.length - 1, c: 0 },
    });
  }

  worksheet["!cols"] = [{ wpx: 514 }, {}, {}, {}, {}, {}, {}];

  XLSX.utils.book_append_sheet(workbook, worksheet, "发单信息");
  const date=new Date()
  const year=date.getFullYear()
  const month=date.getMonth()+1
  // 一般都是做次日的单
  const day=date.getDate()+1
  XLSX.writeFile(workbook, `秦天代发_${year}_${month}_${day}.xlsx`);
}

// 提取页面中的 table 数据并打印
// 提取页面中的 table 数据并打印，提取商品名称、次销售属性并精炼
function extractTableData() {
  const tables = document.querySelectorAll(
    '[data-testid="beast-core-drawer-content"] table'
  ); // 获取具有指定属性的 table 元素

  // 如果没有找到表格
  if (tables.length === 0) {
    console.log("没有找到符合条件的表格！");
    return;
  }

  let allSizes = []; // 存储所有的米数
  let refinedProductNames = ""; // 存储精炼后的商品名称
  tables.forEach((table, tableIndex) => {
    // 获取表头列数据
    const headers = table.querySelectorAll("th");
    const headerNames = [];
    headers.forEach((header) => {
      headerNames.push(header.innerText.trim());
    });
    console.log(1)
    // 获取每一行的数据
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      const columns = row.querySelectorAll("td");
      if (columns.length > 0) {
        // 只处理包含数据的行
        const rowData = [];
        columns.forEach((column, colIndex) => {
          rowData.push(column.innerText.trim());
        });

        // 提取次销售属性列的数据，假设是第 4 列（根据你的表格）
        const secondAttribute = rowData[4]; // 次销售属性

        // 从次销售属性提取米数（例如 "3m"）
        const sizeMatch = secondAttribute.match(/(\d+)m/);
        if (sizeMatch) {
          allSizes.push(parseInt(sizeMatch[1])); // 将提取到的米数加入数组
        }

        // 提取商品名称，假设商品名称在第 1 列
        const productName = rowData[0]; // 商品名称

        // 提取并精炼商品名称
        const refinedName = refineProductName(
          productName.replace(/\s+/g, ""),
          lightTypes,
          lightColors,
          switchTypes
        );
        if (refinedName) {
          refinedProductNames = refinedName; // 存储精炼后的商品名称
        }
      }
    });
  });

  // 对米数进行升序排列
  allSizes.sort((a, b) => a - b);
  baseSkuName = refinedProductNames + "-" + allSizes.join("");
  let result = baseSkuName + "米条码";
  copyToClipboard(result);
}

function copyShipping() {
  copyToClipboard(baseSkuName + "米面单");
}


// 精炼商品名称的函数
function refineProductName(productName, inputLightTypes, inputLightColors, inputSwitchTypes) {
 const [lightType, lightColor, switchType]=  getProductType(productName, inputLightTypes, inputLightColors, inputSwitchTypes)

  // 返回精炼后的商品名称
  if (lightType && lightColor && switchType) {
    return `${lightType}-${lightColor}-${switchType}`;
  } else if (lightType && lightColor) {
    return `${lightType}-${lightColor}`;
  } else if (lightType && switchType) {
    return `${lightType}-${switchType}`;
  } else if (lightColor && switchType) {
    return `${lightColor}-${switchType}`;
  }

  return ""; // 如果没有完全匹配到，就返回空字符串
}

function getProductType(productName, lightTypes, lightColors, switchTypes) {
  let lightType = "";
  let lightColor = "";
  let switchType = "";

  // 查找灯种类
  lightTypes.forEach((type) => {
    if (productName.includes(type)) {
      lightType = type;
    }else{
      // 查找不到的情况默认霓虹灯
      lightType="霓虹灯"
    }
  });

  // 查找灯颜色（在识别开关类型之前）
  lightColors.forEach((color) => {
    // 修改正则表达式以匹配更灵活的颜色组合
    const regex = new RegExp(color, "i"); // 简化正则，直接匹配颜色字符
    if (
      regex.test(productName) &&
      !isColorInSwitchType(color, productName, switchTypes)
    ) {
      lightColor = color;
    }
  });

  // 如果没有找到灯颜色，默认使用 rgb
  if (!lightColor) {
    lightColor = "rgb";
    if(lightType==='cob'){
      lightColor="暖白"
    }
  }

  // 查找灯开关类型
  switchTypes.forEach((switchKeyword) => {
    if (productName.includes(switchKeyword)) {
      switchType = switchKeyword;
    }
  });

  // 个人商品命名问题，暖白-三键-霓虹灯时转成无极开关
  if(lightColor==='暖白'&&lightType==="霓虹灯"&&switchType==='三键'){
    switchType='无极'
  }
   // 个人商品命名问题，24 键遥控霓虹灯转 24键红外
  if(lightColor==='rgb'&&lightType==='霓虹灯'&&switchType==='24键遥控'){
    switchType='24键红外'
  }

  if(!switchType){
    if(lightType==='cob'){
      switchType="按键"
    }
  }
  return [lightType, lightColor, switchType];
}

// 用于检测颜色是否属于开关类型的函数
function isColorInSwitchType(color, productName, switchTypes) {
  return switchTypes.some((switchKeyword) => {
    const regex = new RegExp(`(?:^|\\W)(${color})(?:\\W|$)`, "i"); // 避免颜色误判
    return productName.includes(switchKeyword) && regex.test(switchKeyword);
  });
}

// 复制字符串到剪贴板并显示提示的函数
function copyToClipboard(text) {
  // 创建一个隐藏的文本区域元素
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // 将文本区域添加到文档中
  document.body.appendChild(textarea);

  // 选中文本
  textarea.select();

  // 执行复制操作
  document.execCommand("copy");

  // 移除文本区域
  document.body.removeChild(textarea);

  // 创建并显示复制成功的提示
  const tooltip = document.createElement("div");
  tooltip.textContent = "文本已复制!";
  tooltip.style.position = "fixed";
  tooltip.style.top = "20px";
  tooltip.style.right = "40%";
  tooltip.style.padding = "10px";
  tooltip.style.backgroundColor = "#1890ff";
  tooltip.style.color = "white";
  tooltip.style.borderRadius = "5px";
  tooltip.style.zIndex = "10000";
  tooltip.style.fontSize = "16px";

  // 添加到页面
  document.body.appendChild(tooltip);

  // 1.5秒后移除提示
  setTimeout(() => {
    document.body.removeChild(tooltip);
  }, 1500);
}

// 关闭悬浮侧边栏
function closeSidebar() {
  const sidebar = document.getElementById("my-extension-sidebar");
  if (sidebar) {
    sidebar.remove();
  }
}

// 使用 MutationObserver 监听页面加载
function waitForPageLoad() {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      // 检查是否加载了包含数据的元素
      const tables = document.querySelectorAll("table");
      if (tables.length > 0) {
        resolve(); // 页面加载完成，提取数据
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function removeDuplicateEntriesByName(data) {
  const uniqueData = [];
  const seenNumbers = new Set();

  data.forEach((entry) => {
    if (!seenNumbers.has(entry.stockNumber)) {
      seenNumbers.add(entry.stockNumber);
      uniqueData.push(entry);
    }
  });

  return uniqueData;
}

async function checkUrlAndHandleSidebar() {
  const currentUrl = window.location.href;
  const targetDomain = "https://seller.kuajingmaihuo.com";
  const targetRoute = "shipping-list";
  let times = 0;
  if (currentUrl.startsWith(targetDomain) && currentUrl.includes(targetRoute)) {
    injectSidebar();

    // 等待页面加载完成
    await waitForPageLoad();

    // 页面加载完成后提取表格数据 查询 10 次
    let timesInter = setInterval(async () => {
      if (times >= 10) {
        clearInterval(timesInter);
        return;
      }
      tableData = [...tableData, ...(await extractTableDataWithFields())];
      tableData = removeDuplicateEntriesByName(tableData);
      times++;
      console.warn(tableData)
    }, 1000);
  } else {
    closeSidebar();
  }
}
// 提取表格中包含"备货单号"和"名称"字段的数据
function extractTableDataWithFields() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tables = document.querySelectorAll("table"); // 获取页面中所有表格
      const extractedData = []; // 初始化存储结果的数组
      let lastShippingNumber
      tables.forEach((table) => {
        const rows = table.querySelectorAll("tr"); // 获取表格行
        rows.forEach((row) => {
          const columns = row.querySelectorAll("td"); // 获取行中的单元格
          if (columns.length > 0) {
            // 提取"商品信息"列的内容
            const productInfoCell = Array.from(columns).find((cell) =>
              cell.innerText.includes("备货单号")
            );

            if (productInfoCell) {
              const productInfoText = productInfoCell.innerText.trim();

              // 使用正则表达式提取备货单号和名称
              const extractValue = (text, key) => {
                const regex = new RegExp(`${key}：(.+?)(\\n|$)`);
                const match = text.match(regex);
                return match ? match[1].trim() : null;
              };

              const stockNumber = extractValue(productInfoText, "备货单号");
              const name = extractValue(productInfoText, "名称");

              // 查找同一行中的"物流单号"单元格
              const shippingInfoCell = Array.from(columns).find((cell) =>
                cell.innerText.includes("物流单号")
              );
              let shippingNumber = null;

              if (shippingInfoCell) {
                // 提取"物流单号"文本
                const shippingSpan = shippingInfoCell.querySelector("a span");
                if (shippingSpan) {
                  shippingNumber = shippingSpan.innerText.trim();
                  lastShippingNumber=shippingNumber
                }
              }else{
                // 若不存在 shippingInfoCell 单元格，说明此行数据与上一行数据为合并表单，物流取用上行数据的物流
                shippingNumber=lastShippingNumber
              }

              // 如果找到有效值，存入数组
              if (stockNumber && name) {
                extractedData.push({
                  name,
                  stockNumber,
                  shippingNumber,
                });
              }
            }
          }
        });
      });
      resolve(extractedData);
    }, 3000);
  });
}

// 页面加载时检查 URL
checkUrlAndHandleSidebar();

// 监听 URL 变化（支持 SPA 路由）
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    checkUrlAndHandleSidebar();
  }
});
// 监听整个文档的点击事件
document.addEventListener("click", (event) => {
  // 判断点击的元素是否是目标元素，或是否包含目标属性
  const targetElement = event.target.closest(
    '[data-testid="beast-core-tab-topWrapper"]'
  );
  if (targetElement) {
    checkUrlAndHandleSidebar();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
