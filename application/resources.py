from flask_restful import Resource, Api,fields,marshal, reqparse
from flask_security import auth_required, roles_required, current_user,roles_accepted
# from flask_login import current_user, login_user, logout_user, login_required
from application.models import User, Category, Product, Cart, Order, db
from flask_login import login_user, logout_user, login_required
from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from .instances import cache
from itertools import groupby
from operator import itemgetter
from sqlalchemy import func


api = Api(prefix='/api')
class StudyMaterial(Resource):
    def get(self):
        return {"message":"hello from a1pi"}

api.add_resource(StudyMaterial,'/study_material')


class UserResource(Resource):
    user_fields = {
        'id': fields.Integer,
        'username': fields.String,
        'user_type': fields.String
    }

    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, help='Username is required', required=True)
    parser.add_argument('password', type=str, help='Password is required', required=True)
    parser.add_argument('user_type', type=str, help='User type is required', required=True)

    def get(self, user_id=None):    
        if user_id is not None:
            # Get a specific user by user_id
            user = User.query.get_or_404(user_id)
            return marshal(user, self.user_fields), 200
        else:
            # Get all users
            users = User.query.all()
            return marshal(users, self.user_fields), 200

    # @auth_required("token")
    # @roles_required("admin")
    def post(self):
        args = self.parser.parse_args()
        user = User(username=args.get('username'), password=args.get('password'), user_type=args.get('user_type'))
        db.session.add(user)
        db.session.commit()
        return marshal(user, self.user_fields), 201

    # @auth_required("token")
    # @roles_required("admin")
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        args = self.parser.parse_args()
        user.username = args.get('username')
        user.password = args.get('password')
        user.user_type = args.get('user_type')
        db.session.commit()
        return marshal(user, self.user_fields), 200

    # @auth_required("token")
    # @roles_required("admin")
    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted successfully"}, 200

api.add_resource(UserResource, '/users','/users/<int:user_id>','/users/all')





class CategoryResource(Resource):
    category_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String,
        'user_id': fields.Integer,  
        'is_approved': fields.Boolean,
        'isdel_approved': fields.Boolean,  # Added isdel_approved field
        'isedit_approved': fields.Boolean 
    }

    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help='Name is required', required=True)
    parser.add_argument('description', type=str, help='Description is required', required=True)
    parser.add_argument('user_id', type=int, help='User Id is required', required=True)
    parser.add_argument('is_approved', type=bool, help='Approval Indicator is required')
    parser.add_argument('isdel_approved', type=bool, help='Deletion Approval Indicator is required')  # Added isdel_approved argument
    parser.add_argument('isedit_approved', type=bool, help='Edit Approval Indicator is required')  # Added isedit_approved argument


    # @auth_required("token")
    # @roles_accepted("manager","admin")

    def get(self, category_id=None):
        if category_id is not None:
            category = Category.query.get_or_404(category_id)
            return marshal(category, self.category_fields), 200    
        else:
            # Get all categories
            category = Category.query.all()
            return marshal(category, self.category_fields), 200
        
    category_prod_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String,
        'user_id':fields.Integer,
        'is_approved':fields.Boolean,
        'products': fields.List(fields.Nested({
            'id': fields.Integer,
            'name': fields.String,
            'unit': fields.String,
            'price': fields.Float,
            'quantity': fields.Float,
            'image_filename': fields.String,
            'manufacture_date': fields.DateTime(dt_format='rfc822'),
            'expiry_date': fields.DateTime(dt_format='rfc822')
        }))
    }

    # ... existing code ...

    def get_products(self, category_id=None):
        if category_id is not None:
            category = Category.query.get_or_404(category_id)
            return marshal(category, self.category_prod_fields), 200
        else:
            categories = Category.query.all()
            formatted_categories = []
            for category in categories:
                formatted_category = marshal(category, self.category_prod_fields)
                formatted_category['products'] = marshal(category.products, ProductResource.product_fields)
                formatted_categories.append(formatted_category)
            return formatted_categories, 200
        
    # @auth_required("token")
    # @roles_accepted("admin","manager")    
    def post(self):
        args = self.parser.parse_args()
        category = Category(name=args.get('name'), description=args.get('description'),user_id=args.get('user_id'),
                            is_approved=args.get('is_approved'),
                             isdel_approved=args.get('isdel_approved'),
            isedit_approved=args.get('isedit_approved'))
        db.session.add(category)
        db.session.commit()
        return marshal(category, self.category_fields), 201

    # @auth_required("token")
    # @roles_accepted("admin","manager")    
    def put(self, category_id):
        category = Category.query.get_or_404(category_id)
        args = self.parser.parse_args()
        category.name = args.get('name')
        category.description = args.get('description')
        category.user_id=args.get('user_id')
        category.is_approved=args.get('is_approved')
        category.isdel_approved = args.get('isdel_approved')  # Added isdel_approved field
        category.isedit_approved = args.get('isedit_approved')
        db.session.commit()
        return marshal(category, self.category_fields), 200

    # @auth_required("token")
    # @roles_accepted("admin","manager")    
    def delete(self, category_id):
        category = Category.query.get_or_404(category_id)
        db.session.delete(category)
        db.session.commit()
        return {"message": "Category deleted successfully"}, 200

