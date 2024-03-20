FROM node:18.13.0 as build-step

RUN mkdir /app
WORKDIR /app

# restore packages
COPY package.json /app
RUN npm install

COPY . /app

# build app
RUN npm run build:prod

FROM nginx

# copy build artificate to nginx server
COPY --from=build-step /app/dist/it.web/browser /data/www/

# copy nginx custom configurations to relevent folders
COPY /nginx/customconfig.conf /etc/nginx/conf.d/customconfig.conf
COPY /nginx/nginx.conf /etc/nginx/nginx.conf

RUN chmod -R 755 /data/www

EXPOSE 80