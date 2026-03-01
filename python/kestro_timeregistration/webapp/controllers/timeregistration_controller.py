from flask import Blueprint, jsonify, abort, request, Response
import json
from typing import Optional

from ...timeregistration.timeregistration_service import TimeRegistrationService

time_registration_service: Optional[TimeRegistrationService] = None

api = Blueprint(
    "kestro_timeregistration", __name__, url_prefix="/api/kestro/timeregistration"
)


@api.route("/projects")
def projects():
    if not time_registration_service:
        abort(500)

    # Use json.dumps with sort_keys=False to preserve field order
    projects_data = time_registration_service.projects()
    json_response = json.dumps(projects_data, sort_keys=False, ensure_ascii=False)

    return Response(json_response, mimetype="application/json")


@api.route("/employees")
def employees():
    if not time_registration_service:
        abort(500)

    # Use json.dumps with sort_keys=False to preserve field order
    employees_data = time_registration_service.employees()
    json_response = json.dumps(employees_data, sort_keys=False, ensure_ascii=False)

    return Response(json_response, mimetype="application/json")


@api.route("/register", methods=["POST"])
def register_time():
    if not time_registration_service:
        abort(500)

    data = request.get_json()

    # Extract employee and project objects
    employee = data.get("employee")
    project = data.get("project")
    hours = data.get("hours")
    date = data.get("date")

    if not all([employee, project, hours, date]):
        abort(400, description="Missing required fields")

    time_registration_service.register_time(employee, project, hours, date)
    return jsonify({"message": "Time registered successfully"})
