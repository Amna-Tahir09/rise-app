from backend.main import app

# Vercel ko `app` export chahiye, isliye yeh line zaroori hai
__all__ = ["app"]