# api.add_resource(CategoryResource, '/categories','/categories/<int:category_id>','/categories/all', '/categories/all/products', '/categories/<int:category_id>/products')
# api.add_resource(CategoryResource, '/categories', '/categories/<int:category_id>', '/categories/all/products', '/categories/<int:category_id>/products', endpoint='categories')

api.add_resource(CategoryResource, '/categories', '/categories/<int:category_id>', '/categories/all')

# Add a new resource for getting products for all categories
api.add_resource(CategoryResource, '/category/no/products','/category/<int:category_id>/products', endpoint='get_products')

# ... existing code ...

class ProductResource(Resource):
    
    product_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'unit': fields.String,
        'price': fields.Float,
        'sold_quantity': fields.Float,
        'quantity': fields.Float,
        'image_filename': fields.String,
        'manufacture_date': fields.DateTime,
        'expiry_date': fields.DateTime,
        'categories': fields.List(fields.Nested(CategoryResource.category_fields)),
        'user_id': fields.Integer, 
    }

    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help='Name is required', required=True)
    parser.add_argument('unit', type=str, help='Unit is required', required=True)
    parser.add_argument('price', type=float, help='Price is required', required=True)
    parser.add_argument('sold_quantity', type=float, help='Solded Quantity is required', required=True)
    parser.add_argument('quantity', type=float, help='Quantity is required', required=True)
    parser.add_argument('image_filename', type=str, help='Image filename is required', required=True)
    parser.add_argument('manufacture_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'), help='Manufacture date is required', required=True)
    parser.add_argument('expiry_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'), help='Expiry date is required', required=True)
    parser.add_argument('categories', type=list, help='Categories are required', required=True)
    parser.add_argument('user_id', type=int, help='User Id is required', required=True)


    search_parser = reqparse.RequestParser()
    search_parser.add_argument('query', type=str, help='Search query')
    
    # @auth_required("token")
    # @roles_accepted('admin','manager','customer')    
    @cache.cached(timeout=50)    
    def get(self, product_id=None):
        if product_id is not None:
            product = Product.query.get_or_404(product_id)
            return marshal(product, self.product_fields), 200    
        else:
            # Get all products
            product = Product.query.all()
            return marshal(product, self.product_fields), 200    
    
    # @auth_required("token")
    # @roles_accepted("admin","manager","customer")    
    def post(self):
        # cache.clear()
        args = self.parser.parse_args()
        product = Product(
            name=args.get('name'),
            unit=args.get('unit'),
            price=args.get('price'),
            sold_quantity=args.get('sold_quantity'),
            quantity=args.get('quantity'),
            image_filename=args.get('image_filename'),
            manufacture_date=args.get('manufacture_date'),
            expiry_date=args.get('expiry_date'),
            user_id=args.get('user_id')
        )

        for category_id in args.get('categories'):
            category = Category.query.get(category_id)
            if category:
                product.categories.append(category)

        db.session.add(product)
        db.session.commit()
        return marshal(product, self.product_fields), 201

    # @auth_required("token")
    # @roles_accepted("admin","manager","customer")    
    def put(self, product_id):
        product = Product.query.get_or_404(product_id)
        args = self.parser.parse_args()
        product.name = args.get('name')
        product.unit = args.get('unit')
        product.price = args.get('price')
        product.sold_quantity = args.get('sold_quantity')
        product.quantity = args.get('quantity')
        product.image_filename = args.get('image_filename')
        product.manufacture_date = args.get('manufacture_date')
        product.expiry_date = args.get('expiry_date')
        product.user_id=args.get('user_id')

        product.categories.clear()
        for category_id in args.get('categories'):
            category = Category.query.get(category_id)
            if category:
                product.categories.append(category)

        db.session.commit()
        return marshal(product, self.product_fields), 200

    # @auth_required("token")
    # @roles_accepted("admin","manager")
    def delete(self, product_id):
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return {"message": "Product deleted successfully"}, 200

