import bcrypt
from database.mongodb import users_collection
from datetime import datetime

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))

def create_user(username: str, email: str, password: str):
    if users_collection.find_one({"email": email}):
        return None
    user = {
        "username": username,
        "email": email,
        "password": hash_password(password),
        "created_at": datetime.utcnow(),
        "role": "customer"
    }
    result = users_collection.insert_one(user)
    user["_id"] = str(result.inserted_id)
    return user

def get_user_by_email(email: str):
    return users_collection.find_one({"email": email})