import requests
from datetime import datetime, timedelta
from celery import shared_task
from .models import Product
import flask_excel as excel
from .mail_service import send_message
from sqlalchemy.orm import joinedload
from .models import User, Role, Order
from jinja2 import Template
from flask_mail import Message
from sqlalchemy import extract
import os

    
@shared_task(ignore_result=False)
def create_resource_csv():
    # Fetch products from the database
    products = Product.query.with_entities(
        Product.name, Product.sold_quantity,Product.quantity, Product.price).all()

    # Prepare CSV data using Flask-Excel
    csv_output = excel.make_response_from_query_sets(
        products, ["name","sold_quantity", "quantity", "price"], "csv")

    # Save CSV data to a file
    filename = "products_export.csv"
    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename

# @shared_task(ignore_result=True)
# def daily_reminder(to, subject):
#     users = User.query.filter(User.roles.any(Role.name == 'customer')).all()
#     for user in users:
#         with open('test.html', 'r') as f:
#             template = Template(f.read())
#             send_message(user.email, subject,
#                          template.render(email=user.email))
#     return "OK"
# @shared_task(ignore_result=True)
# def daily_reminder(message):
#     return message
@shared_task(ignore_result=True)
def daily_reminder(to, subject):

    users = User.query.filter(User.roles.any(Role.name == 'customer')).all()
    

    for user in users:
        if not has_visited_or_bought(user):
            with open('application\\test.html', 'r') as f:
                template = Template(f.read())
                send_message(user.email, subject, template.render(email=user.email))

    return "OK"

def has_visited_or_bought(user):
    # Check if the user has visited or bought anything in the last 30 days
    last_30_days = datetime.utcnow() - timedelta(days=30)
    recent_order = Order.query.filter_by(user_id=user.id).filter(Order.order_date >= last_30_days).first()
    print("recent_order: ",recent_order)
    # print("recent_order is not None: "+recent_order is not None)

    return recent_order is not None

@shared_task(ignore_result=True)
def monthly_reminder(to, subject):
    users = User.query.join(User.roles).filter(Role.name.in_(['admin', 'manager'])).options(joinedload(User.roles)).all()
    for user in users:
        current_month_order= current_month()
        print('current_month_order',current_month_order)
        if current_month_order is not None:
            template_content = '''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Details</title>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>Order Details</h1>
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Order Date</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for order in recent_order_list %}
                            <tr>
                                <td>{{ order.user_id }}</td>
                                <td>{{ order.order_date }}</td>
                                <td>{{ order.total_amount }}</td>
                            </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </body>
            </html>
            '''

            # Use Jinja2 to render the template with data
            template = Template(template_content)
            rendered_html = template.render(recent_order_list=current_month_order)

            # Write the rendered HTML to a file
            with open('application\\order_details.html', 'w') as html_file:
                html_file.write(rendered_html)
            with open('application\\order_details.html', 'r') as f:
                order_template = Template(f.read())
                send_message(user.email, subject, order_template.render(email=user.email))

    return "OK"

def current_month():
    # Check if the user has visited or bought anything in the last 30 days
    filter_month = datetime.now().month

    api_url = "http://127.0.0.1:5000/api/orders/report"
    response = requests.get(api_url)

    if response.status_code == 200:
        api_data = response.json()
        recent_order_list = [order for order in api_data if int(order['order_date'].split('-')[1]) == filter_month]
    else:
        recent_order_list = []
    return recent_order_list 