api.add_resource(ProductResource,'/products', '/products/<int:product_id>')


class BuyResource(Resource):
    

    category_prod_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String,
        'is_approved': fields.Boolean,
        'isdel_approved': fields.Boolean,
        'isedit_approved': fields.Boolean,
        'user_id': fields.Integer,
    }

    # @auth_required("token")
    # @roles_required("customer")
    def get(self, queries=None):
        
        if queries is not None:
            category=ProductSearchResource.get(self,queries)            
            return category
        else:            
            categories = Category.query.options(joinedload(Category.products)).all()
            formatted_categories = []
            for category in categories:
                formatted_category = marshal(category, self.category_prod_fields)
                formatted_category['products'] = marshal(category.products, ProductResource.product_fields)
                formatted_categories.append(formatted_category)
            return formatted_categories, 200

api.add_resource(BuyResource, '/productcategories/<path:queries>','/productcategories')


class ProductSearchResource(Resource):
    category_fields = {
        'id': fields.Integer,
        'name': fields.String,
        'products': fields.List(fields.Nested({
            'id': fields.Integer,
            'name': fields.String,
            'unit': fields.String,
            'price': fields.Float,
            'sold_quantity': fields.Float,
            'quantity': fields.Float,
            'image_filename': fields.String,
            'manufacture_date': fields.String,
            'expiry_date': fields.String,
            'user_id': fields.Integer,
        }))
    }

    # @auth_required("token")
    # @roles_accepted("admin","manager","customer")

    def get(self, queries=None):
        if queries:
            # First, search in the Category model
            categories = Category.query.filter(Category.name.ilike(f"%{queries}%")).options(joinedload(Category.products)).all()

            if categories:
                # If categories are found, organize data in hierarchy
                result_hierarchy = marshal(categories, ProductSearchResource.category_fields)
                return result_hierarchy, 200
            else:
                # If no categories are found, perform a search in the Product model
                products = Product.query.filter(
                    or_(
                        Product.name.ilike(f"%{queries}%"),
                        Product.unit.ilike(f"%{queries}%"),
                        Product.price.ilike(f"%{queries}%"),
                        Product.quantity.ilike(f"%{queries}%"),
                        # Add more fields as needed for search
                    )
                ).options(joinedload(Product.categories)).all()
                # print("Products++000000",products)
                
                # Skip the 'image_filename' field
                product_fields = {
                    'id': fields.Integer,
                    'name': fields.String,
                    'unit': fields.String,
                    'price': fields.Float,
                    'sold_quantity': fields.Float,
                    'quantity': fields.Float,
                    'image_filename': fields.String,
                    # 'categories': fields.List(fields.Nested(CategoryResource.category_fields)),
                    'manufacture_date': fields.DateTime,
                    'expiry_date': fields.DateTime,
                    'user_id': fields.Integer,
                }
                # print("Products Marshal++++",marshal(products,product_fields))

                grouped_products = {}
                for product in products:
                    for category in product.categories:
                        category_id = category.id
                        if category_id not in grouped_products:
                            grouped_products[category_id] = {
                                'id': category_id,
                                'name': category.name,
                                'products': []
                            }
                        # Marshal the product and append it to the products list
                        grouped_products[category_id]['products'].append(marshal(product, product_fields))

                # Convert the grouped_products dictionary values to a list
                print("grouped_products++++",grouped_products)
                category_output = list(grouped_products.values())

                # Now, category_output contains the desired structure
                # You can marshal it using category_fields if needed
                # marshaled_category_output = marshal(category_output, ProductSearchResource.category_fields)

                return marshal(category_output, ProductSearchResource.category_fields)
                # print("marshaled_category_output+++",marshaled_category_output)

                # return marshal(products, product_fields), 200

        else:
            # Get all products if no search query is provided
            products = Product.query.all()

            # Skip the 'image_filename' field
            product_fields = {
                'id': fields.Integer,
                'name': fields.String,
                'unit': fields.String,
                'price': fields.Float,
                'sold_quantity': fields.Float,
                'quantity': fields.Float,
                'image_filename': fields.String,                
                'manufacture_date': fields.DateTime,
                'expiry_date': fields.DateTime,
                'user_id': fields.Integer,
            }

            return marshal(products, product_fields), 200
