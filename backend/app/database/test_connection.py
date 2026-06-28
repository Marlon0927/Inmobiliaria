from connection import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM Cliente"))

    print("Conexión exitosa")
    print(result.fetchone())