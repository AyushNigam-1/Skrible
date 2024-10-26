import numpy as np
import cv2
import pyautogui
import pytesseract
from mss import mss
import time
# Configure Tesseract path (Windows-specific)
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"  # Change for your system

def capture_screen():
    """Takes a screenshot and returns it as an OpenCV image."""
    with mss() as sct:
        screenshot = sct.grab(sct.monitors[1]) 
        screenshot = np.array(screenshot)
        return cv2.cvtColor(screenshot, cv2.COLOR_RGB2BGR)

def get_element_coordinates(template_path, threshold=0.8):
    """
    Detects an element on the screen using template matching.
    Returns the center coordinates and dimensions of the element if found.
    """
    template = cv2.imread(template_path, 0)
    if template is None:
        raise FileNotFoundError(f"Template image not found: {template_path}")

    screen = capture_screen()
    gray_screen = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)

    result = cv2.matchTemplate(gray_screen, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)

    if max_val >= threshold:
        print(f"Element found at: {max_loc}")
        template_height, template_width = template.shape
        center_x = max_loc[0] + template_width // 2
        center_y = max_loc[1] + template_height // 2
        return (center_x, center_y, template_width, template_height)
    else:
        print("Element not found.")
        return False


def extract_text(region=None):
    """
    Extracts text from a specified region of the screen using Tesseract OCR.
    :param region: A tuple (x, y, width, height) specifying the region to capture.
                   If None, captures the entire screen.
    :return: Extracted text from the region.
    """
    if region:
        screenshot = pyautogui.screenshot(region=region)
    else:
        screenshot = pyautogui.screenshot()

    screenshot = np.array(screenshot)
    screenshot = cv2.cvtColor(screenshot, cv2.COLOR_RGB2BGR)

    text = pytesseract.image_to_string(screenshot)
    print(f"Extracted Text: {text}")
    return text

def find_text_coordinates(search_text):
    screenshot = capture_screen()
    img = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

    data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT)
    for i, word in enumerate(data['text']):
        if search_text.lower() in word.lower():
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            return (x, y, w, h)

    print(f"'{search_text}' not found in the image.")
    return None


