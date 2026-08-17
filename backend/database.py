import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, AnalysisHistory
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    
    database = client.safespeak
    
    await init_beanie(database=database, document_models=[User, AnalysisHistory])
    print("MongoDB Atlas connection established successfully.")


    