FROM python:3.8-alpine3.10

LABEL description="Release build configuration tool"
LABEL maintainer="Sergei Gordeichuk <gordeychuk.s@gmail.com>"

ENV PYTHONUNBUFFERED 1

RUN mkdir -p /code
WORKDIR /code
ADD . /code/

RUN apk update \
  && apk add --virtual build-deps gcc python3-dev musl-dev \
  && apk add postgresql-dev \
  && apk add nodejs-current \
  && apk add yarn \
  && pip install -r requirements.txt \
  && apk del build-deps

WORKDIR /code/rebuc-frontend
RUN yarn upgrade
RUN yarn install

WORKDIR /code
