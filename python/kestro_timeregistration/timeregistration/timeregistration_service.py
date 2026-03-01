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

    def load_config(self, config_path: str):

        self.__log.debug(f"TimeRegistrationService loading config from {config_path}")

        config = ConfigParser()
        config.read(config_path)

        if config.has_option("projects", "path") and config.has_option("projects", "sheet"):
            excel_path = config.get("projects", "path")
            sheet_name = config.get("projects", "sheet")
            
            self.__projects = self._load_projects(excel_path, sheet_name)
            self.__log.debug(f"TimeRegistrationService loaded projects: {self.__projects}")

    def start(self):
        pass

    def projects(self):
        return self.__projects
    
    def _load_projects(self, excel_path: str, sheet_name: str):
        try:
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            
            # Filter out rows that contain NaN values in any column
            df_filtered = df.dropna()
            
            projects = df_filtered.to_dict('records')  # Convert DataFrame to list of dictionaries
            self.__log.debug(f"Loaded {len(projects)} projects (filtered from {len(df)} total) from {excel_path}:{sheet_name}")
            return projects
        except Exception as e:
            self.__log.error(f"Failed to load projects from {excel_path}:{sheet_name} - {e}")
            return []
    