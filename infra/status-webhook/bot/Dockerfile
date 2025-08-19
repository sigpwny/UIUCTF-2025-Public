FROM python:3.12-alpine

RUN adduser user -D -H -u 1000

RUN pip install requests

COPY main.py server_types.py /

ENV POLL_INTERVAL=15
ENV STATUS_SERVER_URL=http://status-server.default.svc.cluster.local

USER user
CMD ["python", "main.py"]
