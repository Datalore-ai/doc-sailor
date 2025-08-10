from redis.commands.json.path import Path
from redis import Redis, StrictRedis
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Redis connection
redis_instance = StrictRedis(host="redis", port=6379, password=os.getenv("REDIS_PASSWORD"), decode_responses=True)

TTL_SECONDS = 60*60

def store_json(key: str, json_data: dict):
    """
    Store JSON data in Redis with a TTL (time to live).
    
    Args:
        key (str): The Redis key under which to store the JSON data.
        json_data (dict): The JSON data to store.
        ttl_seconds (int): Time to live in seconds for the key.
    
    Returns:
        dict: Confirmation message.
    """

    try:
        redis_instance.json().set(key, Path.root_path(), json_data)
    except Exception as e:
        print(e)

    redis_instance.expire(key, TTL_SECONDS)  # Set the TTL for the key
    return {"message": f"JSON data stored at key '{key}' with TTL of {TTL_SECONDS} seconds."}

def fetch_json(key: str):
    """
    Fetch JSON data from Redis.

    Args:
        key (str): The Redis key from which to retrieve the data.

    Returns:
        dict: Retrieved data or an error message if the key does not exist.
    """
    if not redis_instance.exists(key):  # Check if the key exists
        return {"error": f"Key '{key}' does not exist or has expired."}
    data = redis_instance.json().get(key)
    return {"key": key, "data": data}
