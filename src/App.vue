<template>
  <div class="page">
    <header class="navbar">
      <div class="brand" @click="go('home')"><span class="logo">⚡</span> 秒杀商城</div>
      <nav class="nav">
        <a :class="{ active: view === 'home' }" @click="go('home')">首页</a>
        <a v-if="user" :class="{ active: view === 'orders' }" @click="go('orders')">我的订单</a>
        <template v-if="user">
          <span class="user">👤 {{ user }}</span>
          <a @click="logout">退出</a>
        </template>
        <template v-else>
          <a :class="{ active: view === 'login' }" @click="go('login')">登录</a>
          <a class="reg" @click="go('register')">注册</a>
        </template>
      </nav>
    </header>

    <main class="container">
      <!-- 首页 -->
      <section v-if="view === 'home'">
        <div class="hero">
          <h1>欢迎来到在线秒杀系统</h1>
          <p>限时抢购 · 每日上新 · 手快有手慢无</p>
        </div>

        <div v-if="loading" class="tip">正在加载商品…</div>
        <div v-else-if="error" class="tip error">{{ error }}</div>
        <div v-else class="grid">
          <div v-for="p in products" :key="p.id" class="card">
            <div class="card-top">
              <h3>{{ p.name }}</h3>
              <span class="stock" :class="{ out: p.stock <= 0 }">
                {{ p.stock > 0 ? '库存 ' + p.stock : '已售罄' }}
              </span>
            </div>
            <p class="desc">{{ p.description }}</p>
            <div class="bottom">
              <span class="price">¥{{ p.price }}</span>
              <button
                class="buy"
                :disabled="p.stock <= 0 || busyId === p.id"
                @click="doSeckill(p)"
              >
                {{ p.stock <= 0 ? '已售罄' : busyId === p.id ? '抢购中…' : '立即抢购' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 登录 / 注册 -->
      <section v-else-if="view === 'login' || view === 'register'" class="auth-wrap">
        <div class="auth-card">
          <h2>{{ view === 'login' ? '账号登录' : '注册新账号' }}</h2>
          <p class="sub">{{ view === 'login' ? '登录后即可参与秒杀' : '注册一个账号，开始抢购' }}</p>
          <label>用户名</label>
          <input v-model.trim="form.username" placeholder="请输入用户名" @keyup.enter="submit" />
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="submit" />
          <button class="primary" :disabled="busy" @click="submit">
            {{ busy ? '请稍候…' : view === 'login' ? '登 录' : '注 册' }}
          </button>
          <p class="switch">
            <template v-if="view === 'login'">
              还没有账号？<a @click="go('register')">立即注册</a>
            </template>
            <template v-else>
              已有账号？<a @click="go('login')">去登录</a>
            </template>
          </p>
        </div>
      </section>

      <!-- 我的订单 -->
      <section v-else-if="view === 'orders'">
        <h2 class="page-title">我的订单</h2>
        <div v-if="loading" class="tip">加载中…</div>
        <div v-else-if="!orders.length" class="tip">还没有订单，去首页抢一个吧～</div>
        <div v-else class="orders">
          <div v-for="o in orders" :key="o.id" class="order">
            <div>
              <div class="order-name">{{ o.productName }}</div>
              <div class="order-time">{{ o.createdAt }}</div>
            </div>
            <div class="order-right">
              <span class="order-price">¥{{ o.price }}</span>
              <span class="badge">{{ o.status }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, getUsername, setLogin, clearLogin } from './api'

const view = ref('home')
const products = ref([])
const orders = ref([])
const loading = ref(false)
const error = ref('')
const user = ref(getUsername())
const form = ref({ username: '', password: '' })
const busy = ref(false)
const busyId = ref(null)
const toast = ref('')
let timer = null

function tip(msg) {
  toast.value = msg
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 2600)
}

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    products.value = await api.products()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  loading.value = true
  try {
    orders.value = await api.orders()
  } catch (e) {
    tip(e.message)
    orders.value = []
  } finally {
    loading.value = false
  }
}

function go(v) {
  if (v === 'orders' && !user.value) {
    tip('请先登录')
    v = 'login'
  }
  view.value = v
  form.value = { username: '', password: '' }
  if (v === 'home') loadProducts()
  if (v === 'orders') loadOrders()
}

async function submit() {
  const { username, password } = form.value
  if (!username || !password) return tip('用户名和密码不能为空')
  busy.value = true
  try {
    if (view.value === 'register') {
      await api.register(username, password)
      tip('注册成功，请登录')
      view.value = 'login'
      form.value.password = ''
    } else {
      const data = await api.login(username, password)
      setLogin(data.token, data.username)
      user.value = data.username
      tip('登录成功')
      form.value = { username: '', password: '' }
      view.value = 'home'
      await loadProducts()
    }
  } catch (e) {
    tip(e.message)
  } finally {
    busy.value = false
  }
}

async function doSeckill(p) {
  if (!user.value) {
    tip('请先登录后再抢购')
    view.value = 'login'
    return
  }
  busyId.value = p.id
  try {
    await api.seckill(p.id)
    tip('抢购成功！可在「我的订单」查看')
  } catch (e) {
    tip(e.message)
  } finally {
    busyId.value = null
    await loadProducts()
  }
}

function logout() {
  clearLogin()
  user.value = ''
  orders.value = []
  tip('已退出登录')
  go('home')
}

onMounted(loadProducts)
</script>
