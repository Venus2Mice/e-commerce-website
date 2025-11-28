#React app image
FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./

# Remove package-lock.json and regenerate with overrides
# The preinstall script in package.json will run npm-force-resolutions
RUN rm -f package-lock.json && npm install

COPY . .

# Set API URL for build
ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:latest AS prod

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
