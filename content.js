let baseSkuName=''
// 注入悬浮侧边栏
function injectSidebar() {
  // 防止重复注入
  if (document.getElementById("my-extension-sidebar")) return;

  // 创建侧边栏容器
  const sidebar = document.createElement("div");
  sidebar.id = "my-extension-sidebar";
  sidebar.style.position = "fixed";
  sidebar.style.top = "50px";
  sidebar.style.right = "0";
  sidebar.style.width = "200px";
  sidebar.style.height = "150px";
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

  // 添加功能按钮
//   const feature2Button = document.createElement("button");
//   feature2Button.innerText = "获取物流 sku 条码面单名";
//   feature2Button.style.marginBottom = "10px";
//   feature2Button.style.padding = "10px";
//   feature2Button.style.cursor = "pointer";
//   feature2Button.onclick = copyShipping; // 绑定功能2按钮事件

  // 创建收缩/展开按钮
  const toggleButton = document.createElement("button");
  toggleButton.innerText = "收缩";
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "0";
  toggleButton.style.left = "0";
  toggleButton.style.width = "100%";
  toggleButton.style.height = "25%"; // 高度为侧边栏的 1/4
  toggleButton.style.border = "none";
  toggleButton.style.backgroundColor = "#1890ff";
  toggleButton.style.color = "white";
  toggleButton.style.fontSize = "16px";
  toggleButton.style.cursor = "pointer";
  toggleButton.onclick = () =>
    toggleSidebar(sidebar, toggleButton, sidebarContent);

  // 将按钮放入内容区域
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
    sidebar.style.height = "150px";
    toggleButton.innerText = "收缩"; // 更新按钮文本
    sidebarContent.style.display = "flex"; // 恢复内容显示
  } else {
    sidebar.style.width = "50px"; // 收缩至只显示按钮
    sidebar.style.height = "200px"; // 保持原有高度
    toggleButton.innerText = "展开"; // 更新按钮文本
    sidebarContent.style.display = "flex"; // 确保按钮可见，但不显示内容
  }
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

  // 灯种类、灯颜色、灯开关类型的关键字
  const lightTypes = ["5050", "2835", "霓虹灯", "cob"];
  const lightColors = ["红", "橙", "黄", "绿", "粉", "蓝", "紫", "暖白", "rgb"];
  const switchTypes = [
    "三键",
    "按键",
    "电池盒",
    "触摸",
    "501",
    "24键红外",
    "24键蓝牙",
    "44键红外",
    "44键蓝牙",
    "20键红外",
    "20键蓝牙",
  ];

  tables.forEach((table, tableIndex) => {
    // 获取表头列数据
    const headers = table.querySelectorAll("th");
    const headerNames = [];
    headers.forEach((header) => {
      headerNames.push(header.innerText.trim());
    });

    console.log("表头:", headerNames);

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
  baseSkuName=refinedProductNames + "-" + allSizes.join("")
  let result = baseSkuName+ "米条码";
  copyToClipboard(result);
}

function copyShipping(){
    copyToClipboard(baseSkuName+'米面单');
}

// 精炼商品名称的函数
function refineProductName(productName, lightTypes, lightColors, switchTypes) {
    let lightType = "";
    let lightColor = "";
    let switchType = "";
  
    // 查找灯种类
    lightTypes.forEach((type) => {
      if (productName.includes(type)) {
        lightType = type;
      }
    });
  
    // 查找灯颜色（在识别开关类型之前）
    lightColors.forEach((color) => {
      // 使用正则匹配独立词或复合词
      const regex = new RegExp(`(?:^|\\W)(${color})(?:\\W|$)`, "i"); // 匹配独立或复合词
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
    }
  
    // 查找灯开关类型
    switchTypes.forEach((switchKeyword) => {
      if (productName.includes(switchKeyword)) {
        switchType = switchKeyword;
      }
    });
  
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

// 检查当前页面的 URL 是否符合条件
function checkUrlAndHandleSidebar() {
  const currentUrl = window.location.href;
  const targetDomain = "https://seller.kuajingmaihuo.com";
  const targetRoute = "shipping-list";

  // 如果 URL 符合条件，显示侧边栏
  if (currentUrl.startsWith(targetDomain) && currentUrl.includes(targetRoute)) {
    injectSidebar();
  } else {
    // 否则关闭侧边栏
    closeSidebar();
  }
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
observer.observe(document.body, { childList: true, subtree: true });
