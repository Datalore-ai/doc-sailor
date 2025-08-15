FROM python:3.11-slim-bullseye

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install crawl4ai
ENV PATH="$PATH:/root/.local/bin"
RUN crawl4ai-setup
RUN playwright install --with-deps

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
