FROM node:12
# docker build -t neuro-task-starter .
# docker run -v /tmp/data:/data neuro-task-starter

WORKDIR /code

ENV DEBIAN_FRONTEND noninteractive
ENV SKIP_PREFLIGHT_CHECK=true
RUN apt-get update && apt-get install -y libnss3-dev \
                                         libgtk-3-dev \
                                         libxss1 \
                                         libasound2

RUN mkdir -p /data
COPY package.json /code/package.json
RUN npm install

COPY . /code
RUN npm install
RUN npm audit fix

ENTRYPOINT ["/bin/bash"]
CMD ["convert/expfactory-it", "/data"]
