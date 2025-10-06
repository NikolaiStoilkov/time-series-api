import express from 'express';
import mongoose from 'mongoose';
import { TimeSeriesModel } from './core/entities/index.js';
import { parseISODate } from './helper/parse-iso-date.js';
process.on('uncaughtException', (err) => {
    console.error('Unhandled exception:', err);
    process.exit(1);
});
const app = express();
const port = 3000;
mongoose.connect('mongodb://localhost:27017/timeseriesdb')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB:', err));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.get('/test', (req, res) => {
    res.json({ message: 'Hello World!' });
});
app.post('/post', async (req, res) => {
    res.send("Data araived");
});
app.post('/timeseries', async (req, res) => {
    const { name, description, frequency, units, tags } = req.body;
    if (!name || !frequency || !units) {
        return res.status(400).json({ error: "Missing required fields: name, frequency, units" });
    }
    try {
        const newTimeSeries = new TimeSeriesModel({
            name,
            description,
            frequency,
            units,
            tags: tags || [],
            data_points: []
        });
        await newTimeSeries.save();
        const { _id, __v, data_points, ...metadata } = newTimeSeries.toJSON();
        res.status(201).json({ ...metadata, message: "Time series created successfully." });
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ error: "Time series with this ID already exists." });
        }
        console.error("Error creating time series:", error);
        res.status(500).json({ error: "Failed to create time series." });
    }
});
app.get('/timeseries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const timeSeries = await TimeSeriesModel.findOne({ id: id }).select('-data_points');
        if (!timeSeries) {
            return res.status(404).json({ error: "Time series not found." });
        }
        const { _id, __v, ...metadata } = timeSeries.toJSON();
        res.status(200).json(metadata);
    }
    catch (error) {
        console.error("Error getting time series metadata:", error);
        res.status(500).json({ error: "Failed to retrieve time series metadata." });
    }
});
app.put('/timeseries/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedTimeSeries = await TimeSeriesModel.findOneAndUpdate({ id: id }, { $set: updates }, // Use $set to update specific fields
        { new: true, runValidators: true }).select('-data_points');
        if (!updatedTimeSeries) {
            return res.status(404).json({ error: "Time series not found." });
        }
        const { _id, __v, ...metadata } = updatedTimeSeries.toJSON();
        res.status(200).json(metadata);
    }
    catch (error) {
        console.error("Error updating time series metadata:", error);
        res.status(500).json({ error: "Failed to update time series metadata." });
    }
});
app.delete('/timeseries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Delete by our custom `id` field
        const result = await TimeSeriesModel.deleteOne({ id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Time series not found." });
        }
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        console.error("Error deleting time series:", error);
        res.status(500).json({ error: "Failed to delete time series." });
    }
});
app.post('/timeseries/:id/data', async (req, res) => {
    const { id } = req.params;
    const incomingDataPoints = req.body;
    if (!Array.isArray(incomingDataPoints)) {
        return res.status(400).json({ error: "Request body must be an array of data points." });
    }
    const validPoints = [];
    for (const dp of incomingDataPoints) {
        if (typeof dp.timestamp !== 'string' || typeof dp.value !== 'number') {
            return res.status(400).json({ error: `Invalid data point format: ${JSON.stringify(dp)}. Each data point must have a 'timestamp' (string) and 'value' (number).` });
        }
        const parsedTimestamp = parseISODate(dp.timestamp);
        if (!parsedTimestamp) {
            return res.status(400).json({ error: `Invalid ISO 8601 timestamp format: ${dp.timestamp}` });
        }
        validPoints.push({ timestamp: parsedTimestamp, value: dp.value });
    }
    try {
        const timeSeries = await TimeSeriesModel.findOneAndUpdate({ id: id }, { $push: { data_points: { $each: validPoints } } }, { new: true });
        if (!timeSeries) {
            return res.status(404).json({ error: "Time series not found." });
        }
        res.status(200).json({ message: `${validPoints.length} data points added to ${id}.` });
    }
    catch (error) {
        console.error("Error adding data points:", error);
        res.status(500).json({ error: "Failed to add data points." });
    }
});
app.get('/timeseries/:id/data', async (req, res) => {
    const { id } = req.params;
    const { start_time, end_time, limit, aggregation, interval } = req.query;
    try {
        const timeSeries = await TimeSeriesModel.findOne({ id: id });
        if (!timeSeries) {
            return res.status(404).json({ error: "Time series not found." });
        }
        let filteredData = [...timeSeries.data_points]; // Create a copy of embedded documents
        // Apply time filters in Node.js for embedded documents.
        // For very large embedded arrays, an aggregation pipeline in MongoDB would be more efficient,
        // but it adds complexity. This approach is simpler for demonstration.
        if (start_time) {
            const startDt = parseISODate(start_time);
            if (!startDt)
                return res.status(400).json({ error: "Invalid start_time format." });
            filteredData = filteredData.filter(dp => dp.timestamp >= startDt);
        }
        if (end_time) {
            const endDt = parseISODate(end_time);
            if (!endDt)
                return res.status(400).json({ error: "Invalid end_time format." });
            filteredData = filteredData.filter(dp => dp.timestamp <= endDt);
        }
        filteredData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        if (limit) {
            const numLimit = parseInt(limit);
            if (isNaN(numLimit) || numLimit <= 0) {
                return res.status(400).json({ error: "Invalid limit. Must be a positive integer." });
            }
            filteredData = filteredData.slice(0, numLimit);
        }
        if (aggregation) {
            if (!filteredData.length) {
                return res.status(200).json({ aggregated_value: null, aggregation_type: aggregation, message: "No data points for aggregation." });
            }
            const values = filteredData.map(dp => dp.value);
            let result = null;
            let aggType = aggregation;
            switch (aggregation) {
                case "avg":
                    result = values.reduce((sum, val) => sum + val, 0) / values.length;
                    aggType = "average";
                    break;
                case "min":
                    result = Math.min(...values);
                    aggType = "minimum";
                    break;
                case "max":
                    result = Math.max(...values);
                    aggType = "maximum";
                    break;
                case "sum":
                    result = values.reduce((sum, val) => sum + val, 0);
                    aggType = "sum";
                    break;
                case "count":
                    result = values.length;
                    aggType = "count";
                    break;
                default:
                    return res.status(400).json({ error: `Unsupported aggregation type: ${aggregation}. Supported types: avg, min, max, sum, count.` });
            }
            if (interval) {
                return res.status(200).json({
                    aggregated_value: result,
                    aggregation_type: aggType,
                    message: `Note: Interval-based aggregation with interval '${interval}' is not fully implemented in this conceptual example for embedded data_points. Returning aggregate over the entire filtered range.`,
                    data_points: filteredData.map(dp => ({ timestamp: dp.timestamp.toISOString(), value: dp.value })) // Still return data as ISO string
                });
            }
            return res.status(200).json({ aggregated_value: result, aggregation_type: aggType });
        }
        res.status(200).json({ data_points: filteredData.map(dp => ({ timestamp: dp.timestamp.toISOString(), value: dp.value })) });
    }
    catch (error) {
        console.error("Error retrieving time series data:", error);
        res.status(500).json({ error: "Failed to retrieve time series data." });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map