document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('image-input');
  const imageFilenameInput = document.getElementById('image-filename');
  const downloadBtn = document.getElementById('download-btn');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // 初始禁用下载按钮（避免未加载图片时点击）
  if (downloadBtn) {
    downloadBtn.disabled = true;
  }

  // 清理文件名（解决特殊字符导致的下载失败）
  const sanitizeFilename = (name) => {
    if (!name) return '画布图像.png'; // 默认文件名改为中文
    // 移除操作系统不允许的特殊字符
    const invalidChars = /[\/\\:*?"<>|]/g;
    let cleanName = name.replace(invalidChars, '_');
    // 确保文件名包含图片扩展名
    if (!/\.(png|jpg|jpeg|gif)$/i.test(cleanName)) {
      cleanName += '.png';
    }
    return cleanName;
  };

  if (imageInput) {
    imageInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        imageFilenameInput.value = file.name;
        downloadBtn.disabled = true; // 重置按钮状态

        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          // 关键：删除 crossOrigin 设置（本地图片无需跨域配置）
          img.onload = function() {
            try {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              downloadBtn.disabled = false; // 加载成功后启用下载
            } catch (err) {
              console.error('图片绘制失败:', err);
              alert('图片处理失败，请重试（可能是图片格式错误或尺寸过大）');
            }
          };
          // 图片加载失败的处理
          img.onerror = function() {
            console.error('图片格式错误或无法加载');
            alert('请选择有效的图片文件（支持PNG、JPG、GIF格式）');
          };
          img.src = e.target.result;
        };
        // 文件读取失败的处理
        reader.onerror = function() {
          console.error('文件读取失败');
          alert('无法读取文件，请检查文件是否损坏或重新选择');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      try {
        // 前置检查：画布是否有内容
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('画布为空');
        }

        // 生成图片URL（处理跨域等安全问题）
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/png');
        } catch (toDataErr) {
          if (toDataErr.name === 'SecurityError') {
            throw new Error('跨域图片：浏览器安全策略禁止下载（请使用本地图片或同域图片）ps:作者Evan罗留言 在想办法修改 但好像真的没办法实现直接下载了');
          } else {
            throw new Error(`生成图片失败：${toDataErr.message}`);
          }
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = sanitizeFilename(imageFilenameInput.value);
        document.body.appendChild(link);
        link.click();

        // 清理临时元素
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(dataUrl);
        }, 100);

      } catch (err) {
        console.error('下载失败:', err);
        // 根据错误类型显示具体原因
        let errorMsg = '下载失败：';
        if (err.message.includes('跨域图片')) {
          errorMsg += err.message;
        } else if (err.message.includes('画布为空')) {
          errorMsg += '请先上传并加载图片';
        } else if (err.message.includes('生成图片失败')) {
          errorMsg += '图片处理异常（可能是图片损坏或格式不支持）';
        } else if (err.message.includes('not supported')) {
          errorMsg += '您的浏览器不支持此功能，请使用Chrome、Firefox等现代浏览器';
        } else {
          errorMsg += err.message || '未知错误，请重试';
        }
        alert(errorMsg);
      }
    });
  }
});
