export default {
template:`
<div v-if="canView" class="d-flex justify-content-center" style="margin-top: 25vh">
<label class="form-label"><Strong><H2>Add Product</H2></Strong></label>
<!-- Product Form -->
<div class="mb-3 p-5 bg-light">
  <div class="text-danger">{{ error }}</div>
  <label for="product-name" class="form-label">Name</label>
  <input type="text" class="form-control" id="product-name" v-model="product.name">

  <label for="product-unit" class="form-label">Unit</label>
  <input type="text" class="form-control" id="product-unit" v-model="product.unit">

  <label for="product-price" class="form-label">Price</label>
  <input type="number" class="form-control" id="product-price" v-model="product.price">

  <label for="product-quantity" class="form-label">Quantity</label>
  <input type="number" class="form-control" id="product-quantity" v-model="product.quantity">

  <label for="product-sold-quantity" class="form-label">Solded Quantity</label>
  <input type="number" class="form-control" id="product-sold-quantity" v-model="product.sold_quantity">

  <label for="product-category" class="form-label">Category Selection</label>
  <!-- Assuming you have a list of categories available in the component -->
  <select class="form-control" id="product-category" v-model="product.categories">
    <option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option>
  </select>

  <label for="product-manufacturing-date" class="form-label">Manufacturing Date</label>
  <input type="date" class="form-control" id="product-manufacturing-date" v-model="product.manufacture_date">

  <label for="product-expiry-date" class="form-label">Expiry Date</label>
  <input type="date" class="form-control" id="product-expiry-date" v-model="product.expiry_date">

  <!-- Add input for product image (you may use a file input) -->
  <label for="product-image" class="form-label">Product Image</label>
  <input type="file" class="form-control" id="product-image" @change="handleImageUpload">

  <!-- Display product image preview -->
  <img v-if="product.image_filename" :src="product.image_filename" alt="Product Image" style="max-width: 100%; max-height: 150px; margin-top: 10px;">
  <br>
  <br>

  <button v-if="isEditing" class="btn btn-primary mt-2" @click="updateProduct">Update Product</button>
  <button v-else class="btn btn-success mt-2" @click="createProduct">Create Product</button>
</div>

<!-- Product List -->
<div class="mb-3 p-5 bg-light">
  <div v-for="productItem in products" :key="productItem.id" class="d-flex justify-content-between align-items-center">
    <div>
      <strong>{{ productItem.name }}</strong>
      <p>{{ productItem.unit }} - Rs.{{ productItem.price }} - Qty: {{ productItem.quantity }}</p>
      <p>Solded Qty: {{ productItem.sold_quantity }}</p>
      <p>Category: {{ getCategoryName(productItem.categories) }}</p>
      <p>Manufacturing Date: {{ productItem.manufacture_date }}</p>
      <p>Expiry Date: {{ productItem.expiry_date }}</p>

      <!-- Display product image -->
      <label for="product-image" class="form-label">Product Image</label>
      
      <img v-if="productItem.image_filename" :src="productItem.image_filename" alt="Product Image" style="max-width: 100%; max-height: 150px; margin-top: 10px;">
      <br>
      <br>
    </div>
    <div>
      <button class="btn btn-warning" @click="editProduct(productItem.id)">Edit</button>
      <button class="btn btn-danger" @click="deleteProduct(productItem.id)">Delete</button>
    </div>
  </div>
</div>
</div>
  `,
  data() {
    return {
      product: {
        name: null,
        unit: null,
        price: null,
        sold_quantity: null,
        quantity: null,
        categories: null,
        manufacture_date: null,
        expiry_date: null,
        image_filename: null,
      },
      products: [],
      error: null,
      token: localStorage.getItem('auth-token'),
      userRole: localStorage.getItem('role'),
      user_id: localStorage.getItem('user_id'),
      isEditing: false,
      editingProductId: null,
      categories: [], // Assuming you have a list of categories
    };
  },
  computed: {    
    canView() {
      return this.userRole === 'manager';
    },
  },
    methods: {
    handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
              // Perform any necessary actions with the file, such as uploading to a server or storing it in the product object.
              // For now, set the image as a data URL for preview purposes.
              const reader = new FileReader();
              reader.onload = () => {
                this.product.image_filename = reader.result;
              };
              reader.readAsDataURL(file);
            }
        },
    async createProduct() {
        try {
            // If product can belong to multiple categories
        this.product.categories = Array.isArray(this.product.categories) ? this.product.categories : [this.product.categories];

          this.product.user_id = this.user_id; // Assuming you have user_id in your data properties
      
          // Make a POST request to the API to create a new product
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
            body: JSON.stringify(this.product),
          });
      
          // Parse the response JSON
          const data = await res.json();
      
          // Check if the request was successful
          if (res.ok) {
            // Reset the product object and fetch the updated list of products
            this.product = {
              name: null,
              unit: null,
              price: null,
              sold_quantity: null,              
              quantity: null,
              categories: null,
              manufacture_date: null,
              expiry_date: null,
              image_filename:null,
              // Add other fields for the product image
            };
            this.fetchProducts();
          } else {
            // Set error message if the request was not successful
            this.error = data.message;
          }
        } catch (error) {
          console.error('Error creating product:', error);
          this.error = 'Failed to create product. Please try again.';
        }
      },
      
      async fetchProducts() {
        try {
          // Make a GET request to the API to fetch the list of products
          const res = await fetch('/api/products', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
      
          // Parse the response JSON
          const data = await res.json();
      
          // Check if the request was successful
          if (res.ok) {
            // Update the products array with the fetched data
            this.products = data;
          } else {
            // Set error message if the request was not successful
            console.error('Failed to fetch products');
            this.error = 'Failed to fetch products. Please try again.';
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          this.error = 'Failed to fetch products. Please try again.';
        }
      },
      
      async deleteProduct(productId) {
        try {
          // Make a DELETE request to the API to delete the specified product
          const res = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
      
          // Check if the request was successful
          if (res.ok) {
            // Fetch the updated list of products after deletion
            this.fetchProducts();
          } else {
            // Set error message if the request was not successful
            console.error('Failed to delete product');
            this.error = 'Failed to delete product. Please try again.';
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          this.error = 'Failed to delete product. Please try again.';
        }
      },
      
      async editProduct(productId) {
        try {
          // Fetch the details of the specified product
          const productDetails = await this.fetchProductDetails(productId);
      
          // Check if the request was successful
          if (productDetails) {
            // Update the product object with the fetched details
            this.product = {
              name: productDetails.name,
              unit: productDetails.unit,
              price: productDetails.price,
              sold_quantity: productDetails.sold_quantity,
              quantity: productDetails.quantity,
            //   categories: productDetails.categories.map(category => String(category.id)),
              categories:productDetails.categories[0].id,
              manufacture_date: this.formatDate(productDetails.manufacture_date),
              expiry_date: this.formatDate(productDetails.expiry_date),
              image_filename: productDetails.image_filename,
              user_id:productDetails.user_id,
              // Add other fields for the product image
            };
            // Inside the editProduct method
            // this.product.manufacture_date = moment(productDetails.manufacture_date).format('YYYY-MM-DD'); 
      
            // Set the editing flag to true
            this.isEditing = true;
            console.log('this.product',this.product);
      
            // Save the ID of the product being edited
            this.editingProductId = productId;
          } else {
            // Set error message if the request to fetch details was not successful
            console.error('Failed to fetch product details for editing');
            this.error = 'Failed to fetch product details for editing. Please try again.';
          }
        } catch (error) {
          console.error('Error editing product:', error);
          this.error = 'Failed to edit product. Please try again.';
        }
      },
      formatDate(dateString) {
        // Format the date string to 'YYYY-MM-DD'
        console.log('manufacture date:',dateString);
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },

      async fetchProductDetails(productId) {
        try {
          // Make a GET request to the API to fetch the details of the specified product
          const res = await fetch(`/api/products/${productId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
      
          // Parse the response JSON
          const data = await res.json();
      
          // Check if the request was successful
          if (res.ok) {
            return data; // Return the product details
          } else {
            console.error('Failed to fetch product details');
            return null;
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          return null;
        }
      },
      
      async updateProduct() {
        this.product.categories=String(this.product.categories);
        console.log('inside update this.product',this.product)
        try {
          // Make a PUT request to the API to update the specified product
          const res = await fetch(`/api/products/${this.editingProductId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
            body: JSON.stringify(this.product),
          });
      
          // Parse the response JSON
          const data = await res.json();
      
          // Check if the request was successful
          if (res.ok) {
            // Reset the product object and editing flags
            this.product = {
              name: null,
              unit: null,
              price: null,
              sold_quantity: null,
              quantity: null,
              categories: null,
              manufacture_date: null,
              expiry_date: null,
              image_filename:null,
              // Add other fields for the product image
            };
            this.isEditing = false;
            this.editingProductId = null;
      
            // Fetch the updated list of products
            this.fetchProducts();
          } else {
            // Set error message if the request was not successful
            this.error = data.message;
          }
        } catch (error) {
          console.error('Error updating product:', error);
          this.error = 'Failed to update product. Please try again.';
        }
      },
      
    getCategoryName(categoryId) {
        console.log('categoryId:', categoryId);
        console.log('categoryId[0] Name:', categoryId[0].name);
        const category = this.categories.find(cat => cat.id === categoryId[0].id);
    
        return category ? category.name : 'Unknown Category';
      },
    // Add other methods as needed
  
  async fetchCategories() {
    try {
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
        this.error = 'Failed to fetch categories. Please try again.';
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      this.error = 'Failed to fetch categories. Please try again.';
    }
  },
},
  mounted() {
    this.fetchProducts(); // Call fetchProducts to load existing products
    this.fetchCategories();
    // Add other necessary initialization logic
  },
};