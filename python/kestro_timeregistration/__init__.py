import os

from .webapp.webserver import WebServer
from .webapp.controllers import kestro_controller, timeregistration_controller
from .timeregistration.timeregistration_service import TimeRegistrationService


def create_app():
    config_path = os.getenv("KESTRO_CONFIG", "kestro.ini")


    time_registration_service = TimeRegistrationService()
    time_registration_service.load_config(config_path)
    time_registration_service.start()
    
    webserver = WebServer(__name__)
    timeregistration_controller.time_registration_service = time_registration_service

    webserver.add_controller(kestro_controller.api)
    webserver.add_controller(timeregistration_controller.api)

    return webserver.app
