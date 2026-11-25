from flask import Flask, jsonify, render_template
from flask import Flask, jsonify
from flask_login import LoginManager

from config import Config
from db_connection import test_connection

from backend.auth.auth_routes import auth_bp
from backend.auth.auth_service import get_user_by_id

from backend.student.student_routes import student_bp
from backend.documents.document_routes import document_bp
from backend.requests.request_routes import request_bp


login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)


def create_app():

    app = Flask(
        __name__,
        template_folder="frontend/templates",
        static_folder="frontend/static"
    )

    app.config.from_object(Config)

    login_manager.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(request_bp)

    @app.route("/")
    def login_page():
        return render_template("student/student_main.html")

    @app.route("/health")
    def health():
        return jsonify({
            "status": "running"
        })

    @app.route("/health/database")
    def database_health():

        connected = test_connection()

        return jsonify({
            "database": "connected" if connected else "disconnected"
        }), 200 if connected else 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
