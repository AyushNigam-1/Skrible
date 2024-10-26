import platform
import os
import subprocess
import pyautogui
import time
from langchain_ollama import OllamaLLM
from automate.vision import get_element_coordinates, extract_text , find_text_coordinates
from automate.cache_manager import CacheManager  


os.environ["PYAUTOGUI_NO_TKINTER"] = "1"

class tools:
    def __init__(self, llm, cache_file='app_paths_cache.json', element_cache_file='element_cache.json'):
        """
        Initializes the Tools class with an LLM instance, detects the OS,
        and initializes the CacheManager.
        """
        self.llm = llm
        self.os_name = platform.system()
        self.cache_manager = CacheManager(cache_file, element_cache_file)  

    def open(self, app_name: str):
        """Generates the path for the application and opens it."""
        try:
            cached_path = self.cache_manager.get_cached_path(app_name)
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
                    self.cache_manager.update_cache(app_name, generated_path.content)  
                    app_path = generated_path.content
                else:
                    print(f"Path '{generated_path.content}' not found. Please verify the application name.")
                    return

            self.process = subprocess.Popen([app_path])
            print(f"Opened application at: {app_path}")

        except Exception as e:
            print(f"Failed to open application: {str(e)}")
    
    def close(self):
        """Closes the application opened with the open() function."""
        if self.process:
            print(f"Closing application with PID: {self.process.pid}")
            try:
                self.process.terminate()  # Graceful termination
                self.process.wait(timeout=5)  # Wait for it to close
                print("Application closed successfully.")
            except Exception as e:
                print(f"Failed to close application: {e}")
        else:
            print("No application is currently running.")

    def detect_and_scroll(self, template_path, scroll_amount=-10, max_attempts=10, 
                        wait_for_element=False, wait_time=0, scroll_until=None, 
                        click_on_detect=False):
        """
        Detects an element on the screen and scrolls to bring it into view if not initially visible.
        Optionally, scrolls until a target element is detected, and clicks if found.
        """
        attempt = 0
            
        while True:
            coords = find_text_coordinates("Tanmay")
            if coords:
                x, y, _, _ = coords
                print(f"Element found at: {coords}")
                pyautogui.moveTo(x, y, duration=0.5)
                while attempt < max_attempts:
                    target_coords = get_element_coordinates(scroll_until)  
                    if target_coords:
                        center_x, center_y, _, _ = target_coords
                        pyautogui.moveTo(center_x, center_y, duration=0.5)
                        if click_on_detect:
                            pyautogui.click()
                        print(f"Scrolled to and detected: {target_coords}")
                        break
                    else:
                        print(f"Scrolling... attempt {attempt + 1}")
                        pyautogui.scroll(scroll_amount)
                        time.sleep(1.5)
                        attempt += 1
                break     
              
            if attempt >= max_attempts:
                print("Max scroll attempts reached. Target element not found.")



    def detect_and_click(self, template_path, wait_for_element=False, timeout=10):
        """Detects an element based on the template and clicks at its center."""

        start_time = time.time()
        while time.time() - start_time < timeout:
            coords = get_element_coordinates(template_path)  
            if coords:
                center_x, center_y, _, _ = coords
                pyautogui.moveTo(center_x, center_y, duration=0.5)
                pyautogui.click()
                break
            else:
                time.sleep(0.5)
        else:
            print("Element not found; could not perform click.")

    def detect_and_write(self, template_path, text_to_write, press_enter=False, timeout=10):
        """Detects an element and writes text at the detected position, with an optional Enter key press."""
        start_time = time.time()

        while time.time() - start_time < timeout:
            coords = get_element_coordinates(template_path) 
            if coords:
                center_x, center_y, _, _ = coords
                pyautogui.moveTo(center_x, center_y, duration=0.5)
                pyautogui.click()
                pyautogui.write(text_to_write)
                if press_enter:
                    pyautogui.press("enter")
                break
            else:
                time.sleep(0.5) 

    def detect_and_read(self, template_path, wait_for_element=False, wait_time=10):
        """Detects an element and extracts text from that region."""
        if wait_for_element:
            self.detect_and_wait(template_path, timeout=wait_time)

        result = self.cache_manager.detect_element_with_cache(template_path)  
        if result:
            center_x, center_y, width, height = result
            x = center_x - width // 2
            y = center_y - height // 2
            region = (x, y, width, height)
            pyautogui.moveTo(center_x, center_y, duration=0.5)
            text = extract_text(region=region)

            print(f"Extracted Text: {text}")
            return text
        else:
            print("Element not found; could not extract text.")
            return None

    def detect_and_wait(self, template_path, timeout=10):
        """
        Continuously checks for the presence of the element on the screen until the timeout is reached.
        This version does not use caching for element detection.
        
        Parameters:
        - template_path (str): Path to the template image of the element.
        - timeout (int): Maximum time to wait for the element, in seconds.
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            coords = get_element_coordinates(template_path)  
            if coords:
                print(f"Element detected at: {coords}")
                return coords  
            else:
                time.sleep(0.5)  

        print(f"Element '{template_path}' not found within {timeout} seconds.")
        return None
