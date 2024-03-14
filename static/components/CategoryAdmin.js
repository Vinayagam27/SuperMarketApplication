export default {
    template: `
    <div v-if="canView" class="d-flex justify-content-center" style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
      <div class="text-danger">{{ error }}</div>
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
          <br>
          <br>
        </div>
        <div>
          <button class="btn btn-warning" @click="editCategory(categoryItem.id)">Edit</button>
          <button class="btn btn-danger" @click="deleteCategory(categoryItem.id)">Delete</button>

          <!-- Display "Approve" button based on conditions -->
          <button v-if="shouldDisplayApproveButton(categoryItem)" class="btn btn-success" @click="approveCategory(categoryItem.id)">Approve Create Request</button>
          <button v-if="DisplayEditApproveButton(categoryItem)" class="btn btn-success" @click="editCategories(categoryItem.id)">Approve Edit Request</button>
          <button v-if="DisplayDelApproveButton(categoryItem)" class="btn btn-success" @click="deleteCategory(categoryItem.id)">Approve Delete Request</button>

          
          <span v-if="categoryItem.is_approved === false || categoryItem.isdel_approved === false || categoryItem.isedit_approved === false" class="text-danger">Not Approved</span>
          <span v-else-if="categoryItem.is_approved === true" class="text-success">Approved</span>
          <span v-else class="text-danger">Not Approved</span>
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
            is_approved: null,
          },
          categories: [],
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
          return this.userRole === 'admin';
        },
      },
      methods: {
        async createCategory() {
          this.category.user_id = this.user_id;
          this.category.is_approved = true;
    
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
            this.category = { name: null, description: null };
            this.fetchCategories();
          } else {
            this.error = data.message;
          }
        },
        async fetchCategories() {
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
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
            },
          });
          if (res.ok) {
            this.fetchCategories();
          } else {
            console.error('Failed to delete category');
          }
        },
        editCategory(categoryId) {
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
          if (res.ok) {
            this.category = {
              name: data.name,
              description: data.description,
              user_id: data.user_id,
              is_approved: data.is_approved,
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
            this.category = { name: null, description: null };
            this.isEditing = false;
            this.editingCategoryId = null;
            this.fetchCategories();
          } else {
            this.error = data.message;
          }
        },
        shouldDisplayApproveButton(categoryItem) {
          return this.userRole === 'admin' && categoryItem.is_approved === false;
        },
        DisplayEditApproveButton(categoryItem) {
          return this.userRole === 'admin' && categoryItem.isedit_approved === false;
        },
        DisplayDelApproveButton(categoryItem) {
          return this.userRole === 'admin' && categoryItem.isdel_approved === false;
        },
        async fetchCategoryDtls(categoryId) {
          const res = await fetch(`/api/categories/${categoryId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
        
          if (res.ok) {
            const data = await res.json();
            return data; // assuming the response contains the category details
          } else {
            console.error('Failed to fetch category details');
            return null;
          }
        },        
        async approveCategory(categoryId) {
          const existingCategory = await this.fetchCategoryDtls(categoryId);
          this.category.is_approved = true;
          this.category.name=existingCategory.name
          this.category.description=existingCategory.description
          this.category.user_id=existingCategory.user_id
          this.category.id= existingCategory.id
          this.category.isedit_approved = existingCategory.isedit_approved;
          this.category.isdel_approved = existingCategory.isdel_approved;
          console.log("existingCategory 2",this.category.id)
          const res = await fetch(`/api/categories/${this.category.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
            body: JSON.stringify(this.category),
          });
    
          if (res.ok) {
            console.log('fine')
            this.fetchCategories();
          } else {
            console.error('Failed to approve category');
          }
        },
        async editCategories(categoryId) {
          const existingCategory = await this.fetchCategoryDtls(categoryId);
          this.category.isedit_approved = true;
          this.category.name=existingCategory.name
          this.category.description=existingCategory.description
          this.category.user_id=existingCategory.user_id
          this.category.id= existingCategory.id
          this.category.is_approved = existingCategory.is_approved;
          this.category.isdel_approved = existingCategory.isdel_approved;
          const res = await fetch(`/api/categories/${this.category.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
            body: JSON.stringify(this.category),
          });
    
          if (res.ok) {
            console.log('fine')
            this.fetchCategories();
          } else {
            console.error('Failed to approve category');
          }
        },
      },
      mounted() {
        this.fetchCategories();
      },
    };