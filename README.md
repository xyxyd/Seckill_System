# Seckill_System（前端）

在线秒杀系统前端，Vue 3 + Vite，纯手写样式（未引入 UI 组件库）。

## 页面功能

- 首页：商品列表、库存展示、立即抢购
- 登录 / 注册：用户名 + 密码
- 我的订单：查看抢购记录

## 本地开发

```bash
npm install
npm run dev        # 默认 http://localhost:5173
```

开发时若要连本地后端，新建 `.env.development`：

```
VITE_API_BASE=http://localhost:8080
```

## 构建与部署

```bash
# 1. 修改 .env.production 里的后端地址（换成 ECS 公网 IP）
#    VITE_API_BASE=http://1.92.76.153:8080

npm install
npm run build      # 产物在 dist/
```

把 `dist/` 里的文件上传到服务器 Nginx 根目录：

```bash
scp -r dist/* root@<ECS公网IP>:/var/www/html/
```

## 目录结构

```
├── index.html
├── package.json
├── vite.config.js
├── .env.production      # 生产环境后端地址
└── src
    ├── main.js
    ├── App.vue          # 页面（首页 / 登录注册 / 订单）
    ├── api.js           # 接口封装
    └── style.css
```
