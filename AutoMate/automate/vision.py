import numpy as np
import cv2
import pyautogui

def capture_screen():
    """Takes a screenshot and returns it as an OpenCV image."""
    screenshot = pyautogui.screenshot()
    screenshot = np.array(screenshot)    
    return cv2.cvtColor(screenshot, cv2.COLOR_RGB2BGR)

def detect_search_bar(template_path):
    """Detects the search bar on the screen using template matching and moves the cursor to the center of it."""
    template = cv2.imread(template_path, 0)
    screen = capture_screen()  
    gray_screen = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)
    result = cv2.matchTemplate(gray_screen, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)
    threshold = 0.8  
    if max_val >= threshold:
        print(f"Search bar found at: {max_loc}")
        template_height, template_width = template.shape
        center_x = max_loc[0] + template_width // 2
        center_y = max_loc[1] + template_height // 2
        pyautogui.moveTo(center_x, center_y, duration=0.5)
        pyautogui.click()
        pyautogui.write("Contact Me for AI automation")
        return (center_x, center_y)  
    else:
        print("Search bar not found.")
        return None