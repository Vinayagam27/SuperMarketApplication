export default {
    template: `
      <div>
        <h2>Buy Product</h2>
        <div v-if="product">
          <strong>Product Name:</strong> {{ product.name }}<br>
          <strong>Price:</strong> {{ product.price }}<br>
          <strong>Buying Quantity:</strong>
          <input v-model="buyingQuantity" type="number" min="1" required>
        </div>
        <div v-if="product">
          <strong>Total Price:</strong> {{ calculateTotalPrice }}<br>
        </div>
        <button class="btn btn-success" @click="addToCart">Add to Cart</button>
      </div>
    `,
    data() {
      return {
        product: {
            name: null,
            unit: null,
            price: null,
            quantity: null,
            categories: null,
            manufacture_date: null,
            expiry_date: null,
            image_filename: null,
          },
        buyingQuantity: 1,
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        user_id: localStorage.getItem('user_id'),
        categories: [],
      };
    },
    computed: {
      calculateTotalPrice() {
        return this.product ? this.product.price * this.buyingQuantity : 0;
      },
    },
    methods: {
        async addToCart() {
            if (!this.product) {
              console.error('Product data is not available.');
              return;
            }
      
            const updatedQuantity = this.product.quantity - this.buyingQuantity;
      
            // Prepare the data to be sent in the addToCart request
            const cartItemData = {
              quantity: this.buyingQuantity,
              total_price: this.calculateTotalPrice,
              product_id: this.product.id,
              user_id: this.user_id,
              order_id: null, // Assuming order_id is always null for new cart items
            };
      
            try {
              // Make a POST request to the API to add the product to the cart
              const res = await fetch('/api/cart_items', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': this.token,
                  'userRole': this.userRole,
                },
                body: JSON.stringify(cartItemData),
              });
      
              // Parse the response JSON
              const data = await res.json();
      
              // Check if the request was successful
              if (res.ok) {
                // Update the product quantity details
                await this.updateProductQuantity(updatedQuantity);
      
                // Redirect back to the BuyProducts component
                this.$router.push('/buy-products');
              } else {
                // Set error message if the request was not successful
                this.error = data.message;
              }
            } catch (error) {
              console.error('Error adding to cart:', error);
              this.error = 'Failed to add to cart. Please try again.';
            }
          },
      
          async updateProductQuantity(updatedQuantity) {
            try {
              // Make a PUT request to the API to update the product with the new quantity
              await fetch(`/api/products/${this.product.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': this.token,
                  'userRole': this.userRole,
                },
                body: JSON.stringify({ quantity: updatedQuantity }),
              });
            } catch (error) {
              console.error('Error updating product quantity:', error);
              this.error = 'Failed to update product quantity. Please try again.';
            }
          },
      async fetchProductById(productId) {
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
            console.log('data ------->>>>>',data)
            // Update the product data in the component's state
            this.product = data;

          } else {
            // Set error message if the request was not successful
            this.error = data.message;
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          this.error = 'Failed to fetch product details. Please try again.';
        }
      },
  },
  mounted() {
    // Access the productId from the route params
    const productId = this.$route.params.productId;
    console.log('productIdss',productId)

    // Fetch the product details based on productId (you may need to make an API request)
    // For example, assume you have a method fetchProductById in your API
    this.fetchProductById(productId);
  },
};
