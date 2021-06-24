

const Admin = 'Admin-User'
export function getToken() {
  return window.sessionStorage.getItem(Admin)
}

export function setToken(user) {

  return window.sessionStorage.setItem(Admin, user)
}

export function removeToken() {
  return window.sessionStorage.removeItem(Admin)
}
