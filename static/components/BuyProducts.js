export default {
    template: `
      <div v-if="canViewProducts">
        <h2>Search Products</h2>
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Search Products">
        <button class="btn btn-primary" @click="searchProducts">Search</button>
        <button class="btn btn-secondary" @click="clearSearch">Clear</button>
  
        <div v-if="searchResults.length > 0">
          <ul>
            <li v-for="category in searchResults" :key="category.id">
              <h3>{{ category.name }}</h3>
              <ul>
                <li v-for="product in category.products" :key="product.id">
                  <div>
                    <strong>Name:</strong> {{ product.name }}<br>
                    <strong>Quantity:</strong> 
                    <span v-if="product.quantity > 0">{{ product.quantity }}</span>
                    <span v-else>Out of Stock</span><br>
                    <strong>Price:</strong> {{ product.price }}<br>
                    <strong>Manufacture Date:</strong> {{ product.manufacture_date }}<br>
                    <strong>Expiry Date:</strong> {{ product.expiry_date }}<br>
                    <img :src="product.image_filename" alt="Product Image" style="max-width: 100%; max-height: 150px; margin-top: 10px;">
                    <button class="btn btn-success" @click="buyProduct(product.id)" :disabled="product.quantity <= 0">Buy</button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div v-else-if="showNoResults">
          <p>No results found.</p>
        </div>
      </div>
    `,
    data() {
      return {
        searchQuery: '',
        searchResults: [],
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        showNoResults: false,
      };
    },
    computed: {    
      canViewProducts() {
        return this.userRole === 'customer';
      },
    },
    methods: {
      async searchProducts() {
        if (this.searchQuery) {
          await this.fetchData(`/api/productcategories/${this.searchQuery}`);
        }
      },
      async fetchAllProducts() {
        await this.fetchData('/api/productcategories');
      },
      async fetchData(apiEndpoint) {
        try {
          const res = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
  
          const data = await res.json();
  
          if (res.ok) {
            this.searchResults = data;
            this.showNoResults = data.length === 0; // Show "No results" if searchResults is empty
          } else {
            console.error('Failed to fetch product categories');
            this.error = 'Failed to fetch product categories. Please try again.';
          }
        } catch (error) {
          console.error('Error fetching product categories:', error);
          this.error = 'Failed to fetch product categories. Please try again.';
        }
      },
      buyProduct(productId) {
        // Add logic to handle the buy button click for the specified product ID
        console.log(`Buying product with ID: ${productId}`);
        this.$router.push(`/buy-form/${productId}`);
      },
      clearSearch() {
        this.searchQuery = '';
        this.fetchAllProducts();
      },
    },
    mounted() {
      // Load all products during the mounted process
      this.fetchAllProducts();
    },
  };
  