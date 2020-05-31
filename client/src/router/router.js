import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home/Main.vue'
import GetHired from '../components/GetHired/GHMain.vue'
import Signup from '../components/Signup/SMain.vue'
import Login from '../components/Login/LMain.vue'
import About from '../components/About/Aboutmain.vue'
import Services from '../components/ServicesPage/SMain.vue'
import Cleaning from '@/components/Services/Cleaning/Cmain.vue'
import Cmodal from '@/components/Services/Cleaning/Cmodal.vue'
import cart from '@/components/Services/Cleaning/cart.vue'
import checkout from '@/components/Services/Cleaning/checkout.vue'
import PayLaterConfirm from '@/components/Services/Cleaning/PayLaterConfirm.vue'
import Dashboard from '@/components/Dashboard/DMain.vue'
import workreq from '@/components/Dashboard/workreq.vue'
import pworks from '@/components/Dashboard/pworks.vue'
import myworks from '@/components/Dashboard/myworks.vue'
import ForgotPassword from '@/components/ForgotPassword/FPMain.vue'
import UpdateProfile from '@/components/UpdateProfile/UPMain.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/', 
      component: Home 
    },
    { 
      path: '/gethired', 
      component: GetHired 
    },
    { 
      path: '/signup', 
      component: Signup,
      children: [
        {
          path: 'user',
          name: 'user',
          component: Cmodal,
          props: true,      
        },
        {
          path: 'worker',
          name: 'worker',
          component: Cmodal,
          props: true,      
        },
        {
          path: 'company',
          name: 'company',
          component: Cmodal,
          props: true,      
        }                
      ]      
    },
    { 
      path: '/login', 
      component: Login,
      children: [
        {
          path: 'user',
          name: 'user',
          component: Cmodal,
          props: true,      
        },
        {
          path: 'worker',
          name: 'worker',
          component: Cmodal,
          props: true,      
        },
        {
          path: 'company',
          name: 'company',
          component: Cmodal,
          props: true,      
        }                
      ]      
    },  
    { 
      path: '/about', 
      component: About 
    },
    { 
      path: '/services', 
      component: Services 
    },
    { 
      path: '/services/cleaning', 
      component: Cleaning,
      children: [
        {
          path: 'modal',
          name: 'modal',
          component: Cmodal,
          props: true,
          children: [
            {
              path: 'cart',
              name: 'cart',
              component: cart,
              props: true,
              children: [
                {
                  path: 'checkout',
                  name: 'checkout',
                  component: checkout,
                  props: true,      
                  children: [
                    {
                      path: 'confirm',
                      name: 'confirm',
                      component: PayLaterConfirm,
                      props: true,
                    }
                  ]        
                }
              ]
            }
          ]
        },       
      ] 
    },
    { 
      path: '/dashboard', 
      component: Dashboard,
      children: [
        {
          path: 'workrequests',
          name: 'workrequests',
          component: workreq,
          props: true
        },
        {
          path: 'pendingworks',
          name: 'pendingworks',
          component: pworks,
          props: true
        },
        {
          path: 'myworks',
          name: 'myworks',
          component: myworks,
          props: true
        }              
      ]
    },
    {
      path: '/forgotPassword',
      component: ForgotPassword
    },
    {
      path: '/updateProfile',
      component: UpdateProfile
    }           
  ]
})