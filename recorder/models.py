from typing import Literal, Self

class Incremental:
    times: int

    def __init__ (self):
        self.times = 1

    def increment (self):
        self.times += 1

class KeyStroke (Incremental):
    button: str

    def __init__ (self, button: str) -> None:
        super().__init__()
        self.button = button

    def __eq__ (self, __value: object) -> bool:
        if not isinstance(__value, type(self)):
            return False

        if self.button == __value.button:
            return True

        return False

    def __str__ (self):
        return f"'{self.button}'"

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

    def __str__ (self):
        return f"'{self.button}' ({self.x}, {self.y}) {self.times}x"

class Scroll (Incremental):
    x: int
    y: int
    direction: Literal["UP", "DOWN"]

    def __init__ (self, x: int , y: int, dx: int) -> None:
        super().__init__()
        self.x = x
        self.y = y
        self.direction = self.get_direction(dx)

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

    def __str__ (self):
        return f"SCROLL {self.direction} ({self.x}, {self.y}) {self.times}x"

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

    def __str__(self) -> str:
        return f"{self.group_type}: {', '.join(str(item) for item in self.items)}"

# class KeyboardStroke (Groupable):
#     def __init__ (self) -> None:
#         super().__init__()

# class MouseClick (Groupable):
#     clicks: list[Click]

#     def __init__(self) -> None:
#         self.clicks = []

# class MouseScroll (Groupable):
#     scrolls: list[Scroll]
