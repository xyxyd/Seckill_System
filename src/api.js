// 后端接口封装：统一处理地址、token 和错误
const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080').replace(/\/+$/, '')

const TOKEN_KEY = 'seckill_token'
const NAME_KEY = 'seckill_username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function setLogin(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(NAME_KEY, username)
}
export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(NAME_KEY)
}
export function getUsername() {
  return localStorage.getItem(NAME_KEY) || ''
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers['X-Token'] = token

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new Error('无法连接后端服务，请确认后端已启动且地址正确：' + BASE)
  }
  if (!res.ok) throw new Error('服务异常（HTTP ' + res.status + '）')

  const data = await res.json()
  if (data.code !== 0) {
    if (data.code === 401) clearLogin()
    throw new Error(data.msg || '操作失败')
  }
  return data.data
}

export const api = {
  register: (username, password) =>
    request('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: { username, password } }),
  products: () => request('/api/products'),
  seckill: (productId) => request('/api/seckill/' + productId, { method: 'POST' }),
  orders: () => request('/api/orders')
}

export { BASE }
