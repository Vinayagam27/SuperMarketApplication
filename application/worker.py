from celery import Celery, Task

def celery_init_app(app):
    celery_app = Celery(app.name)
    class FlaskTask(Task):        
        def __call__(self, *args: object, **kwargs: object):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery_app.Task=FlaskTask
    celery_app.config_from_object("celeryconfig")
    return celery_app