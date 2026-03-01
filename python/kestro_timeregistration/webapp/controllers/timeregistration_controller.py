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
    
    return Response(json_response, mimetype='application/json')
