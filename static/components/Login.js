export default {
    template: `   
    <div class='d-flex justify-content-center' style="margin-top: 25vh">
      <div class="mb-3 p-5 bg-light">
          <div class='text-danger'>{{error}}</div>
            <div>{{successMessage}}</div>
            <div class='text-danger'>{{errorMessage}}</div>
          <div/>
          <label for="user-email" class="form-label">Email address</label>
          <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
          <label for="user-password" class="form-label">Password</label>
          <input type="password" class="form-control" id="user-password" v-model="cred.password">
          <div class="d-flex justify-content-between">
            <button class="btn btn-primary mt-2" @click="login">Login</button>
            <router-link to="/register" tag="button" class="btn btn-success mt-2">Register</router-link>            
          </div>
      </div>
    </div> 
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
        },
        error: null,
        successMessage: null,
        errorMessage:null,
      }
    },
    methods: {
      async login() {
        const res = await fetch('/user-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cred),
        })
        const data = await res.json()
        if (res.ok) {
            localStorage.setItem('auth-token', data.token)
            localStorage.setItem('role', data.role)
            localStorage.setItem('active',data.active)
            localStorage.setItem('user_id',data.user_id)
            this.ServiceWorker();
            this.$router.push({ path: '/' })
        } 
        else {
          this.error = data.message
        }
      },
      async ServiceWorker(){
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('./service-worker1.js')
            .then(function(registration) {
              console.log('Service Worker1 registered with scope:', registration.scope);
            })
            .catch(function(error) {
              console.error('Service Worker1 registration failed:', error);
            });
        }
      },
    },
    beforeRouteEnter(to, from, next) {
      // Retrieve the success message from the query parameters
      const successMessage = to.query.successMessage;
      const errorMessage=to.query.errorMessage;
      next((vm) => {
        // Assign the success message to the component's data
        vm.successMessage = successMessage;
        vm.errorMessage = errorMessage;
      });
    },
    beforeRouteUpdate(to, from, next) {
      // Retrieve the success message from the query parameters
      const successMessage = to.query.successMessage;
      const errorMessage=to.query.errorMessage;
      // Assign the success message to the component's data
      this.successMessage = successMessage;
      this.errorMessage = errorMessage;
      next();
    },
}
