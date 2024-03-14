export default {
    template: `
      <div v-if="canView" class="d-flex justify-content-center" style="margin-top: 25vh">
        
        <div class="mb-3 p-5 bg-light">
          <div class="text-danger">
            {{ error }}
          </div>
          <label for="category-name" class="form-label">Name</label>
          <input type="text" class="form-control" id="category-name" v-model="category.name">
  
          <label for="category-description" class="form-label">Description</label>
          <textarea class="form-control" id="category-description" v-model="category.description"></textarea>
  
          
          <button v-if="isEditing" class="btn btn-primary mt-2" @click="updateCategory">Update Category</button>
          
          <button v-else class="btn btn-success mt-2" @click="createCategory">Create Category</button>
        </div>
  
        <!-- Category List -->
        <div class="mb-3 p-5 bg-light">
          <div v-for="categoryItem in categories" :key="categoryItem.id" class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ categoryItem.name }}</strong>
              <p>{{ categoryItem.description }}</p>
         
            </div>
            
            <div v-if="String(categoryItem.user_id) === String(user_id)">
            <button class="btn btn-warning" @click="editCategory(categoryItem.id)"
            :disabled="categoryItem.is_approved === false || categoryItem.isdel_approved === false || categoryItem.isedit_approved === false">Edit</button>
    
            <button class="btn btn-danger" @click="deleteCategory(categoryItem.id)"
            :disabled="categoryItem.is_approved === false || categoryItem.isdel_approved === false || categoryItem.isedit_approved === false">Delete</button>
    
              
             <span v-if="categoryItem.is_approved === false" class="text-danger">Create Request Sent for Approval</span>
             <span v-else-if="categoryItem.isdel_approved === false" class="text-danger">Delete Request Sent for Approval</span>
             <span v-else-if="categoryItem.isedit_approved === false" class="text-danger">Edit Request Sent for Approval</span>             
             <span v-else class="text-success">Approved</span>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        category: {
          name: null,
          description: null,
          user_id: null,
        },
        categories: [], // Store categories fetched from the server
        error: null,
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        user_id: localStorage.getItem('user_id'),
        isEditing: false,
        editingCategoryId: null,
      };
    },
    computed: {    
      canView() {
        return this.userRole === 'manager';
      },
    },
    methods: {
      async createCategory() {
        this.category.user_id = this.user_id;
        this.category.is_approved=false
        this.category.isdel_approved=null
        this.category.isedit_approved=null        
  
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
          body: JSON.stringify(this.category),
        });
        const data = await res.json();
        if (res.ok) {
          // Clear the form and fetch updated category list
          this.category = { name: null, description: null };
          this.fetchCategories();
        } else {
          this.error = data.message;
        }
      },
      async fetchCategories() {
        console.log("inside fetch categories");
        const res = await fetch('/api/categories/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
        });
        const data = await res.json();
        if (res.ok) {
          this.categories = data;
        } else {
          console.error('Failed to fetch categories');
        }
      },

    async deleteCategory(categoryId) {
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
        });
        const data = await res.json();
        console.log("data",data)
        if (res.ok) {
          // Prepopulate the form with category details
          
          this.delCategory(data)
        } else {
          console.error('Failed to fetch category details');
        }
      },
      async delCategory(dataset) {
        dataset.isdel_approved=false;
        dataset.is_approved=null
        dataset.isedit_approved=null
        const res = await fetch(`/api/categories/${dataset.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
          body: JSON.stringify(dataset),
        });
        const data = await res.json();
        if (res.ok) {
          this.fetchCategories();
        } else {
          this.error = data.message;
        }
      },
      editCategory(categoryId) {
        // Set editing state and fetch category details
        this.isEditing = true;
        this.editingCategoryId = categoryId;
        this.fetchCategoryDetails(categoryId);
      },
      async fetchCategoryDetails(categoryId) {
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
        });
        const data = await res.json();
        data.isedit_approved=false;
        if (res.ok) {
          // Prepopulate the form with category details
          this.category = {
            name: data.name,
            description: data.description,
            user_id: data.user_id,
            is_approved: data.is_approved,
            isdel_approved:data.isdel_approved,
            isedit_approved:data.isedit_approved,
          };
        } else {
          console.error('Failed to fetch category details');
        }
      },
      async updateCategory() {
        
        const res = await fetch(`/api/categories/${this.editingCategoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
            'userRole': this.userRole,
          },
          body: JSON.stringify(this.category),
        });
        const data = await res.json();
        if (res.ok) {
          // Clear the form and fetch updated category list
          this.category = { name: null, description: null };
          this.isEditing = false;
          this.editingCategoryId = null;
          this.fetchCategories();
        } else {
          this.error = data.message;
        }
      },
    },
    mounted() {
      this.fetchCategories();
    },
  };  