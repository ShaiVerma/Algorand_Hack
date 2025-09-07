FROM continuumio/miniconda3:latest

WORKDIR /app

COPY DaiZ-contracts/requirements.txt /app/requirements.txt
COPY DaiZ-backend /app

# Create the environment and install python + dependencies
RUN conda create -n algorand-env python=3.13 -y \
    && conda run -n algorand-env pip install --no-cache-dir -r requirements.txt

# Use conda run to execute scripts
CMD ["conda", "run", "-n", "algorand-env", "python", "api.py"]
