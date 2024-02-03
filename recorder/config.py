import json

with open("config.json") as config_file:
    config = json.load(config_file)

TOGGLE_RECORD = config["toggle_record"].lower()
RECORD_MOUSE = config["record_mouse"].lower()
RECORD_KEYBOARD = config["record_keyboard"].lower()
SECONDS_RECORD = config["gif_record_seconds"]