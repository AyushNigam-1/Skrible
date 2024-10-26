import os
import json
import hashlib
from automate.vision import get_element_coordinates
class CacheManager:
    def __init__(self, cache_file='app_paths_cache.json', element_cache_file='element_cache.json'):
        self.cache_file = cache_file
        self.element_cache_file = element_cache_file
        self.cache = self.load_cache(self.cache_file)
        self.element_cache = self.load_cache(self.element_cache_file)

    def hash_template(self, template_path):
        """Generates a hash for the given template image file."""
        with open(template_path, 'rb') as f:
            data = f.read()
        return hashlib.md5(data).hexdigest()

    def load_cache(self, file_path):
        """Loads the cache from the JSON file or initializes an empty dictionary."""
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        return {}

    def save_cache(self, file_path, cache_data):
        """Saves the cache to the specified JSON file."""
        with open(file_path, 'w') as f:
            json.dump(cache_data, f, indent=4)

    def get_cached_path(self, app_name):
        """Retrieves the cached path for an application, if available."""
        return self.cache.get(app_name)

    def update_cache(self, app_name, path):
        """Updates the cache with the new application path."""
        self.cache[app_name] = path
        self.save_cache(self.cache_file, self.cache)

    def update_element_cache(self, template_path, coords):
        """Updates the element cache with the detected coordinates."""
        template_hash = self.hash_template(template_path)
        self.element_cache[template_hash] = coords
        self.save_cache(self.element_cache_file, self.element_cache)
    
    def detect_element_with_cache(self, template_path, threshold=0.6):
        """Detects an element and retrieves its coordinates from cache if available."""
        template_hash = self.hash_template(template_path)

        # Check if the coordinates are cached
        if template_hash in self.element_cache:
            print(f"Using cached coordinates for template '{template_path}': {self.element_cache[template_hash]}")
            return self.element_cache[template_hash]

        # If not cached, perform detection
        print(f"Detecting element for template '{template_path}'...")
        coords = get_element_coordinates(template_path, threshold)  # Call the actual detection function
        if coords:
            # If detected, cache the coordinates
            self.update_element_cache(template_path, coords)
        else:
            print(f"Element not found for template '{template_path}'.")

        return coords
