import time
import asyncio
import logging
import pandas as pd

from configparser import ConfigParser
from threading import Thread


class TimeRegistrationService:
    """Loads the configured excel sheets and provides methods to write time registrations to them."""

    def __init__(self):
        self.__log = logging.getLogger(__name__)
        self.__log.debug("TimeRegistrationService created")
        self.__projects = []
        self.__employees = []
        self.__timeregistrations_path: str = ""
        self.__timeregistrations_sheet: str = ""

    def load_config(self, config_path: str):

        self.__log.debug(f"TimeRegistrationService loading config from {config_path}")

        config = ConfigParser()
        config.read(config_path)

        if config.has_option("projects", "path") and config.has_option(
            "projects", "sheet"
        ):
            excel_path = config.get("projects", "path")
            sheet_name = config.get("projects", "sheet")

            self.__projects = self._load_projects(excel_path, sheet_name)
            self.__log.debug(
                f"TimeRegistrationService loaded projects: {self.__projects}"
            )

        if config.has_option("timeregistrations", "path"):
            self.__timeregistrations_path = config.get("timeregistrations", "path")

            if config.has_option("timeregistrations", "timeregistrations"):
                self.__timeregistrations_sheet = config.get(
                    "timeregistrations", "timeregistrations"
                )

            if config.has_option("timeregistrations", "employees"):
                employees_sheet = config.get("timeregistrations", "employees")
                self.__employees = self._load_employees(
                    self.__timeregistrations_path, employees_sheet
                )

    def start(self):
        pass

    def projects(self):
        return self.__projects

    def employees(self):
        return self.__employees

    def register_time(self, employee_id: int, project_id: int, hours: float, date: str):
        self.__log.debug(
            f"Registering time: employee_id={employee_id}, project_id={project_id}, hours={hours}, date={date}"
        )
        try:
            # Load existing timeregistrations
            if self.__timeregistrations_sheet:
                try:
                    df = pd.read_excel(
                        self.__timeregistrations_path,
                        sheet_name=self.__timeregistrations_sheet,
                    )
                except ValueError:
                    # Sheet doesn't exist, create empty DataFrame
                    self.__log.debug(
                        f"Sheet '{self.__timeregistrations_sheet}' doesn't exist, creating new one"
                    )
                    df = pd.DataFrame(
                        columns=["employee_id", "project_id", "hours", "date"]
                    )
            else:
                df = pd.DataFrame(
                    columns=["employee_id", "project_id", "hours", "date"]
                )

            # Append new registration
            new_entry = {
                "employee_id": employee_id,
                "project_id": project_id,
                "hours": hours,
                "date": date,
            }
            df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)

            # Save back to Excel
            with pd.ExcelWriter(
                self.__timeregistrations_path, mode="a", if_sheet_exists="replace"
            ) as writer:
                df.to_excel(
                    writer, sheet_name=self.__timeregistrations_sheet, index=False
                )

            self.__log.debug("Time registration successful")
        except Exception as e:
            self.__log.error(f"Failed to register time - {e}")

    def _load_projects(self, excel_path: str, sheet_name: str):
        try:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)

            # Filter out rows that contain NaN values in any column
            df_filtered = df.dropna()

            projects = df_filtered.to_dict(
                "records"
            )  # Convert DataFrame to list of dictionaries
            self.__log.debug(
                f"Loaded {len(projects)} projects (filtered from {len(df)} total) from {excel_path}:{sheet_name}"
            )
            return projects
        except Exception as e:
            self.__log.error(
                f"Failed to load projects from {excel_path}:{sheet_name} - {e}"
            )
            return []

    def _load_employees(self, excel_path: str, sheet_name: str):
        try:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)

            # Filter out rows that contain NaN values in any column
            df_filtered = df.dropna()

            employees = df_filtered.to_dict(
                "records"
            )  # Convert DataFrame to list of dictionaries
            self.__log.debug(
                f"Loaded {len(employees)} employees (filtered from {len(df)} total) from {excel_path}:{sheet_name}"
            )
            return employees
        except Exception as e:
            self.__log.error(
                f"Failed to load employees from {excel_path}:{sheet_name} - {e}"
            )
            return []
