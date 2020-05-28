import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import Axios from "axios"
import VueCookies from 'vue-cookies'
import VueSession from 'vue-session'
import VueCryptojs from 'vue-cryptojs'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css';

//For Cookie Handling
Vue.use(VueCookies)
Vue.$cookies.config('7d')

//For sessions
Vue.use(VueSession)

//For encryption
Vue.use(VueCryptojs)

//For toast notification
Vue.use(VueToast)

Vue.prototype.$http = Axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
