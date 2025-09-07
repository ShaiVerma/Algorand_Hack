FROM continuumio/miniconda3

WORKDIR /app

COPY . /app
COPY ../DaiZ-contracts/requirements.txt /app/requirements.txt

RUN conda create -n algorand-env python=3.13 -y \
    && conda init bash \
    && /bin/bash -c "conda activate algorand-env" \
    && pip install --no-cache-dir -r requirements.txt

SHELL ["conda", "run", "-n", "algorand-env", "/bin/bash", "-c"]

EXPOSE 4000

CMD ["python", "api.py"]
