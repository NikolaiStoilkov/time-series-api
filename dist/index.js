import express from 'express';
import { DatabaseService } from './services/database-service.js';
import { TimeSeriesRepository } from './repositories/timeseries-repository.js';
process.on('uncaughtException', (err) => {
    console.error('Unhandled exception:', err);
    process.exit(1);
});
const app = express();
const port = 3000;
const mongoUri = 'mongodb://localhost:27017/timeseriesdb?replicaSet=rs0&directConnection=true';
const databaseService = new DatabaseService(mongoUri);
const timeSeriesRepository = new TimeSeriesRepository(databaseService);
databaseService.connect()
    .then(() => {
    console.log('Connected to MongoDB');
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
    app.get('/test', (req, res) => {
        res.json({ message: 'Hello World!' });
    });
    app.post('/post', (req, res) => {
        res.send("Data arrived");
    });
    app.post('/timeseries', async (req, res) => {
        try {
            const newTimeSeries = await timeSeriesRepository.createTimeSeries(req.body);
            res.status(201).json(newTimeSeries);
        }
        catch (error) {
            console.error('Error creating time series:', error);
            res.status(500).json({ error: 'Failed to create time series.' });
        }
    });
    app.get('/timeseries', async (req, res) => {
        try {
            const { name, tags } = req.query;
            let filter = {};
            if (name) {
                filter.name = name;
            }
            if (tags) {
                filter.tags = { $in: tags.split(',') };
            }
            const timeSeries = await timeSeriesRepository.getAllTimeSeries(filter);
            res.json(timeSeries);
        }
        catch (error) {
            console.error('Error fetching time series:', error);
            res.status(500).json({ error: 'Failed to fetch time series.' });
        }
    });
    app.get('/timeseries/:id', async (req, res) => {
        try {
            const timeSeries = await timeSeriesRepository.getTimeSeriesById(req.params.id);
            if (!timeSeries) {
                return res.status(404).json({ error: 'Time series not found.' });
            }
            res.json(timeSeries);
        }
        catch (error) {
            console.error('Error fetching time series by ID:', error);
            res.status(500).json({ error: 'Failed to fetch time series.' });
        }
    });
    app.delete('/timeseries/:id', async (req, res) => {
        try {
            const result = await timeSeriesRepository.deleteTimeSeries(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Time series not found.' });
            }
            res.status(204).send(); // No Content
        }
        catch (error) {
            console.error('Error deleting time series:', error);
            res.status(500).json({ error: 'Failed to delete time series.' });
        }
    });
    app.post('/timeseries/:id/data', async (req, res) => {
        try {
            const timeSeries = await timeSeriesRepository.addDataPoint(req.params.id, req.body);
            if (!timeSeries) {
                return res.status(404).json({ error: 'Time series not found.' });
            }
            res.status(201).json(timeSeries);
        }
        catch (error) {
            console.error('Error adding data point:', error);
            res.status(500).json({ error: 'Failed to add data point.', details: error.message });
        }
    });
    app.get('/timeseries/:id/data', async (req, res) => {
        try {
            const timeSeries = await timeSeriesRepository.getTimeSeriesById(req.params.id);
            if (!timeSeries) {
                return res.status(404).json({ error: 'Time series not found.' });
            }
            res.json(timeSeries.data_points);
        }
        catch (error) {
            console.error('Error fetching data points:', error);
            res.status(500).json({ error: 'Failed to fetch data points.' });
        }
    });
    app.get('/timeseries/:id/data/:dataPointId', async (req, res) => {
        try {
            const timeSeries = await timeSeriesRepository.getTimeSeriesById(req.params.id);
            if (!timeSeries) {
                return res.status(404).json({ error: 'Time series not found.' });
            }
            const dataPoint = timeSeries.data_points.id(req.params.dataPointId);
            if (!dataPoint) {
                return res.status(404).json({ error: 'Data point not found.' });
            }
            res.json(dataPoint);
        }
        catch (error) {
            console.error('Error fetching data point by ID:', error);
            res.status(500).json({ error: 'Failed to fetch data point.' });
        }
    });
    app.patch('/timeseries/:id/data/:dataPointId', async (req, res) => {
        try {
            const updatedDataPoint = await timeSeriesRepository.updateDataPoint(req.params.id, req.params.dataPointId, req.body);
            if (!updatedDataPoint) {
                return res.status(404).json({ error: 'Time series or data point not found.' });
            }
            res.json(updatedDataPoint);
        }
        catch (error) {
            console.error('Error updating data point:', error);
            res.status(500).json({ error: 'Failed to update data point.', details: error.message });
        }
    });
    app.delete('/timeseries/:id/data/:dataPointId', async (req, res) => {
        try {
            const deleted = await timeSeriesRepository.deleteDataPoint(req.params.id, req.params.dataPointId);
            if (!deleted) {
                return res.status(404).json({ error: 'Time series or data point not found.' });
            }
            res.status(204).send(); // No Content
        }
        catch (error) {
            console.error('Error deleting data point:', error);
            res.status(500).json({ error: 'Failed to delete data point.' });
        }
    });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((err) => console.error('Could not connect to MongoDB:', err));
//# sourceMappingURL=index.js.map