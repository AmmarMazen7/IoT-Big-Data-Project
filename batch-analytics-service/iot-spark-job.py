import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, max, min, count, window, current_timestamp
import os

spark = SparkSession.builder \
    .appName("IoTSensorBatchJob") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongodb:27017/iot_city.raw_sensor_data") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongodb:27017/iot_city.sensor_analytics") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.3.0") \
    .getOrCreate()

df = spark.read.format("mongodb")\
    .option("database", "iot_city")\
    .option("collection", "raw_sensor_data")\
    .load()

print(f"INFO: Number of documents read from raw_sensor_data: {df.count()}", flush=True)

# We want to calculate the overall stats per sensor type and zone
if df.count() > 0:
    # Ensure value is numeric
    df = df.withColumn("numeric_value", col("value").cast("double"))

    agg_df = df.groupBy("type", "zone").agg(
        avg("numeric_value").alias("avg_value"),
        max("numeric_value").alias("max_value"),
        min("numeric_value").alias("min_value"),
        count("*").alias("reading_count")
    )
    
    # Add a timestamp for when this analytics was generated
    agg_df = agg_df.withColumn("computed_at", current_timestamp())

    print(f"INFO: Number of documents in aggregated DataFrame: {agg_df.count()}", flush=True)

    agg_df.write.format("mongodb")\
        .option("database", "iot_city")\
        .option("collection", "sensor_analytics")\
        .mode("overwrite")\
        .save()
else:
    print("INFO: No data found in raw_sensor_data collection. Skipping analytics.", flush=True)

spark.stop()
