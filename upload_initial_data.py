from main import app
from application.sec import user_datastore
from application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    user_datastore.find_or_create_role(name="admin", description="User is an admin")
    user_datastore.find_or_create_role(name="manager", description="Manager is a store manager")
    user_datastore.find_or_create_role(name="customer", description="Customer is a retail customer")
    db.session.commit()

    
    if not user_datastore.find_user(email="admin@email.com"):
        user_datastore.create_user(
            email="admin@email.com", password=generate_password_hash("admin1"), roles=["admin"])
    if not user_datastore.find_user(email="manager1@email.com"):
        user_datastore.create_user(
            email="manager1@email.com", password=generate_password_hash("manager1"), roles=["manager"], active=False)

    if not user_datastore.find_user(email="customer1@email.com"):
        user_datastore.create_user(
            email="customer1@email.com", password=generate_password_hash("customer1"), roles=["customer"])        
    db.session.commit()