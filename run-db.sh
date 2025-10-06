#!/bin/bash

CONTAINER_NAME="my-timeseries-mongodb"
MONGO_PORT="27017"
MONGO_IMAGE="mongo:latest"
MONGO_DATA_VOLUME="timeseries_mongo_data"


check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Error: Docker is not running or not accessible."
        echo "Please start Docker Desktop or ensure the Docker daemon is running."
        exit 1
    fi
}

start_mongo() {
    echo "--- Starting MongoDB Docker Container ---"
    check_docker

    echo "Checking for existing container '$CONTAINER_NAME'..."
    local container_exists=$(docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}")

    if [ "$container_exists" == "$CONTAINER_NAME" ]; then
        local container_status=$(docker inspect -f '{{.State.Status}}' $CONTAINER_NAME 2>/dev/null)
        if [ "$container_status" == "running" ]; then
            echo "Container '$CONTAINER_NAME' is already running."
        elif [ "$container_status" == "exited" ]; then
            echo "Container '$CONTAINER_NAME' found but is stopped. Starting it..."
            docker start $CONTAINER_NAME
            if [ $? -eq 0 ]; then
                echo "Container '$CONTAINER_NAME' started successfully."
            else
                echo "Failed to start container '$CONTAINER_NAME'."
                exit 1
            fi
        else
            echo "Container '$CONTAINER_NAME' found in an unexpected state '$container_status'. Attempting to restart."
            docker stop $CONTAINER_NAME > /dev/null 2>&1
            docker rm $CONTAINER_NAME > /dev/null 2>&1
            echo "Removed previous container instance. Proceeding to create a new one."
            create_and_run_mongo
        fi
    else
        echo "Container '$CONTAINER_NAME' not found. Creating and starting a new one."
        create_and_run_mongo
    fi

    echo "MongoDB is accessible on port $MONGO_PORT."
    echo "To stop:     ./run_mongo.sh stop"
    echo "To remove:   ./run_mongo.sh remove (deletes container and ALL data!)"
    echo "To connect:  mongosh --port $MONGO_PORT (if mongosh is installed locally)"
    echo "             docker exec -it $CONTAINER_NAME mongosh"
}

create_and_run_mongo() {
    echo "Pulling '$MONGO_IMAGE' image if not already present..."
    docker pull $MONGO_IMAGE || { echo "Failed to pull Docker image. Aborting."; exit 1; }

    echo "Creating and starting MongoDB container '$CONTAINER_NAME' with data volume '$MONGO_DATA_VOLUME'..."
    docker run \
        --name $CONTAINER_NAME \
        -p $MONGO_PORT:$MONGO_PORT \
        -v $MONGO_DATA_VOLUME:/data/db \
        -d $MONGO_IMAGE \
        --replSet rs0 --bind_ip_all # --replSet is good for many dev features (e.g., transactions). --bind_ip_all allows connections from other Docker services or host.

    if [ $? -eq 0 ]; then
        echo "MongoDB container '$CONTAINER_NAME' created and started successfully."
        echo "Giving MongoDB a moment to initialize before replica set configuration..."
        sleep 5 

        echo "Initializing replica set 'rs0'..."

        sleep 15 # Give MongoDB some time to fully initialize
        # MONGO_HOSTNAME=$(docker exec $CONTAINER_NAME hostname)
        docker exec -i $CONTAINER_NAME mongosh --eval "rs.initiate({ _id: \"rs0\", members: [ { _id: 0, host: \"localhost:$MONGO_PORT\" } ] })"

        if [ $? -eq 0 ]; then
            echo "Replica set 'rs0' initialized successfully."
        else
            echo "Warning: Failed to initialize replica set. This might be normal if already initialized or due to timing."
            echo "You can try initializing manually: 'docker exec -it $CONTAINER_NAME mongosh' then 'rs.initiate()'"
        fi
    else
        echo "Failed to create or start MongoDB container '$CONTAINER_NAME'."
        exit 1
    fi
}

stop_mongo() {
    echo "--- Stopping MongoDB Docker Container ---"
    check_docker
    if docker stop $CONTAINER_NAME > /dev/null 2>&1; then
        echo "MongoDB container '$CONTAINER_NAME' stopped."
    else
        echo "MongoDB container '$CONTAINER_NAME' not found or already stopped."
    fi
}

remove_mongo() {
    echo "--- Removing MongoDB Docker Container and Data ---"
    check_docker

    if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q $CONTAINER_NAME; then
        echo "Stopping container '$CONTAINER_NAME' before removal..."
        docker stop $CONTAINER_NAME > /dev/null 2>&1
    fi

    echo "Removing container '$CONTAINER_NAME'..."
    if docker rm $CONTAINER_NAME > /dev/null 2>&1; then
        echo "Container '$CONTAINER_NAME' removed."
    else
        echo "Container '$CONTAINER_NAME' not found or could not be removed."
    fi

    echo "Removing Docker volume '$MONGO_DATA_VOLUME' (this will delete all MongoDB data for this instance!)..."
    if docker volume rm $MONGO_DATA_VOLUME > /dev/null 2>&1; then
        echo "Volume '$MONGO_DATA_VOLUME' removed (MongoDB data deleted)."
    else
        echo "Volume '$MONGO_DATA_VOLUME' not found or could not be removed."
        echo "If you wish to delete it manually, run: 'docker volume rm $MONGO_DATA_VOLUME'"
    fi
    echo "Cleanup complete."
}

case "$1" in
    start)
        start_mongo
        ;;
    stop)
        stop_mongo
        ;;
    remove)
        remove_mongo
        ;;
    *)
        echo "Usage: ./run_mongo.sh {start|stop|remove}"
        echo "  start  - Start MongoDB in a Docker container (or restart if stopped)."
        echo "  stop   - Stop the running MongoDB Docker container."
        echo "  remove - Stop and remove the MongoDB Docker container AND its persistent data volume."
        exit 1
        ;;
esac