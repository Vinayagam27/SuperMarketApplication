import home from './components/home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Users from './components/Users.js'
import CategoryManager from './components/CategoryManager.js'
import CategoryAdmin from './components/CategoryAdmin.js'
import ProductManager from './components/ProductManager.js'
import SearchProducts from './components/SearchProducts.js'
import BuyProducts from './components/BuyProducts.js'
import CartDetails from './components/CartDetails.js'
import BuyForm from './components/BuyForm.js'
// import SudyResourceForm from './components/SudyResourceForm.js'

// const routes = [
//   { path: '/', component: Home, name: 'Home' },
//   { path: '/login', component: Login, name: 'Login' },
//   { path: '/users', component: Users },
//   { path: '/create-resource', component: SudyResourceForm },
// ]


const routes = [
  { path: '/', component: home, name: 'home' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/register',component: Register, name:'Register'},
  { path: '/users', component: Users }, 
  { path: '/category-manager', component: CategoryManager}, 
  { path: '/category-admin', component: CategoryAdmin}, 
  { path: '/product-manager', component: ProductManager}, 
  { path:'/search-products', component:SearchProducts},
  { path:'/buy-products', component:BuyProducts},
  { path:'/cart-products', component:CartDetails},
  { path: '/buy-form/:productId', component: BuyForm,props: (route) => ({ productId: route.params.productId }),name: 'buy-form'},
//   { path: '/create-resource', component: SudyResourceForm },
]

export default new VueRouter({
  routes,
})