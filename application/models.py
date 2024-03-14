from flask_security import UserMixin, RoleMixin
from flask_sqlalchemy import SQLAlchemy

# from flask_login import UserMixin
from datetime import datetime,timedelta


db=SQLAlchemy()



class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))

# class User(db.Model, UserMixin):
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     username = db.Column(db.String(64), unique=True, nullable=False)
#     password = db.Column(db.String(128), nullable=False)
#     user_type = db.Column(db.String(10), nullable=False)
#     cart = db.relationship('Cart', backref='user', lazy=True)
#     is_approved = db.Column(db.Boolean, default=False)

#     def __init__(self, username, password,user_type):
#         self.username = username
#         self.password = password
#         self.user_type=user_type


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
    
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    # study_resource = db.relationship('StudyResource', backref='creator')
    
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))        

association_table = db.Table('Prod_Category',
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(128))
    is_approved = db.Column(db.Boolean)  # Added is_approved column
    isdel_approved = db.Column(db.Boolean)  # Added isdel_approved column
    isedit_approved = db.Column(db.Boolean)  
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Added user_id foreign key



class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    manufacture_date = db.Column(db.DateTime, default=datetime.utcnow())
    expiry_date = db.Column(db.DateTime, default=datetime.utcnow() + timedelta(weeks=1))
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(10))
    sold_quantity = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    categories = db.relationship('Category', secondary=association_table, backref='products')
    image_filename = db.Column(db.String(128), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Added user_id foreign key

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    cart_items = db.relationship('Cart', backref='order', lazy=True)