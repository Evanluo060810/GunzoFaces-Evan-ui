// 国家数据加载工具（网络 -> 缓存 -> 本地文件）
(function() {
  // 配置：数据源与存储键名
  const DATA_URL = 'https://gunzo.oss-cn-shenzhen.aliyuncs.com/Data/countryData.json';
  const PROXY_URL = 'https://api.allorigins.win/get?url=' + encodeURIComponent(DATA_URL);
  const LOCAL_JSON_PATH = 'Data/countryData.json'; // 本地Data文件夹中的JSON路径（移除./前缀）
  const DATALIST_ID = 'nationlist';
  const CACHE_KEY = 'countryDataCache'; // 带有效期的缓存（7天）
  const CACHE_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 缓存有效期
  
  // 内置完整国家数据（当所有其他尝试都失败时使用）
  const FULL_COUNTRY_DATA = [
    {"value": "None", "label": "无(GZRS)"},
    {"value": "Ghana", "label": "加纳"},
    {"value": "Gabon", "label": "加蓬"},
    {"value": "Guyana", "label": "圭亚那"},
    {"value": "Gambia", "label": "冈比亚"},
    {"value": "Guadeloupe", "label": "瓜德罗普岛"},
    {"value": "Guadeloupe_", "label": "瓜德罗普岛"},
    {"value": "Guatemala", "label": "危地马拉"},
    {"value": "Guam", "label": "关岛"},
    {"value": "Grenada", "label": "格林纳达"},
    {"value": "Greece", "label": "希腊"},
    {"value": "Guinea", "label": "几内亚"},
    {"value": "Guinea-Bissau", "label": "几内亚比索"},
    {"value": "Namibia", "label": "纳米比亚"},
    {"value": "Nigeria", "label": "尼日利亚"},
    {"value": "South Sudan", "label": "南苏丹"},
    {"value": "Republic of South Africa", "label": "南非共和国"},
    {"value": "Netherlands", "label": "荷兰"},
    {"value": "Nepal", "label": "尼泊尔"},
    {"value": "Norway", "label": "挪威"},
    {"value": "New Caledonia", "label": "新喀里多尼亚"},
    {"value": "New Zealand", "label": "新西兰"},
    {"value": "Niger", "label": "尼日尔"},
    {"value": "Nicaragua", "label": "尼加拉瓜"},
    {"value": "Taipei", "label": "中国台北"},
    {"value": "South Korea", "label": "韩国"},
    {"value": "Denmark", "label": "丹麦"},
    {"value": "Dominican Republic", "label": "多米尼加共和国"},
    {"value": "Commonwealth of Dominica", "label": "多米尼加"},
    {"value": "Germany", "label": "德国"},
    {"value": "Democratic Republic of Timor-Leste", "label": "东帝汶"},
    {"value": "Laos", "label": "老挝"},
    {"value": "Liberia", "label": "利比里亚"},
    {"value": "Latvia", "label": "拉脱维亚"},
    {"value": "Russia", "label": "俄罗斯"},
    {"value": "Lebanon", "label": "黎巴嫩"},
    {"value": "Lesotho", "label": "莱索托"},
    {"value": "La Réunion(Reunion Island)", "label": "留尼汪"},
    {"value": "Romania", "label": "罗马尼亚"},
    {"value": "Luxembourg", "label": "卢森堡"},
    {"value": "Rwanda", "label": "卢旺达"},
    {"value": "Libya", "label": "利比亚"},
    {"value": "Lithuania", "label": "立陶宛"},
    {"value": "Liechtenstein", "label": "列支敦士登"},
    {"value": "Madagascar", "label": "马达加斯加"},
    {"value": "Martinique", "label": "马提尼克岛"},
    {"value": "Mayotte", "label": "马约特"},
    {"value": "Macau", "label": "中国澳门"},
    {"value": "North Macedonia", "label": "北马其顿"},
    {"value": "Malawi", "label": "马拉维"},
    {"value": "Malaysia", "label": "马来西亚"},
    {"value": "Mali", "label": "马里"},
    {"value": "Mexico", "label": "墨西哥"},
    {"value": "Monaco", "label": "摩纳哥"},
    {"value": "Morocco", "label": "摩洛哥"},
    {"value": "Mauritius", "label": "毛里求斯"},
    {"value": "Mauritanie", "label": "毛里塔尼亚"},
    {"value": "Mozambique", "label": "莫桑比克"},
    {"value": "Montenegro", "label": "黑山"},
    {"value": "Montserrat", "label": "蒙塞拉特"},
    {"value": "Moldova", "label": "摩尔多瓦共和国"},
    {"value": "Maldives", "label": "马尔代夫"},
    {"value": "Malta", "label": "马耳他"},
    {"value": "Mongolia", "label": "蒙古"},
    {"value": "USA(America)", "label": "美国"},
    {"value": "Myanmar", "label": "缅甸"},
    {"value": "Micronesia", "label": "密克罗尼西亚"},
    {"value": "Vanuatu", "label": "瓦努阿图"},
    {"value": "Bahrain", "label": "巴林"},
    {"value": "Barbados", "label": "巴巴多斯"},
    {"value": "Bahamas", "label": "巴哈马"},
    {"value": "Bangladesh", "label": "孟加拉国"},
    {"value": "Bermuda", "label": "百慕大"},
    {"value": "Venezuela", "label": "委内瑞拉"},
    {"value": "Benin", "label": "贝宁"},
    {"value": "Vietnam", "label": "越南"},
    {"value": "Belgium", "label": "比利时"},
    {"value": "Belarus", "label": "白俄罗斯"},
    {"value": "Belize", "label": "伯利兹"},
    {"value": "Bosnia and Herzegovina(BiH)", "label": "波斯尼亚和黑塞哥维那"},
    {"value": "Bonaire", "label": "博内尔"},
    {"value": "Botswana", "label": "博茨瓦纳"},
    {"value": "Bolivia", "label": "玻利维亚"},
    {"value": "Burundi", "label": "布隆迪"},
    {"value": "Burkina Faso", "label": "布基纳法索"},
    {"value": "Bhutan", "label": "不丹"},
    {"value": "Northern Mariana Islands", "label": "北马里亚纳群岛"},
    {"value": "Northern Ireland", "label": "北爱尔兰"},
    {"value": "North Korea", "label": "朝鲜"},
    {"value": "Bulgaria", "label": "保加利亚"},
    {"value": "Brazil", "label": "巴西"},
    {"value": "Brunei", "label": "文莱"},
    {"value": "Samoa", "label": "萨摩亚"},
    {"value": "Saudi Arabia", "label": "沙特阿拉伯"},
    {"value": "San Marino", "label": "圣马力诺"},
    {"value": "Sâo Tomé Principe", "label": "圣多美和普林西比"},
    {"value": "Saint-Martin", "label": "圣马丁"},
    {"value": "Saint Barthélemy", "label": "圣巴特尔米"},
    {"value": "Saint-Pierre-et-Miquelon", "label": "圣皮埃尔米凯伦"},
    {"value": "Senegal", "label": "塞内加尔"},
    {"value": "Serbia", "label": "塞尔维亚"},
    {"value": "Serbia and Montenegro", "label": "塞尔维亚和黑山"},
    {"value": "Seychelles", "label": "塞舌尔"},
    {"value": "St. Kitts and Nevis", "label": "圣基茨内维斯"},
    {"value": "Saint Lucia", "label": "圣卢西亚"},
    {"value": "Saint Vincent and the Grenadines", "label": "圣文森特和格林纳丁斯"},
    {"value": "Somalia", "label": "索马里"},
    {"value": "Solomon Islands", "label": "所罗门群岛"},
    {"value": "Sudan", "label": "苏丹"},
    {"value": "Suriname", "label": "苏里南"},
    {"value": "Sri Lanka", "label": "斯里兰卡"},
    {"value": "Swaziland", "label": "斯威士兰"},
    {"value": "Sweden", "label": "瑞典"},
    {"value": "Swiss", "label": "瑞士"},
    {"value": "Scotland", "label": "苏格兰"},
    {"value": "Spain", "label": "西班牙"},
    {"value": "Slovak", "label": "斯洛伐克"},
    {"value": "Slovenia", "label": "斯洛文尼亚"},
    {"value": "Syrian Arab Republic", "label": "叙利亚"},
    {"value": "Sierra Leone", "label": "塞拉利昂"},
    {"value": "Sint Maarten", "label": "辛特·马尔顿"},
    {"value": "Singapore", "label": "新加波"},
    {"value": "uae", "label": "阿联酋"},
    {"value": "Aruba", "label": "阿鲁巴"},
    {"value": "Armenia", "label": "亚美尼亚"},
    {"value": "Argentina", "label": "阿根廷"},
    {"value": "American Samoa", "label": "美属萨摩亚"},
    {"value": "Iceland", "label": "冰岛"},
    {"value": "Haiti", "label": "海地"},
    {"value": "Ireland", "label": "爱尔兰"},
    {"value": "Afghanistan", "label": "阿富汗"},
    {"value": "Azerbaijan", "label": "阿塞拜疆"},
    {"value": "Anguilla", "label": "安圭拉"},
    {"value": "Andorra", "label": "安道尔"},
    {"value": "Albania", "label": "阿尔巴尼亚"},
    {"value": "Algeria", "label": "阿尔及利亚"},
    {"value": "Angola", "label": "安哥拉"},
    {"value": "Antigua and Barbuda", "label": "安提瓜和巴布达"},
    {"value": "Eritrea", "label": "厄立特里亚"},
    {"value": "Eswatini", "label": "斯威士兰"},
    {"value": "Estonia", "label": "爱沙尼亚"},
    {"value": "Ecuador", "label": "厄瓜多尔"},
    {"value": "Ethiopia", "label": "埃塞俄比亚"},
    {"value": "El Salvador", "label": "萨尔瓦多"},
    {"value": "United Kingdom(UK)", "label": "英国"},
    {"value": "British Virgin Islands", "label": "英属维尔京群岛"},
    {"value": "Yemen", "label": "也门"},
    {"value": "Oman", "label": "阿曼"},
    {"value": "Austria", "label": "奥地利"},
    {"value": "Australia", "label": "澳大利亚"},
    {"value": "Honduras", "label": "洪都拉斯"},
    {"value": "Jordan", "label": "约旦"},
    {"value": "Uganda", "label": "乌干达"},
    {"value": "Ukraine", "label": "乌拉圭"},
    {"value": "Uruguay", "label": "乌兹别克斯坦"},
    {"value": "Uzbekistan", "label": "瓦利斯和富图纳"},
    {"value": "Wallis-et-Futuna", "label": "월리스 후투나 제도"},
    {"value": "Iraq", "label": "伊拉克"},
    {"value": "Iran", "label": "伊朗"},
    {"value": "Israel", "label": "以色列"},
    {"value": "Egypt", "label": "埃及"},
    {"value": "Italy", "label": "意大利"},
    {"value": "India", "label": "印度"},
    {"value": "Indonesia", "label": "印度尼西亚"},
    {"value": "Japan", "label": "日本"},
    {"value": "England", "label": "英格兰"},
    {"value": "Wales", "label": "威尔士"},
    {"value": "Jamaica", "label": "牙买加"},
    {"value": "Zaire", "label": "扎伊尔"},
    {"value": "Zanzibar", "label": "桑给巴尔"},
    {"value": "Zambia", "label": "赞比亚"},
    {"value": "Equatorial Guinea", "label": "赤道几内亚"},
    {"value": "Georgia", "label": "格鲁吉亚"},
    {"value": "Central African Republic", "label": "中非共和国"},
    {"value": "China", "label": "中国"},
    {"value": "Djibouti", "label": "吉布提"},
    {"value": "Gibraltar", "label": "直布罗陀"},
    {"value": "Zimbabwe", "label": "津巴布韦"},
    {"value": "Chad", "label": "乍得"},
    {"value": "Czech Republic", "label": "捷克"},
    {"value": "Chile", "label": "智利"},
    {"value": "Cameroon", "label": "喀麦隆"},
    {"value": "Cabo Verde", "label": "佛得角"},
    {"value": "Kazakhstan", "label": "哈萨克斯坦"},
    {"value": "Qatar", "label": "卡塔尔"},
    {"value": "Cambodia", "label": "柬埔寨"},
    {"value": "Canada", "label": "加拿大"},
    {"value": "Kenya", "label": "肯尼亚"},
    {"value": "Cayman Islands", "label": "开曼群岛"},
    {"value": "Comoros", "label": "科摩罗"},
    {"value": "Kosovo", "label": "科索沃"},
    {"value": "Costa Rica", "label": "哥斯达黎加"},
    {"value": "Ivory Coast", "label": "象牙海岸"},
    {"value": "Cuba", "label": "古巴"},
    {"value": "Kuwait", "label": "科威特"},
    {"value": "Cook Islands", "label": "库克群岛"},
    {"value": "Curaçao", "label": "库拉索"},
    {"value": "Colombia", "label": "哥伦比亚"},
    {"value": "Republic of the Congo", "label": "刚果"},
    {"value": "Democratic Republic of Congo", "label": "刚果金"},
    {"value": "Croatia", "label": "克罗地亚"},
    {"value": "Kyrgyz Republic", "label": "吉尔吉斯坦"},
    {"value": "Kiribati", "label": "基里巴斯"},
    {"value": "Cyprus", "label": "塞浦路斯"},
    {"value": "Tajikistan", "label": "塔吉克斯坦"},
    {"value": "Tahiti", "label": "塔西提"},
    {"value": "Tanzania", "label": "坦桑尼亚"},
    {"value": "Thai", "label": "泰国"},
    {"value": "Turks and Caicos Islands", "label": "特克斯和凯科斯群岛"},
    {"value": "Republic of Türkiye(Turkey)", "label": "土耳其"},
    {"value": "Togolese Republic", "label": "多哥"},
    {"value": "Tonga", "label": "汤加"},
    {"value": "Trinidad and Tobago", "label": "特立尼达和多巴哥"},
    {"value": "Turkmenistan", "label": "土库曼斯坦"},
    {"value": "Tuvalu", "label": "图瓦卢"},
    {"value": "Tunisia", "label": "突尼斯"},
    {"value": "Panama", "label": "巴拿马"},
    {"value": "Paraguay", "label": "巴拉圭"},
    {"value": "Pakistan", "label": "巴基斯坦"},
    {"value": "Papua New Guinea", "label": "巴布亚新几内亚"},
    {"value": "Palestine", "label": "巴勒斯坦"},
    {"value": "Faroe Islands", "label": "法罗群岛"},
    {"value": "Peru", "label": "秘鲁"},
    {"value": "Portugal", "label": "葡萄牙"},
    {"value": "Poland", "label": "波兰"},
    {"value": "Puerto Rico", "label": "波多黎各"},
    {"value": "France", "label": "法国"},
    {"value": "French Guiana", "label": "法属圭亚那"},
    {"value": "Fiji", "label": "斐济"},
    {"value": "Finland", "label": "芬兰"},
    {"value": "Philippines", "label": "菲律宾"},
    {"value": "Hungary", "label": "匈牙利"},
    {"value": "Hong Kong", "label": "中国香港"},
    {"value": "Virgin Islands", "label": "美属维尔京群岛"}
  ];

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    const datalist = document.getElementById(DATALIST_ID);
    if (!datalist) {
      console.error('找不到datalist元素:', DATALIST_ID);
      return;
    }

    // 显示加载状态
    const loadingOption = document.createElement('option');
    loadingOption.value = '国家数据加载中...';
    datalist.appendChild(loadingOption);

    try {
      console.log('开始加载国家数据');
      // 1. 优先使用缓存（有有效期）
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('使用缓存数据，长度:', cachedData.length);
        fillDatalist(datalist, cachedData);
        return;
      }

      // 2. 缓存无效，尝试请求远程数据
      let countryData;
      try {
        // 先直接请求，失败用代理
        console.log('尝试直接请求远程数据:', DATA_URL);
        countryData = await fetchData(DATA_URL);
        console.log('直接请求成功，数据长度:', countryData.length);
      } catch (directErr) {
        console.error('直接请求失败或超时，尝试代理:', directErr);
        try {
          console.log('尝试代理请求:', PROXY_URL);
          countryData = await fetchData(PROXY_URL, true);
          console.log('代理请求成功，数据长度:', countryData.length);
        } catch (proxyErr) {
          // 3. 远程请求完全失败（包括超时），尝试读取本地JSON文件
          console.error('代理请求失败或超时，直接尝试本地文件:', proxyErr);
          try {
            console.log('尝试读取本地文件');
            countryData = await fetchLocalJson();
            console.log('本地文件读取成功，数据长度:', countryData.length);
          } catch (localErr) {
            // 本地文件也失败，抛出最终错误
            console.error('本地文件读取失败:', localErr);
            throw new Error('远程数据和本地文件均不可用');
          }
        }
      }

      // 4. 数据获取成功（网络或本地文件），更新缓存
      console.log('数据获取成功，准备更新缓存');
      cacheData(countryData);

      // 填充数据
      console.log('填充datalist数据');
      fillDatalist(datalist, countryData);

    } catch (error) {
      console.error('最终加载失败:', error);
      // 使用内置的完整国家数据
      console.log('使用内置完整国家数据，长度:', FULL_COUNTRY_DATA.length);
      fillDatalist(datalist, FULL_COUNTRY_DATA);
      // 更新缓存，以便下次使用
      cacheData(FULL_COUNTRY_DATA);
      console.log('内置数据加载成功并缓存');
    }
  }

  // 发起网络请求（支持直接请求和代理）
  async function fetchData(url, isProxy = false) {
    // 添加10秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
      const data = await response.json();
      return isProxy ? JSON.parse(data.contents) : data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('网络请求超时');
      }
      throw error;
    }
  }

  // 读取本地Data文件夹中的JSON文件
  async function fetchLocalJson() {
    // 定义多个可能的路径
    const paths = [
      'Data/countryData.json',
      './Data/countryData.json',
      '/Data/countryData.json',
      'countryData.json',
      './countryData.json'
    ];
    
    for (const path of paths) {
      console.log('尝试读取本地文件:', path);
      try {
        const response = await fetch(path, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          console.error('本地文件请求失败:', path, response.status, response.statusText);
          continue; // 尝试下一个路径
        }
        
        const data = await response.json();
        console.log('本地文件读取成功，路径:', path, '数据长度:', data.length);
        return data;
      } catch (error) {
        console.error('本地文件读取异常:', path, error);
        // 继续尝试下一个路径
      }
    }
    
    // 所有路径都失败
    throw new Error('所有本地路径读取都失败');
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