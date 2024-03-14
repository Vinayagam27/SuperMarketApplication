from flask import current_app as app, jsonify, request, render_template,send_file
from application.tasks import create_resource_csv
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash, generate_password_hash
from .models import User, db, Role, Product
from celery.result import AsyncResult
from .tasks import create_resource_csv
import flask_excel as excel
from flask_restful import marshal, fields
from .sec import user_datastore
@app.get('/')
def home():
        return render_template("index.html")


@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin(): 
    return "welcome admin"

@app.get('/activate/manager/<int:mgr_id>')
@auth_required("token")
@roles_required("admin")
def activate_manager(mgr_id):
    Manager = User.query.get(mgr_id)
    if not Manager or "manager" not in Manager.roles:
        return jsonify({"message": "Manager not found"}), 404

    Manager.active = True
    db.session.commit()
    return jsonify({"message": "Store Manager Activated"})

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = user_datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if check_password_hash(user.password, data.get("password")):
        print("user.email: ",user.email)
        print("user.email: ",user.roles[0].name)
        print("Active: ",user.active)
        print("User ID",user.id)
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name,"active":user.active,"user_id":user.id})
    else:
        return jsonify({"message": "Wrong Password"}), 400
    

@app.post('/user-register')
def user_register():
    data = request.get_json()

    # Get required input fields
    email = data.get('email')
    password = data.get('password')
    roles_str = data.get('roles')
    print("email:",email,"password:", password,"roles: ",roles_str)
    

    # Validate input fields
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # Check if the user already exists
    if user_datastore.find_user(email=email):
        return jsonify({"message": "User already exists"}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password)

    # Set 'active' based on the roles
    active = True if 'manager' not in roles_str else False

    roles = [roles_str]
    print('role:',roles)

    # Create a new user using user_datastore.create_user()
    user = user_datastore.create_user(email=email, password=hashed_password, roles=roles, active=active)
    # Add additional fields as needed
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.get('/get-roles')
def get_roles():
    try:
        roles = Role.query.all()

        # Convert roles to a list of dictionaries
        roles_list = [
            {
                'id': role.id,
                'name': role.name,
                'description': role.description
            }
            for role in roles
        ]

        return jsonify({'roles': roles_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean
}


@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message": "No User Found"}), 404
    return marshal(users, user_fields)


# @app.get('/study-resource/<int:id>/approve')
# @auth_required("token")
# @roles_required("inst")
# def resource(id):
#     study_resource = StudyResource.query.get(id)
#     if not study_resource:
#         return jsonify({"message": "Resource Not found"}), 404
#     study_resource.is_approved = True
#     db.session.commit()
#     return jsonify({"message": "Aproved"})


@app.get('/download-csv')
def download_csv():
    task = create_resource_csv.delay()
    return jsonify({"task-id": task.id})


@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    print(res.status)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404

# @app.get('/download-csv')
# def download_csv():
#     # Fetch products from the database
#     products = Product.query.with_entities(
#         Product.name, Product.quantity, Product.price).all()

#     # Prepare CSV data using Flask-Excel
#     csv_output = excel.make_response_from_query_sets(
#         products, ["name", "quantity", "price"], "csv",filename="test1.csv")
#     return csv_output