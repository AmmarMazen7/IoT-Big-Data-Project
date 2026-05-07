# Realtime Gateway Service API Documentation

The **Realtime Gateway Service** acts as the primary data hub for the Smart City IoT Monitor. It provides a hybrid interface combining a standard REST endpoint for health checks and a bidirectional WebSocket (Socket.IO) server for real-time telemetry and analytics.

## 1. Connection Information
- **Base URL:** `http://localhost:5050` (External) / `http://realtime-gateway-service:5000` (Internal Docker)
- **Protocol:** HTTP & WebSocket (Socket.IO v4+)

---

## 2. REST Endpoints

### Health Check
Check if the service and its background workers are operational.
- **Path:** `/healthz`
- **Method:** `GET`
- **Response:** `200 OK` (String: "ok")

---

## 3. WebSocket (Socket.IO) API

### Outbound Events (Server -> Client)
Events pushed by the gateway to the dashboard.

| Event Name | Description | Payload Data Structure |
| :--- | :--- | :--- |
| `status` | Confirmation of successful connection. | `{"msg": "Connected to gateway"}` |
| `initial_analytics` | Full dump of current analytics on connection. | Array of `AnalyticsData` objects |
| `initial_sensors` | Last 50 raw sensor readings for immediate history. | Array of `SensorData` objects |
| `status_counts` | Total counts for database records. | `{"raw_sensors_count": int, "analytics_count": int}` |
| `live_sensor_reading` | **Real-time** raw data consumed from Kafka. | `SensorData` object |
| `analytics_update` | **Real-time** update when Spark analytics change. | `AnalyticsData` object |

### Inbound Events (Client -> Server)
Events the server listens for.

| Event Name | Description |
| :--- | :--- |
| `connect` | Triggers the push of all initial state data (`initial_analytics`, etc.). |
| `disconnect` | Standard cleanup on client disconnect. |

---

## 4. Data Structures

### SensorData (Raw Telemetry)
```json
{
  "sensor_id": "tra-north-1",
  "type": "traffic",
  "zone": "North",
  "value": 85,
  "timestamp": "2024-04-30T14:30:00Z"
}
```

### AnalyticsData (Spark Aggregates)
```json
{
  "type": "traffic",
  "zone": "North",
  "average_value": 72.5,
  "max_value": 120.0,
  "reading_count": 450,
  "last_updated": "2024-04-30T14:00:00Z"
}
```

---

## 5. Architectural Flow
1. **Kafka Stream**: `realtime-gateway-service` subscribes to the `iot-sensors-topic`.
2. **Immediate Push**: Every message received from Kafka is immediately emitted via `live_sensor_reading`.
3. **MongoDB Watch**: The service monitors the `sensor_analytics` collection using MongoDB Change Streams.
4. **Analytics Sync**: Whenever Spark writes new calculated results to MongoDB, the service emits `analytics_update` to keep the charts in sync.
