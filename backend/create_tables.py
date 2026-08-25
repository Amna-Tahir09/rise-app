from db import Base, engine
import models  # this import matters — it registers all 4 tables

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")