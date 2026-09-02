from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Rise Backend Alive!",
    "greetings": "Hellooooo Feelaaz!"}
    