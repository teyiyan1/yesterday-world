# 图片管理说明

## 文件夹结构

```
images/
├── people/     ← 人物照片
├── places/     ← 地点照片
└── misc/       ← 其他图片
```

## 人物照片命名

| 人物 | 文件名 | 尺寸建议 |
|------|--------|----------|
| 霍夫曼斯塔尔 | `hofmannsthal.jpg` | 400×530 (3:4) |
| 里尔克 | `rilke.jpg` | 400×530 |
| 罗丹 | `rodin.jpg` | 400×530 |
| 罗曼·罗兰 | `rolland.jpg` | 400×530 |
| 弗洛伊德 | `freud.jpg` | 400×530 |
| 赫茨尔 | `herzl.jpg` | 400×530 |
| 施特劳斯 | `strauss.jpg` | 400×530 |
| 维尔哈伦 | `verhaeren.jpg` | 400×530 |
| 高尔基 | `gorky.jpg` | 400×530 |
| 茨威格父亲 | `father.jpg` | 400×530 |

## 图片规格

- **格式**: JPG 或 WebP
- **尺寸**: 宽 400px，高 530px（3:4 比例）
- **风格**: 黑白或低饱和度更佳
- **大小**: 单张建议 < 200KB

## 在 HTML 中引用

```html
<!-- 人物卡片中使用 -->
<div class="person-card-image">
  <img src="images/people/hofmannsthal.jpg" alt="霍夫曼斯塔尔">
</div>

<!-- 头像中使用 -->
<div class="avatar avatar-xl">
  <img src="images/people/rilke.jpg" alt="里尔克">
</div>
```

## 图片来源推荐

这些历史人物（去世超过70年）的照片多为公版：

- Wikipedia Commons
- Internet Archive
- 各大博物馆数字档案
- Stefan Zweig Digital (https://www.stefanzweig.digital)
