FROM denoland/deno:latest
WORKDIR /app
USER deno
COPY src .
COPY create-container.sh .
RUN deno cache deps.ts
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-run", "index.ts"]
