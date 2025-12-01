FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

# Install system deps: Poppler (pdftoppm), Tesseract OCR, and PostgreSQL client
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       poppler-utils \
       tesseract-ocr \
       libtesseract-dev \
       postgresql-client \
       wget \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/documentunderstand

# Default user (vscode) is provided by base image
CMD ["sleep", "infinity"]