api.add_resource(ProductSearchResource, '/products/search/<path:queries>')

class CartResource(Resource):
    cart_item_fields = {
        'id': fields.Integer,
        'quantity': fields.Float,
        'total_price': fields.Float,
        'product': fields.Nested(ProductResource.product_fields),
        'order_id':fields.String
    }

    parser = reqparse.RequestParser()
    parser.add_argument('quantity', type=float, help='Quantity is required', required=True)
    parser.add_argument('product_id', type=int, help='Product ID is required', required=True)
    parser.add_argument('user_id', type=str, help='User ID is required', required=True)


    # @auth_required("token")
    # @roles_required("customer")
    def get(self, cart_item_id=None, user_id=None):
        if cart_item_id:
            cart_item = Cart.query.get_or_404(cart_item_id)
            return marshal(cart_item, self.cart_item_fields), 200
        elif user_id:
            cart_items = Cart.query.filter_by(user_id=user_id,order_id=None).all()
            return [marshal(cart_item, self.cart_item_fields) for cart_item in cart_items], 200
        else:
            cart_items = Cart.query.all()
            return [marshal(cart_item, self.cart_item_fields) for cart_item in cart_items], 200
        
    # @auth_required("token")
    # @roles_required("customer")    

    def post(self):
        args = self.parser.parse_args()

        # Retrieve the corresponding Product instance
        product = Product.query.get_or_404(args.get('product_id'))

        # Check if the requested quantity is available
        if product.quantity < args.get('quantity'):
            return {'error': 'Requested Quantity is unavailable'}, 400

        # Calculate the total_price based on quantity and product price
        total_price = args.get('quantity') * product.price

        # Subtract the quantity from the Product model
        product.sold_quantity += args.get('quantity')
        product.quantity -= args.get('quantity')

        cart_item = Cart(
            quantity=args.get('quantity'),
            total_price=total_price,
            user_id=args.get('user_id'),
            product_id=args.get('product_id')
        )

        db.session.add(cart_item)
        db.session.commit()

        return marshal(cart_item, self.cart_item_fields), 201

    # @auth_required("token")
    # @roles_required("customer")
    def put(self, cart_item_id):
        cart_item = Cart.query.get_or_404(cart_item_id)
        args = self.parser.parse_args()
        cart_item.quantity = args.get('quantity')
        db.session.commit()
        return marshal(cart_item, self.cart_item_fields), 200

    # @auth_required("token")
    # def delete(self, cart_item_id):
    #     cart_item = Cart.query.get_or_404(cart_item_id)
    #     db.session.delete(cart_item)
    #     db.session.commit()
    #     return {"message": "Cart item deleted successfully"}, 200

    # @auth_required("token")
    # @roles_required("customer")
    def delete(self, cart_item_id):
        cart_item = Cart.query.get_or_404(cart_item_id)

        # Check if the order_id is blank or null
        if cart_item.order_id is None:
            # Retrieve the corresponding Product instance
            product = Product.query.get_or_404(cart_item.product_id)

            # Add the quantity back to the Product model
            product.quantity += cart_item.quantity
            product.sold_quantity -= cart_item.quantity

            # Delete the CartItem model
            db.session.delete(cart_item)
            db.session.commit()

            return {"message": "Cart item deleted successfully"}, 200
        else:
            return {"error": "Cannot delete cart item with an associated order"}, 400

