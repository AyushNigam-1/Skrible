import pyautogui
import keyboard
import time
import os

def open_application(app_path):
    """Launches an application."""
    os.startfile(app_path)

def type_text(text):
    """Types text using the keyboard."""
    pyautogui.write(text, interval=0.1)

def move_cursor(x, y):
    """Moves the cursor to the specified coordinates."""
    pyautogui.moveTo(x, y, duration=0.5)

def click():
    """Clicks the current mouse position."""
    pyautogui.click()

def take_screenshot(filename="screenshot.png"):
    """Takes a screenshot and saves it."""
    pyautogui.screenshot(filename)

def press_key(key):
    """Presses a specified key."""
    keyboard.press_and_release(key)
