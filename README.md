# gochat-client
![GoChat Client CI/CD pipeline. Build -> Docker -> Publish -> AWS Deploy](https://github.com/gtinside/gochat-client/workflows/GoChat%20Client%20CI/CD%20pipeline.%20Build%20-%3E%20Docker%20-%3E%20Publish%20-%3E%20AWS%20Deploy/badge.svg)

GoChat is a web based chat application designed using Golang

#### Core Components
<hr/>

1. [GoChat Server](https://github.com/gtinside/gochat)
2. Web Server

This repository is for the Web Server. This web server expects the GoChat Server to be running on **localhost:8090**. 
To read more about the architecture, visit my blog [GoChat Architecture](https://gauravtiwari.blog/2020/05/18/gochat-yet-another-chat-application)

#### Requirements
<hr/>

1. Docker
2. Tested on Mac OSX, Ubuntu 14.X, CentOS 6.X
3. Node.js version 12.16.3
3. Node.js Package Manager
5. [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

#### Getting Started
<hr/>

##### Before Build
If you don't have requirements prepared, install it. The installation method may vary according to your environment. Refer to the documentation accordingly.

##### Build
```
git clone https://github.com/gtinside/gochat
docker build --tag gochat-client:latest .
docker run -p 80:80 gochat-client
```
The Node server gets started on port 80. Navigate to **http://localhost** to access the sign in page.
 
To compile and run locally, execute the following from within project directory to start the server on **port 80**: 
```
npm install
node index.js
```
**Please make sure the GoChat server is up and running before you perform any operation on the UI**

#### Packaging & Deployment
<hr/>

Refer to the [Workflow](https://github.com/gtinside/gochat-client/blob/master/.github/workflows/docker_aws_publish.yml) file for build and deployment details. 
Following workflows are embedded in it:
1. Image build and publish to Github package registry
2. Image build and publish to [Docker public registry](https://hub.docker.com/repository/docker/gtinside/gochat-client)
3. Refresh of AWS ECS Service. I have hardcoded the ECS Cluster and Deployment Service name for now.

#### Templates
All the UI pages are Pug templates rendered while serving the response. Refer to **views** directory for more details.

![Login](/pictures/login.png)

![Friend List](/pictures/friend.png)

![Chat](/pictures/Chat.png) 

