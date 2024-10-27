import numpy as np
import cv2
import pyautogui
import pytesseract
from mss import mss
import os
import random
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"  

def capture_screen():
    """Takes a screenshot and returns it as an OpenCV image."""
    with mss() as sct:
        screenshot = sct.grab(sct.monitors[1]) 
        screenshot = np.array(screenshot)
        return cv2.cvtColor(screenshot, cv2.COLOR_RGB2BGR)
    
def save_masked_image(image, filename):
    """Saves the masked image inside the 'masked' folder."""
    folder = "masked"
    os.makedirs(folder, exist_ok=True)  
    filepath = os.path.join(folder, f'{filename}')
    cv2.imwrite(filepath, image)
    print(f"Saved masked image: {filepath}")
    
def remove_text_regions(image, filename):
    """Detect and mask text regions in the image using improved detection techniques."""
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((5, 5), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.ones_like(image) * 255  

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(mask, (x, y), (x + w, y + h), (255, 255, 255), -1)

    masked_image = cv2.bitwise_and(image, mask)
    save_masked_image(masked_image, filename)
    return masked_image

def get_element_coordinates(template_path, threshold=0.8, mask_text=False):
    """
    Detects an element using template matching.
    Returns the center coordinates and dimensions if found.
    """
    template = cv2.imread(template_path)
    if template is None:
        raise FileNotFoundError(f"Template image not found: {template_path}")

    
    if mask_text:
        print("removing")
        template = remove_text_regions(template, f"template_masked-{str(random.randint(1,40))}.png")

    screen = capture_screen()
    if mask_text:
        print("removing")
        screen = remove_text_regions(screen, f"screenshot_masked-{str(random.randint(1,40))}.png")

    gray_template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
    gray_screen = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)

    result = cv2.matchTemplate(gray_screen, gray_template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)
    print(f"Template match value: {max_val}")

    if max_val >= threshold:
        print(f"Element found at: {max_loc}")
        template_height, template_width = gray_template.shape
        center_x = max_loc[0] + template_width // 2
        center_y = max_loc[1] + template_height // 2
        return (center_x, center_y, template_width, template_height)
    else:
        
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
    """Find the coordinates and center of a given text on the screen."""
    screenshot = capture_screen()
    gray = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT)
    for i, word in enumerate(data['text']):
        if search_text.lower() in word.lower():
            x, y, w, h = (data['left'][i], data['top'][i], 
                          data['width'][i], data['height'][i])
            
            center_x = x + w // 2
            center_y = y + h // 2
            print(f"Found '{search_text}' at: (x: {x}, y: {y}, w: {w}, h: {h}), Center: ({center_x}, {center_y})")
            return (center_x, center_y, w, h)

    print(f"'{search_text}' not found in the image.")
    return None



