FROM python:3.11-slim

WORKDIR /app

COPY ml_services/requirements.txt .
RUN pip install -r requirements.txt

COPY ml_services/ .

CMD uvicorn app:app --host 0.0.0.0 --port $PORT