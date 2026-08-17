import asyncio
from database import init_db

async def test_connection():
    await init_db()
    print("Test complete: Successfully connected to MongoDB!")

if __name__ == "__main__":
    asyncio.run(test_connection())