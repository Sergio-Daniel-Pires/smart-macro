import json

with open("config.json") as config_file:
    config = json.load(config_file)

RECORD_MOUSE = config["record_mouse"]
RECORD_KEYBOARD = config["record_keyboard"]
SECONDS_RECORD = config["gif_record_seconds"]