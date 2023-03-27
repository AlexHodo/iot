import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Container, Typography } from "@mui/material";
import L from "leaflet";
import * as mqtt from "mqtt";
import "./App.css";
const icon = new L.Icon({
  iconUrl: "/marker.svg",
  iconSize: [64, 64],
});

const Map = (props) => {
  const [points, setPoints] = React.useState([]);

  const [client, setClient] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const host = "mqtt.interceptly.xyz";
  var options = {
    port: "8883",
    protocol: "mqtt",
    username: "antonio",
    password: "password",
    keepalive: 60,
    clientId: `mqtt_${Math.random().toString(16)}`,
    rejectUnauthorized: false
  };

  React.useEffect(() => {
    setStatus("Connecting...");
    setClient(mqtt.connect("wss://mqtt.interceptly.xyz", {
      port: 8083,
      username: "antonio",
      password: "password",
      protocol: "wss",
      clientId: `mqtt_${Math.random().toString(16)}`,
      rejectUnauthorized: false,
    }));
    // TODO: Asa poti seta punctele:
    setPoints([
      {
        lat: 0,
        lon: 0, // lon nu long!
        id: 1,
      },
      {
        lat: Math.random() * 90 * (Math.random() < 0.5 ? -1 : 1),
        lon: Math.random() * 90 * (Math.random() < 0.5 ? -1 : 1),
        id: 2,
      },
      {
        lat: Math.random() * 90 * (Math.random() < 0.5 ? -1 : 1),
        lon: Math.random() * 90 * (Math.random() < 0.5 ? -1 : 1),
        id: 3,
      },
    ]);
  }, []);

  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription;
      console.log(`Subscribing to topic ${topic} with qos = ${qos}...`);
      client.subscribe(topic, { qos: qos }, (error, granted) => {
        if (error) {
          console.log("Subscribe to topic error", error);
        } else {
          // TODO: Aici poti apela setPoints(...)
          console.log("Subscribed to topic", granted);
        }
      });
    }
  };

  React.useEffect(() => {
    console.log(client);
    if (client) {
      // TODO
      // E mereu false!!!
      console.log(client.connected);
      client.on("connect", () => {
        setStatus("Connected");
      });
      client.on("error", (err) => {
        setStatus(`Connection error: ${err}`);
        client.end();
      });
      client.on("reconnect", () => {
        setStatus("Reconnecting...");
      });
      client.on("message", (topic, message) => {
        console.log("Message received");
        const payload = { topic, message: message.toString() };
        console.log(payload);
      });
      mqttSub({ topic: "coords", qos: 1 });
    }
  }, [client]);

  return (
    <>
      <Box
        sx={{
          height: 32,
          display: "flex",
          alignItems: "center",
          backgroundColor: "#FF6347",
          color: "white",
        }}
      >
        <Container>
          <Typography variant="body2">
            Status:{" "}
            <Typography component="span" sx={{ fontFamily: "monospace" }}>
              {status}
            </Typography>
          </Typography>
        </Container>
      </Box>
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={`&copy; ${new Date().getFullYear()} <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.`}
          className="map-tiles"
        />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lon]}
            icon={icon}
          />
        ))}
      </MapContainer>
    </>
  );
};

function App() {
  return <Map />;
}

export default App;
