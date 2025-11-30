# cuda-lab-back-testing/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema (opcional pero recomendado para evitar problemas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