api.add_resource(CartResource, '/cart_items', '/cart_items/<int:cart_item_id>', '/cart_items/user/<int:user_id>')


class OrderResource(Resource):
    order_fields = {
        'id': fields.Integer,
        'total_amount': fields.Float,
        'order_date': fields.String,
        'user_id': fields.String,
        'cart_items': fields.List(fields.Nested(CartResource.cart_item_fields))
    }
    order_fields_report = {        
        'user_id': fields.String,
        'order_date': fields.String,        
        'total_amount': fields.Float
    }

    parser = reqparse.RequestParser()
    parser.add_argument('total_amount', type=float, help='Total Amount is required', required=True)
    parser.add_argument('order_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'), help='Order Date is required', required=True)
    parser.add_argument('user_id', type=str, help='User ID is required', required=True)

    # @auth_required("token")
    def get(self, order_id=None):
        orders = Order.query.all()
        if order_id is not None and order_id.isdigit():
            order_id = int(order_id)
            order = next((o for o in orders if o.id == order_id), None)
            if order:
                return marshal(order, self.order_fields), 200
            else:
                return {"error": f"Order with ID {order_id} not found"}, 404
        else:
            return self.get_orders(order_id)

    def get_orders(self,order_id):
        orders = Order.query

        if order_id is not None and 'report' in order_id.lower():

            grouped_orders = (
                orders.group_by(Order.user_id, func.strftime('%Y-%m', Order.order_date))
                .with_entities(
                    Order.user_id,
                    func.strftime('%Y-%m', Order.order_date).label('order_date'),
                    func.sum(Order.total_amount).label('total_amount')
                )
                .all()
            )          
            print("inside grouped_orders",grouped_orders)

            return marshal(grouped_orders, self.order_fields_report), 200
        else:
            # Get specific order
            return marshal(orders, self.order_fields), 200


    def post(self):
        args = self.parser.parse_args()
        user_id = args.get('user_id')

        # Check if there are existing Cart items with a blank order_id for the specified user_id
        cart_items_to_update = Cart.query.filter_by(user_id=user_id, order_id=None).all()
        
        if cart_items_to_update:
            # Create the Order instance
            order = Order(total_amount=args.get('total_amount'), user_id=user_id, order_date=args.get('order_date'))
            db.session.add(order)
            db.session.commit()

            # Update the order_id in the corresponding Cart items
            for cart_item in cart_items_to_update:
                cart_item.order_id = order.id

            db.session.commit()

            return marshal(order, self.order_fields), 201
        else:
            return {"error": "No cart items found with a blank order_id for the specified user_id"}, 400

    # @auth_required("token")
    def delete(self, order_id):
        order = Order.query.get_or_404(order_id)
        db.session.delete(order)
        db.session.commit()
        return {"message": "Order deleted successfully"}, 200

api.add_resource(OrderResource,'/orders', '/orders/<path:order_id>')