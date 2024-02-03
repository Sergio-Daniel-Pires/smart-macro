from pynput import mouse, keyboard
import pyautogui
import logging

from models import SpecialKeyStroke, KeyStroke, Click, Scroll, Groupable
from config import TOGGLE_RECORD

logger = logging.getLogger("PYMACRO")
logging.basicConfig(level=logging.DEBUG)

START, END = range(2)


class RecordMacro:
    s_height: int
    s_width: int

    recording: bool

    macro: list[int | Groupable]

    keyboard_listener: keyboard.Listener
    mouse_listener: mouse.Listener

    def __init__ (self):
        self.s_width, self.s_height = pyautogui.size()
        self.recording = True

        self.macro = [ START ]

        self.keyboard_listener = keyboard.Listener(
            on_release=self.on_release, on_press=self.on_press
        )
        self.mouse_listener = mouse.Listener(
            on_click=self.on_click, on_scroll=self.on_scroll
        )

    def add_new (self, new_obj: KeyStroke | SpecialKeyStroke | Click | Scroll) -> bool:
        if not self.recording:
            return False

        if len(self.macro) == 1 or not type(new_obj) == self.macro[-1].group_type:
            self.macro.append(Groupable(new_obj))

        else:
            self.macro[-1].add_new(new_obj)

        return True

    def on_click (self, x: int, y: int, button, pressed):
        if pressed:
            self.add_new(Click(x, y, button))

    def on_scroll (self, x: int, y: int, dx: int, dy):
        self.add_new(Scroll(x, y, dx))

    def on_press (self, key: keyboard.Key | keyboard._win32.KeyCode):
        # Reserved keys
        try:
            new_key = KeyStroke(str(key.char))

        except AttributeError:
            new_key = SpecialKeyStroke(key)

        if new_key.button == TOGGLE_RECORD:
            self.toggle_record()

        self.add_new(new_key)

    def on_release (self, key):
        if key == keyboard.Key.esc:
            self.mouse_listener.stop()
            return False

    def toggle_record (self):
        self.recording = not self.recording
        logger.error(
            f"Gravacao de macro: {'LIGADA' if self.recording else 'DESLIGADA'}"
        )

    def export (self):
        for idx, step in enumerate(self.macro):
            print(f"{idx}. {str(step)}")

    def start (self):
        # Collect events until released
        with self.keyboard_listener as k_listener, self.mouse_listener as m_listener:
            k_listener.join()
            m_listener.join()

        # Remove last "ESC"
        last_input = self.macro[-1]
        if isinstance(last_input, Groupable):
            last_input = last_input.items

            if len(last_input) == 1:
                del self.macro[-1]

            else:
                del last_input[-1]

        self.macro.append(END)

def main (args: list[str] = None):
    macro = RecordMacro()
    macro.start()
    print(macro.export())

if __name__ == "__main__":
    main()