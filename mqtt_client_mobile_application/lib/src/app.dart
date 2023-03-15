import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client_mobile_application/src/geolocator/geolocator.dart';
import 'package:mqtt_client_mobile_application/src/mqtt/mqtt_configuration.dart';
import 'package:uuid/uuid.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final _uuid = const Uuid();
  late String id;
  int _counter = 0;
  Position? _currentPosition;
  MQTTClientManager mqttClientManager = MQTTClientManager();
  final String pubTopic = "coords";

  @override
  void initState() {
    id = _uuid.v1();
    setupMqttClient();
    setupUpdatesListener();
    super.initState();
  }

  void _incrementCounter() async {
    _currentPosition = await determinePosition();
    if (_currentPosition == null) {
      return;
    }
    final coords = <String, dynamic>{
      "id": id,
      "lat": _currentPosition!.latitude,
      "long": _currentPosition!.longitude
    };
    setState(() {
      mqttClientManager.publishMessage(pubTopic, coords.toString());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          children: [
            Flexible(
              flex: 3,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  const Text(
                    'You have pushed the button this many times:',
                  ),
                  Text(
                    '${_currentPosition?.latitude} - ${_currentPosition?.longitude}',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }

  Future<void> setupMqttClient() async {
    await mqttClientManager.connect();
    mqttClientManager.subscribe(pubTopic);
  }

  void setupUpdatesListener() {
    mqttClientManager
        .getMessagesStream()!
        .listen((List<MqttReceivedMessage<MqttMessage?>>? c) {
      final recMess = c![0].payload as MqttPublishMessage;
      final pt =
          MqttPublishPayload.bytesToStringAsString(recMess.payload.message);
      print('MQTTClient::Message received on topic: <${c[0].topic}> is $pt\n');
    });
  }

  @override
  void dispose() {
    mqttClientManager.disconnect();
    super.dispose();
  }
}
