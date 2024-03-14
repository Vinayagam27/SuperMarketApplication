export default {
    template: `<div v-if="canView">
    <div v-if="error"> {{error}}</div>
    <div v-for="user in allUsers">
    {{user.email}} 
    <button class="btn btn-primary" v-if='!user.active' @click="approve(user.id)"> Approve </button></div>
    </div>`,
    data() {
      return {
        allUsers: [],
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        error: null,
      }
    },
    computed: {    
      canView() {
        return this.userRole === 'admin';
      },
    },
    methods: {
      async approve(mgrId) {
        const res = await fetch(`/activate/manager/${mgrId}`, {
          headers: {
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
        }
      },
    },
    async mounted() {
      const res = await fetch('/users', {
        headers: {
          'Authentication-Token': this.token,
          'userRole': this.userRole,
        },
      })
      const data = await res.json().catch((e) => {})
      if (res.ok) {
        this.allUsers = data
      } else {
        this.error = res.status+' '+res.statusText
      }
    },
  }