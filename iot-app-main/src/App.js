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
  const [points, setPoints] = React.useState({});

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
    rejectUnauthorized: false,
  };

  React.useEffect(() => {
    setStatus("Connecting...");
    setClient(
      mqtt.connect("wss://mqtt.interceptly.xyz", {
        port: 8083,
        username: "antonio",
        password: "password",
        protocol: "wss",
        clientId: `mqtt_${Math.random().toString(16)}`,
        rejectUnauthorized: false,
      })
    );
  }, []);

  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription;
      console.log(`Subscribing to topic ${topic} with qos = ${qos}...`);
      client.subscribe(topic, (error, granted) => {
        if (error) {
          console.log("Subscribe to topic error", error);
        } else {
          console.log("Subscribed to topic", granted);
        }
      });
    }
  };

  React.useEffect(() => {
    // console.log(client);
    if (client) {
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
        message = JSON.parse(message);
        if (message.id) {
          const pointsCopy = JSON.parse(JSON.stringify(points)); // copy by value
          pointsCopy[`${message.id}`] = message;
          setPoints(pointsCopy);
        }
      });
      mqttSub({ topic: "coords", qos: 1 });
    }
  }, [client, points]);

  console.log(points);

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
        {Object.entries(points).map(([key, point]) => {
          return (
            <Marker
              key={point.id}
              position={[point.lat, point.long]}
              icon={icon}
            />
          );
        })}
      </MapContainer>
    </>
  );
};

function App() {
  return <Map />;
}

export default App;
