export default {
    template: `
      <div v-if="canViewProducts">
        <h2>Your Cart</h2>
        <div v-if="cartItems.length > 0">
          <ul>
            <li v-for="cartItem in cartItems" :key="cartItem.id">
              <div>
                <strong>Product Name:</strong> {{ cartItem.product.name }}<br>
                <strong>Quantity:</strong> {{ cartItem.quantity }}<br>
                <strong>Total Price:</strong> {{ cartItem.total_price }}<br>
                <button class="btn btn-danger" @click="removeFromCart(cartItem.id)">Remove</button>
              </div>
            </li>
          </ul>
          <div>
            <strong>Order Total:</strong> {{ calculateOrderTotal() }}
          </div>
          <button class="btn btn-success" @click="placeOrder">Place Order</button>
        </div>
        <div v-else>
          <p>Your cart is empty.</p>
        </div>
      </div>
    `,
    data() {
      return {
        Order: {
          order_date: null,
          total_amount: null,
          user_id: null,
        },
        cartItems: [],
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        userId: localStorage.getItem('user_id'),
      };
    },
    computed: {    
      canViewProducts() {
        return this.userRole === 'customer';
      },
    },
    methods: {
      async fetchCartItems() {
        try {
          const res = await fetch(`/api/cart_items/user/${this.userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
  
          const data = await res.json();
  
          if (res.ok) {
            this.cartItems = data;
          } else {
            console.error('Failed to fetch cart items');
            this.error = 'Failed to fetch cart items. Please try again.';
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
          this.error = 'Failed to fetch cart items. Please try again.';
        }
      },
      async removeFromCart(cartItemId) {
        try {
          const res = await fetch(`/api/cart_items/${cartItemId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
          });
  
          if (res.ok) {
            // Remove the item from the local cartItems array
            this.cartItems = this.cartItems.filter(item => item.id !== cartItemId);
          } else {
            console.error('Failed to remove item from cart');
            this.error = 'Failed to remove item from cart. Please try again.';
          }
        } catch (error) {
          console.error('Error removing item from cart:', error);
          this.error = 'Failed to remove item from cart. Please try again.';
        }
      },
      calculateOrderTotal() {
        return this.cartItems.reduce((total, item) => total + item.total_price, 0);
      },
      async placeOrder() {
        try {
          this.Order.total_amount = this.calculateOrderTotal();
          const orderDateISOString = new Date().toISOString();
          const orderDate = orderDateISOString.split('T')[0];
          this.Order.order_date= orderDate
          this.Order.user_id= this.userId;
  
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
              'userRole': this.userRole,
            },
            body: JSON.stringify(this.Order),
          });
  
          if (res.ok) {
            // Clear the cart after placing the order
            this.cartItems = [];
          } else {
            console.error('Failed to place order');
            this.error = 'Failed to place order. Please try again.';
          }
        } catch (error) {
          console.error('Error placing order:', error);
          this.error = 'Failed to place order. Please try again.';
        }
      },
    },
    mounted() {
      this.fetchCartItems();
    },
  };  