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
        self.__projects_path: str = ""
        self.__projects_sheet: str = ""
        self.__projects = []
        self.__employees_sheet: str = ""
        self.__employees = []
        self.__timeregistrations_path: str = ""
        self.__timeregistrations_sheet: str = ""
        self.__timeregistrations_hour_column: str = "Hours"
        self.__timeregistrations_date_column: str = "Date"

    def load_config(self, config_path: str):

        self.__log.debug(f"TimeRegistrationService loading config from {config_path}")

        config = ConfigParser()
        config.read(config_path)

        if config.has_option("projects", "path") and config.has_option(
            "projects", "sheet"
        ):
            self.__projects_path = config.get("projects", "path")
            self.__projects_sheet = config.get("projects", "sheet")

            self.__projects = self._load_projects(
                self.__projects_path, self.__projects_sheet
            )
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
                self.__employees_sheet = config.get("timeregistrations", "employees")
                self.__employees = self._load_employees(
                    self.__timeregistrations_path, self.__employees_sheet
                )

        if config.has_option("timeregistrations", "hour_column"):
            self.__timeregistrations_hour_column = config.get(
                "timeregistrations", "hour_column"
            )

        if config.has_option("timeregistrations", "date_column"):
            self.__timeregistrations_date_column = config.get(
                "timeregistrations", "date_column"
            )

    def start(self):
        pass

    def projects(self):
        return self.__projects

    def employees(self):
        return self.__employees

    def refresh(self):
        """Reload projects and employees data from Excel files."""
        self.__log.debug("Refreshing projects and employees data")

        # Refresh projects if configured
        if self.__projects_path and self.__projects_sheet:
            old_count = len(self.__projects)
            self.__projects = self._load_projects(
                self.__projects_path, self.__projects_sheet
            )
            new_count = len(self.__projects)
            self.__log.info(f"Refreshed projects: {old_count} -> {new_count} projects")

        # Refresh employees if configured
        if self.__timeregistrations_path and self.__employees_sheet:
            old_count = len(self.__employees)
            self.__employees = self._load_employees(
                self.__timeregistrations_path, self.__employees_sheet
            )
            new_count = len(self.__employees)
            self.__log.info(
                f"Refreshed employees: {old_count} -> {new_count} employees"
            )

        self.__log.debug("Data refresh completed")

    def get_registrations_by_date(self, date: str):
        """Load time registrations for a specific date.

        Args:
            date (str): The date to filter registrations for (format should match the Excel data)

        Returns:
            list: List of dictionaries containing time registrations for the specified date
        """
        self.__log.debug(f"Loading time registrations for date: {date}")

        try:
            try:
                df = pd.read_excel(
                    self.__timeregistrations_path,
                    sheet_name=self.__timeregistrations_sheet,
                )
            except (FileNotFoundError, ValueError):
                self.__log.debug(
                    f"Sheet '{self.__timeregistrations_sheet}' doesn't exist"
                )
                return []

            # Check if DataFrame is empty
            if df.empty:
                self.__log.debug("No time registrations found in sheet")
                return []

            # Check if date column exists
            if self.__timeregistrations_date_column not in df.columns:
                self.__log.warning(
                    f"Date column '{self.__timeregistrations_date_column}' not found in sheet"
                )
                return []

            # Filter by date - handle both string and datetime comparisons
            try:
                # Try to convert the input date to pandas datetime for comparison
                target_date = pd.to_datetime(date)
                df[self.__timeregistrations_date_column] = pd.to_datetime(
                    df[self.__timeregistrations_date_column]
                )
                filtered_df = df[
                    df[self.__timeregistrations_date_column].dt.date
                    == target_date.date()
                ]
            except:
                # Fallback to string comparison if datetime parsing fails
                self.__log.debug("Using string comparison for date filtering")
                filtered_df = df[
                    df[self.__timeregistrations_date_column].astype(str) == str(date)
                ]

            # Convert date column to string format (date only, no time) before converting to dict
            if not filtered_df.empty and self.__timeregistrations_date_column in filtered_df.columns:
                filtered_df[self.__timeregistrations_date_column] = filtered_df[
                    self.__timeregistrations_date_column
                ].dt.strftime('%Y-%m-%d')

            # Convert to list of dictionaries
            registrations = filtered_df.to_dict("records")

            self.__log.debug(
                f"Found {len(registrations)} registrations for date {date}"
            )
            return registrations

        except Exception as e:
            self.__log.error(f"Failed to load registrations for date {date} - {e}")
            return []

    def register_time(self, employee: dict, project: dict, hours: float, date: str):
        self.__log.debug(
            f"Registering time: employee={employee.get('name', 'Unknown')}, project={project.get('name', 'Unknown')}, hours={hours}, date={date}"
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
                    df = pd.DataFrame()
            else:
                df = pd.DataFrame()

            # Build new entry: date, project fields, employee fields, hours
            # Convert date string to proper datetime for Excel compatibility
            try:
                parsed_date = pd.to_datetime(date)
            except:
                # If parsing fails, use current date and log warning
                parsed_date = pd.to_datetime("today")
                self.__log.warning(f"Failed to parse date '{date}', using today's date")

            # Create new DataFrame with proper type handling
            new_entry = {}
            new_df = pd.DataFrame([new_entry])
            new_df[self.__timeregistrations_date_column] = parsed_date

            # Add all project fields with prefix to avoid conflicts
            for key, value in project.items():
                new_df[f"{key}"] = value

            # Add all employee fields with prefix to avoid conflicts
            for key, value in employee.items():
                new_df[f"{key}"] = value

            new_df[self.__timeregistrations_hour_column] = hours

            # Append new registration
            df = pd.concat([df, new_df], ignore_index=True)

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
