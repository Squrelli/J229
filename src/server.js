const app = require('./app');
const { connectDB } = require('./data/connection');
const { createAdminUser } = require('./services/usersServices');

const PORT = process.env.PORT || 3003;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projekt001';

async function startServer() {
    try {
        await connectDB();
        
        await createAdminUser();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Connected to MongoDB at: ${mongoUri}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();