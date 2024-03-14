from flask import Flask
from flask_security import Security
from application.models import db, User, Role
from config import DevelopmentConfig
from application.resources import api
from application.sec import user_datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_reminder,monthly_reminder
from application.instances import cache


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    app.security = Security(app, user_datastore)
    cache.init_app(app)
    with app.app_context():
        import application.views

    return app, user_datastore


app,user_datastore = create_app()
celery_app = celery_init_app(app)


@celery_app.on_after_configure.connect
# def send_email(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(hour=20, minute=17,day_of_week=4),
#         daily_reminder.s('Daily Reminder 2'),
#     )
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=14),
        daily_reminder.s('vinayagamsankar@gmail.com', 'Daily Test'),
    )

@celery_app.on_after_configure.connect
def send_order_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=14),
        monthly_reminder.s('vinayagamsankar@gmail.com', 'Monthly Test'),
    )


if __name__ == '__main__':
    app.run(debug=True)