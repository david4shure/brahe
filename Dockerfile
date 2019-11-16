FROM nginx:stable
COPY . /var/www
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
CMD ["nginx"]
