import paho.mqtt.client as mqtt 
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
import time
from random import uniform, randint
import json
broker_hostname = "mqtt.interceptly.xyz"
port = 8883 

def on_connect(client, userdata, flags, return_code):
    if return_code == 0:
        print("connected")
    else:
        print("could not connect, return code:", return_code)

client = mqtt.Client("Client1")
client.tls_set()
client.username_pw_set(username="antonio", password="password") # uncomment if you use password auth
client.on_connect=on_connect

client.connect(broker_hostname, port)
client.loop_start()

topic = "coords"
msg_count = 0

try:
    while msg_count < 200:
        time.sleep(1)
        id = randint(1,10) # change 10 with any value such that you get max X pins on the map
        lat = uniform(-85,85)
        long = uniform(-180,180)
        msg_count += 1
        result = client.publish(topic, json.dumps({"lat": lat, "long": long, "id": id}))
        status = result[0]
        if status == 0:
            print("Message "+ json.dumps({"lat": lat, "long": long, "id": id}) + " is published to topic " + topic)
        else:
            print("Failed to send message to topic " + topic)
finally:
    client.loop_stop()