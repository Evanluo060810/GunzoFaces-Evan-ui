// 国家数据加载工具（网络 -> 缓存 -> 本地文件）
(function() {
  // 配置：数据源与存储键名
  const DATA_URL = 'https://gunzo.oss-cn-shenzhen.aliyuncs.com/Data/countryData.json';
  const PROXY_URL = 'https://api.allorigins.win/get?url=' + encodeURIComponent(DATA_URL);
  const LOCAL_JSON_PATH = './Data/countryData.json'; // 本地Data文件夹中的JSON路径
  const DATALIST_ID = 'nationlist';
  const CACHE_KEY = 'countryDataCache'; // 带有效期的缓存（7天）
  const CACHE_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 缓存有效期

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    const datalist = document.getElementById(DATALIST_ID);
    if (!datalist) return;

    // 显示加载状态
    const loadingOption = document.createElement('option');
    loadingOption.value = '加载中国家数据...';
    datalist.appendChild(loadingOption);

    try {
      // 1. 优先使用缓存（有有效期）
      const cachedData = getCachedData();
      if (cachedData) {
        fillDatalist(datalist, cachedData);
        return;
      }

      // 2. 缓存无效，尝试请求远程数据
      let countryData;
      try {
        // 先直接请求，失败用代理
        countryData = await fetchData(DATA_URL);
      } catch (directErr) {
        console.log('直接请求失败，尝试代理:', directErr);
        try {
          countryData = await fetchData(PROXY_URL, true);
        } catch (proxyErr) {
          // 3. 远程请求完全失败，尝试读取本地JSON文件
          console.log('代理请求失败，尝试本地文件:', proxyErr);
          try {
            countryData = await fetchLocalJson();
          } catch (localErr) {
            // 本地文件也失败，抛出最终错误
            throw new Error('远程数据和本地文件均不可用');
          }
        }
      }

      // 4. 数据获取成功（网络或本地文件），更新缓存
      cacheData(countryData);

      // 填充数据
      fillDatalist(datalist, countryData);

    } catch (error) {
      console.error('最终加载失败:', error);
      datalist.innerHTML = '<option value="数据加载失败，请手动输入"></option>';
    }
  }

  // 发起网络请求（支持直接请求和代理）
  async function fetchData(url, isProxy = false) {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'force-cache',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
    const data = await response.json();
    return isProxy ? JSON.parse(data.contents) : data;
  }

  // 读取本地Data文件夹中的JSON文件
  async function fetchLocalJson() {
    const response = await fetch(LOCAL_JSON_PATH, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`本地文件加载失败: ${response.statusText}`);
    return await response.json();
  }

  // 填充datalist
  function fillDatalist(datalist, countryData) {
    datalist.innerHTML = '';
    const fragment = document.createDocumentFragment();
    countryData.forEach(country => {
      const option = document.createElement('option');
      option.value = country.value;
      option.textContent = country.label;
      fragment.appendChild(option);
    });
    datalist.appendChild(fragment);
  }

  // 缓存相关（带有效期）
  function getCachedData() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRE) return data;
    localStorage.removeItem(CACHE_KEY); // 过期清除
    return null;
  }

  function cacheData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('缓存失败:', e);
    }
  }
})();