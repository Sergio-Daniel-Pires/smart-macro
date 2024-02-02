from typing import Literal, Self

class Incremental:
    times: int

    def __init__ (self):
        self.times = 1

    def increment (self):
        self.times += 1

class KeyStroke (Incremental):
    button: str
    times: int

    def __init__(self, button: str) -> None:
        super().__init__()
        self.button = button

    def __eq__(self, __value: object) -> bool:
        if not isinstance(__value, type(self)):
            return False

        if self.button == __value.button:
            return True

        return False

class Click (Incremental):
    x: int
    y: int
    button: str

    def __init__(self, x: int, y: int, button: str) -> None:
        super().__init__()

        self.x = x
        self.y = y
        self.button = button

    def __eq__ (self, __value: object) -> bool:
        if not isinstance(__value, type(self)):
            return False

        if self.x == __value.x and self.y == self.y and self.button == __value.button:
            return True

        return False

class Scroll (Incremental):
    x: int
    y: int
    direction: Literal["UP", "DOWN"]

    def __init__ (self, x: int , y: int, dx: int) -> None:
        super().__init__()
        self.x = x
        self.y = y
        self.direction = self.get_direction(dx)
        self.times = 1

    @classmethod
    def get_direction (cls, dx: int) -> str:
        if dx == -1:
            return "DOWN"

        elif dx == 1:
            return "UP"

    def __eq__ (self, __value: object) -> bool:
        if not isinstance(__value, type(self)):
            return False

        if self.direction == __value.direction:
            return True

        return False

class Groupable:
    group_type: KeyStroke | Click | Scroll
    items: list[KeyStroke | Click | Scroll]

    def __init__(self, new_obj: KeyStroke | Click | Scroll) -> None:
        self.items = []
        self.add_new(new_obj)
        self.group_type = type(new_obj)

    def add_new (self, new_obj: KeyStroke | Click | Scroll):
        if len(self.items) and self.items[-1] == new_obj:
            self.items[-1].increment()

        else:
            self.items.append(new_obj)

# class KeyboardStroke (Groupable):
#     def __init__ (self) -> None:
#         super().__init__()

# class MouseClick (Groupable):
#     clicks: list[Click]

#     def __init__(self) -> None:
#         self.clicks = []

# class MouseScroll (Groupable):
#     scrolls: list[Scroll]
