import pyautogui
import time

def smooth_move_to(x, y, duration=1):
    """Moves the cursor to (x, y) coordinates smoothly over a given duration."""
    start_x, start_y = pyautogui.position()  # Get current cursor position
    steps = 100  # Number of steps for the movement
    for i in range(steps + 1):
        # Calculate intermediate position
        new_x = start_x + (x - start_x) * (i / steps)
        new_y = start_y + (y - start_y) * (i / steps)
        pyautogui.moveTo(new_x, new_y)
        time.sleep(duration / steps)

def move_cursor_test(x, y):
    """
    Moves the cursor to the specified (x, y) coordinates and clicks.
    """
    print(f"Moving cursor to: ({x}, {y})")
    smooth_move_to(x, y)  # Move smoothly in 1 second
    time.sleep(0.5)  # Small delay
    pyautogui.click()  # Click to confirm movement
    print("Cursor moved and clicked successfully.")

# Example usage:
if __name__ == "__main__":
    move_cursor_test(600, 300)  # Change these coordinates as needed
