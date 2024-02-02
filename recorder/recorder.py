from pynput import mouse, keyboard
import pyautogui
import logging

from models import KeyStroke, Click, Scroll, Groupable

logger = logging.getLogger("PYMACRO")

START, END = range(2)


class RecordMacro:
    s_height: int
    s_width: int

    is_recording: bool

    macro: list[int | Groupable]

    def __init__ (self):
        self.s_width, self.s_height = pyautogui.size()
        self.is_recording = False

        self.macro = [ START ]

    def add_new (self, new_obj: KeyStroke | Click | Scroll) -> None:
        if len(self.macro) == 1 or not isinstance(new_obj, self.macro[-1].group_type):
            self.macro.append(Groupable(new_obj))

        else:
            self.macro[-1].add_new(new_obj)

    def on_click (self, x: int, y: int, button, pressed):
        if pressed:
            print(button)
            self.add_new(Click(x, y, button))

    def on_scroll (self, x: int, y: int, dx: int, dy):
        self.add_new(Scroll(x, y, dx))

    def on_press (self, key: keyboard.Key | keyboard._win32.KeyCode):
        try:
            print(key.char)
            new_key = KeyStroke(key.char)

        except AttributeError:
            print(key)
            new_key = KeyStroke(key)

        self.add_new(new_key)

    def on_release (self, key):
        print(key)
        if key == keyboard.Key.esc:
            # Stop listener
            raise KeyboardInterrupt
            return False

    def export (self):
        print([str(x) for x in self.macro])

    def start (self):
        # Collect events until released
        with (
            keyboard.Listener(
                on_release=self.on_release, on_press=self.on_press
            ) as k_listener,
            mouse.Listener(
                on_click=self.on_click, on_scroll=self.on_scroll
            ) as m_listener
        ):
                k_listener.join()
                m_listener.join()

macro = RecordMacro()
macro.start()
print(macro.export())