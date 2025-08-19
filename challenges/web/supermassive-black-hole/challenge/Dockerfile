FROM python:3.11-alpine

WORKDIR /app

RUN adduser user -D -H -u 1000
RUN apk add sqlite

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir waitress

COPY . .

RUN mkdir -p /app/data && chmod 1777 /app/data

USER user
CMD ["./start.sh"]
