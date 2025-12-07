FROM node:20-alpine

WORKDIR /app

# We don't copy package.json yet because it doesn't exist.
# This Dockerfile is for the running container.
# We will mount the volume.

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
