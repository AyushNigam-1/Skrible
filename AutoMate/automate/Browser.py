import platform
import os
import json
import subprocess
import pyautogui
import time
from langchain_ollama import OllamaLLM
import pyautogui
from automate.vision import detect_search_bar

os.environ["PYAUTOGUI_NO_TKINTER"] = "1"

class tools:

    def __init__(self, llm, cache_file='app_paths_cache.json'):
        """
        Initializes the OpenApplication class with an LLM instance, detects the OS, 
        and loads or initializes the cache.
        """
        self.llm = llm
        self.app_path = ''
        self.os_name = platform.system()
        self.cache_file = cache_file
        self.cache = self.load_cache()

    def load_cache(self):
        """Loads the cache from the JSON file or initializes an empty dictionary."""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        return {}

    def save_cache(self):
        """Saves the cache to the JSON file."""
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f, indent=4)

    def get_cached_path(self, app_name):
        """Retrieves the cached path for an application, if available."""
        return self.cache.get(app_name)

    def open(self, app_name: str):
        """Generates the path for the application and opens it."""
        try:
            cached_path = self.get_cached_path(app_name)
            if cached_path and os.path.exists(cached_path):
                print(f"Using cached path for {app_name}: {cached_path}")
                app_path = cached_path
            else:
                prompt = (
                    f"Provide the exact installation path of '{app_name}' executable file on a {self.os_name} system. "
                    f"Do not include any additional explanation, only the path."
                )
                generated_path = self.llm.invoke(prompt)
                print(f"Generated Path: {generated_path.content}")

                if os.path.exists(generated_path.content):
                    self.cache[app_name] = generated_path.content
                    self.save_cache()
                    app_path = generated_path.content
                else:
                    print(f"Path '{generated_path.content}' not found. Please verify the application name.")
                    return

            subprocess.Popen([app_path])  
            print(f"Opened application at: {app_path}")

        except Exception as e:
            print(f"Failed to open application: {str(e)}")

    def detect_and_write(self, template_path, text_to_write):
        """Detects an element based on the template image path and writes text to it."""
        position = detect_search_bar(template_path)
        if position:
            pyautogui.write(text_to_write)
        else:
            print("Could not write to the search bar because it was not found.")
