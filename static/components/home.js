// import StudentHome from './StudentHome.js'
import CustomerHome from './CustomerHome.js'
import ManagerHome from './ManagerHome.js'
// import InstructorHome from './InstructorHome.js'
import AdminHome from './AdminHome.js'
// import StudyResource from './StudyResource.js'

// export default {
//   template: `<div>
//   <StudentHome v-if="userRole=='stud'"/>
//   <AdminHome v-if="userRole=='admin'" />
//   <InstructorHome v-if="userRole=='inst'" />
//   <StudyResource v-for="(resource, index) in resources" :key='index' :resource = "resource" />
//   </div>`,

//   data() {
//     return {
//       userRole: localStorage.getItem('role'),
//       authToken: localStorage.getItem('auth-token'),
//       resources: [],
//     }
//   },

//   components: {
//     StudentHome,
//     InstructorHome,
//     AdminHome,
//     StudyResource,
//   },
//   async mounted() {
//     const res = await fetch('/api/study_material', {
//       headers: {
//         'Authentication-Token': this.authToken,
//       },
//     })
//     const data = await res.json()
//     if (res.ok) {
//       this.resources = data
//     } else {
//       alert(data.message)
//     }
//   },
// }

export default{
        template:`<div>
                  <CustomerHome v-if="isActive && userRole=='customer'"/>
                  <AdminHome v-if="isActive && userRole=='admin'" />
                  <ManagerHome v-if="isActive && userRole=='manager'" />                  
                  </div>`,


  data() {
    return {
      userRole: localStorage.getItem('role'),
      authToken: localStorage.getItem('auth-token'),
      isActive: localStorage.getItem('active')=== 'true',
      resources: [],
    }
  },
    components: {
//     StudentHome,
    CustomerHome,
//     InstructorHome,
    ManagerHome,    
    AdminHome,
//     StudyResource,
  },
  mounted() {
        // Log the value of 'isActive' to the console
        console.log('isActive:', this.isActive);
        if (!this.isActive) {
                localStorage.removeItem('auth-token')
                localStorage.removeItem('role')
                this.$router.push({
                  path: '/login',
                  query: { errorMessage: 'User is Not Active' },
                });
              }
      },
}