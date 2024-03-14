export default {
template:`
  <div>
    <h2>Search Products</h2>
    <input v-model="searchQuery" type="text" class="form-control" placeholder="Search Products">
    <button class="btn btn-primary" @click="search">Search</button>

    <div v-if="searchResults.length > 0">
      <h3>Search Results</h3>
      <ul>
        <li v-for="category in searchResults" :key="category.id">
          {{ category.name }}
          <ul>
            <li v-for="product in category.products" :key="product.id">
              {{ product.name }} - {{ product.price }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div v-else>
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
    };
  },
  methods: {
    async search() {
      try {
        const res = await fetch(`/api/products/search/${this.searchQuery}`, {
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
        } else {
          console.error('Failed to search products');
          this.error = 'Failed to search products. Please try again.';
        }
      } catch (error) {
        console.error('Error searching products:', error);
        this.error = 'Failed to search products. Please try again.';
      }
    },
  },
};