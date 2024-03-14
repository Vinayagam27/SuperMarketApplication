export default {
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
        <div class='text-danger'>{{error}}</div>
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
  
        <label for="user-password" class="form-label">Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password">
  
        <label for="user-roles" class="form-label">Roles</label>
        <select class="form-select" id="user-roles" v-model="cred.roles">
          <option v-for="role in filteredRoles" :key="role.name" :value="role.name">{{ role.name }}</option>
        </select>
  
        <button class="btn btn-success mt-2" @click='register'> Register </button>
      </div>
      </div>
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
          roles: null, // Set a default role if needed
        },
        roles: [], // Store roles fetched from the server
        error: null,
      };
    },
    computed: {
        filteredRoles() {
          // Filter out the 'admin' role
          return this.roles.filter(role => role.name !== 'admin');
        },
    },
    methods: {
      async fetchRoles() {
        const res = await fetch('/get-roles');
        const data = await res.json();
        if (res.ok) {
          this.roles = data.roles; // Assuming the response has a property 'roles' containing an array of role names
        } else {
          console.error('Failed to fetch roles');
        }
      },
      async register() {
        const res = await fetch('/user-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cred),
        });
        const data = await res.json();
        if (res.ok) {
          this.$router.push({ path: '/Login', query: { successMessage: 'User Register Successfully' } });
        } else {
          this.error = data.message;
        }
      },
    },
    mounted() {
      this.fetchRoles(); // Fetch roles when the component is mounted
    },
  };
  